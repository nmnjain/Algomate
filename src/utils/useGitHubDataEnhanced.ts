import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { GitHubCacheManager } from './cacheManager';

interface GitHubProfile {
  login: string;
  id: number;
  name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  updated_at: string;
}

interface ProcessedGitHubRepo {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updated_at: string;
  html_url: string;
}

interface GitHubStats {
  totalRepos: number;
  totalStars: number;
  totalCommits: number;
  topLanguages: [string, number][];
}

interface GitHubData {
  profile: GitHubProfile;
  stats: GitHubStats;
  recentRepos: ProcessedGitHubRepo[];
}

export function useGitHubData() {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(false);
  const [backgroundRefreshing, setBackgroundRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{
    exists: boolean;
    ageInHours: number | null;
    isStale: boolean;
  }>({ exists: false, ageInHours: null, isStale: false });
  const { user } = useAuth();

  const getGitHubToken = async () => {
    // Get the current session to check for provider token
    const { data: session } = await supabase.auth.getSession();
    
    // Try multiple places where the token might be stored
    const token = user?.user_metadata?.provider_token || 
                  session?.session?.provider_token ||
                  user?.user_metadata?.provider_access_token ||
                  session?.session?.user?.user_metadata?.provider_token;
    
    if (!token) {
      throw new Error('GitHub token not found. Please reconnect your GitHub account.');
    }
    return token;
  };

  const fetchFromGitHub = async (endpoint: string, token: string) => {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'TechConnect-App',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('GitHub token expired. Please reconnect your account.');
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  };

  const calculateCommitCount = (repos: GitHubRepo[]): number => {
    // For now, estimate commits as repos * average commits per repo
    // In a real app, you'd make separate API calls to get actual commit counts
    return repos.length * 15; // Rough estimate
  };

  const getTopLanguages = (repos: GitHubRepo[]): [string, number][] => {
    const languageCount: { [key: string]: number } = {};
    
    repos.forEach(repo => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }
    });

    return Object.entries(languageCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const loadCachedData = async () => {
    if (!user) return null;

    try {
      const { data: cachedData, error } = await supabase
        .from('user_platform_data')
        .select('data, last_updated')
        .eq('user_id', user.id)
        .eq('platform', 'github')
        .single();

      if (error) {
        console.log('No cached GitHub data found');
        return null;
      }

      return cachedData;
    } catch (err) {
      console.error('Error loading cached data:', err);
      return null;
    }
  };

  const saveCachedData = async (githubData: GitHubData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_platform_data')
        .upsert({
          user_id: user.id,
          platform: 'github',
          data: githubData,
          last_updated: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving cached data:', error);
      } else {
        console.log('GitHub data cached successfully at:', new Date().toISOString());
      }
    } catch (err) {
      console.error('Error saving cached data:', err);
    }
  };

  const fetchFreshGitHubData = async (): Promise<GitHubData> => {
    try {
      const token = await getGitHubToken();

      // Fetch profile data
      const profile = await fetchFromGitHub('/user', token);
      
      // Fetch repositories
      const repos = await fetchFromGitHub('/user/repos?sort=updated&per_page=100', token);

      // Calculate stats
      const totalStars = repos.reduce((sum: number, repo: GitHubRepo) => sum + repo.stargazers_count, 0);
      const totalCommits = calculateCommitCount(repos);
      const topLanguages = getTopLanguages(repos);

      // Process recent repos (top 6 by stars and recent activity)
      const recentRepos = repos
        .sort((a: GitHubRepo, b: GitHubRepo) => {
          // Sort by a combination of stars and recency
          const aScore = a.stargazers_count + (new Date(a.updated_at).getTime() / 1000000000);
          const bScore = b.stargazers_count + (new Date(b.updated_at).getTime() / 1000000000);
          return bScore - aScore;
        })
        .slice(0, 6)
        .map((repo: GitHubRepo) => ({
          name: repo.name,
          description: repo.description || '',
          language: repo.language || 'Unknown',
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updated_at: repo.updated_at,
          html_url: repo.html_url,
        }));

      const githubData: GitHubData = {
        profile: {
          login: profile.login,
          id: profile.id,
          name: profile.name || profile.login,
          avatar_url: profile.avatar_url,
          bio: profile.bio || '',
          public_repos: profile.public_repos,
          followers: profile.followers,
          following: profile.following,
          created_at: profile.created_at,
        },
        stats: {
          totalRepos: repos.length,
          totalStars,
          totalCommits,
          topLanguages,
        },
        recentRepos,
      };

      // Save to cache
      await saveCachedData(githubData);

      return githubData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch GitHub data';
      console.error('GitHub data fetch error:', err);
      throw new Error(errorMessage);
    }
  };

  const fetchGitHubData = async (forceRefresh = false) => {
    if (!user) return;

    try {
      // Always clean very old cache first
      await GitHubCacheManager.cleanOldCache(user.id);

      // Get cache freshness info
      const freshness = await GitHubCacheManager.getCacheFreshness(user.id);
      setCacheInfo({
        exists: freshness.exists,
        ageInHours: freshness.ageInHours,
        isStale: freshness.isStale,
      });

      // If force refresh requested, delete cache first
      if (forceRefresh && freshness.exists) {
        await GitHubCacheManager.forceRefresh(user.id);
      }

      // If not forcing refresh, try to load cached data first
      if (!forceRefresh && freshness.exists) {
        const cached = await loadCachedData();
        if (cached) {
          // Show cached data immediately
          setData(cached.data);
          
          // If cache is stale, refresh in background
          if (freshness.isStale) {
            setBackgroundRefreshing(true);
            setTimeout(async () => {
              try {
                const freshData = await fetchFreshGitHubData();
                if (freshData) {
                  setData(freshData);
                  
                  // Update cache info after background refresh
                  const updatedFreshness = await GitHubCacheManager.getCacheFreshness(user.id);
                  setCacheInfo({
                    exists: updatedFreshness.exists,
                    ageInHours: updatedFreshness.ageInHours,
                    isStale: updatedFreshness.isStale,
                  });
                  
                  toast.success('GitHub data refreshed automatically', { 
                    duration: 3000,
                    description: 'Your stats have been updated with the latest information'
                  });
                }
              } catch (err) {
                console.log('Background refresh failed:', err);
              } finally {
                setBackgroundRefreshing(false);
              }
            }, 1000);
          }
          return cached.data;
        }
      }

      // Fetch fresh data
      const freshData = await fetchFreshGitHubData();
      if (freshData) {
        // Update cache info after fetching fresh data
        const updatedFreshness = await GitHubCacheManager.getCacheFreshness(user.id);
        setCacheInfo({
          exists: updatedFreshness.exists,
          ageInHours: updatedFreshness.ageInHours,
          isStale: updatedFreshness.isStale,
        });
      }
      return freshData;
    } catch (err) {
      console.error('Error in fetchGitHubData:', err);
      throw err;
    }
  };

  const refreshData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Force refresh - this will delete cache and fetch fresh data
      const freshData = await fetchGitHubData(true); // Force refresh
      if (freshData) {
        setData(freshData);
        
        // Update cache info after refresh
        const freshness = await GitHubCacheManager.getCacheFreshness(user.id);
        setCacheInfo({
          exists: freshness.exists,
          ageInHours: freshness.ageInHours,
          isStale: freshness.isStale,
        });
        
        toast.success('GitHub data refreshed successfully');
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
      toast.error('Failed to refresh GitHub data');
    } finally {
      setLoading(false);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      setLoading(true);
      setError(null);
      
      fetchGitHubData(false).then((result) => {
        if (result) {
          setData(result);
        }
        setLoading(false);
      }).catch((err) => {
        console.error('Error loading GitHub data:', err);
        setError(err.message);
        setLoading(false);
      });
    } else {
      // Clear data when user logs out
      setData(null);
      setError(null);
      setLoading(false);
      setCacheInfo({ exists: false, ageInHours: null, isStale: false });
    }
  }, [user]);

  return {
    data,
    loading,
    backgroundRefreshing,
    error,
    cacheInfo,
    refetch: refreshData,
    fetchInitial: () => fetchGitHubData(false),
    forceRefresh: () => refreshData(), // Alias for force refresh
  };
}
