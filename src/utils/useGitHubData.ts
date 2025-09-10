import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { GitHubCacheManager } from './cacheManager';

interface GitHubProfile {
  id: number;
  login: string;
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
    
    // GitHub OAuth tokens cannot be refreshed programmatically
    // The user must go through the complete OAuth flow again
    if (!token) {
      throw new Error('GITHUB_TOKEN_EXPIRED');
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

  const loadCachedData = async () => {
    if (!user) return null;

    try {
      const { data: cachedData, error: cacheError } = await supabase
        .from('user_platform_data')
        .select('data, last_updated')
        .eq('user_id', user.id)
        .eq('platform', 'github')
        .single();

      if (cacheError) {
        return null;
      }

      if (cachedData) {
        setData(cachedData.data);
        return cachedData;
      }
    } catch (err) {
      // Cache read failed
    }
    
    return null;
  };

  const fetchFreshGitHubData = async () => {
    if (!user) return;

    try {
      // Get GitHub token
      const token = await getGitHubToken();

      // Fetch user profile
      const profile = await fetchFromGitHub('/user', token);

      // Fetch repositories (limited to 100 for performance)
      const repositories = await fetchFromGitHub('/user/repos?per_page=100&sort=updated&type=all', token);

      // Calculate language statistics
      const languages: Record<string, number> = {};
      repositories.forEach((repo: GitHubRepo) => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      });

      // Sort languages by usage count
      const topLanguages: [string, number][] = Object.entries(languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // Calculate total stars
      const totalStars = repositories.reduce((sum: number, repo: GitHubRepo) => sum + repo.stargazers_count, 0);

      // For commits, we'll use a simple estimation based on repos
      // (Getting exact commit count would require many API calls and could hit rate limits)
      const totalCommits = repositories.length * 15; // Rough estimate

      // Get recent repositories (top 6)
      const recentRepos = repositories
        .sort((a: GitHubRepo, b: GitHubRepo) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 6)
        .map((repo: GitHubRepo) => ({
          name: repo.name,
          description: repo.description || 'No description available',
          language: repo.language || 'Unknown',
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updated_at: repo.updated_at,
          html_url: repo.html_url,
        }));

      const githubData: GitHubData = {
        profile,
        stats: {
          totalRepos: profile.public_repos,
          totalStars,
          totalCommits,
          topLanguages,
        },
        recentRepos,
      };

      // Cache the data
      try {
        const { error: cacheError } = await supabase
          .from('user_platform_data')
          .upsert({
            user_id: user.id,
            platform: 'github',
            data: githubData,
            last_updated: new Date().toISOString(),
          }, { 
            onConflict: 'user_id,platform',
            ignoreDuplicates: false 
          });

        if (cacheError) {
          console.error('Cache write error:', cacheError);
        }
      } catch (err) {
        console.error('Cache write failed:', err);
      }

      return githubData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch GitHub data';
      console.error('GitHub data fetch error:', err);
      
      // Set different error states based on the error type
      if (errorMessage === 'GITHUB_TOKEN_EXPIRED') {
        setError('github_token_expired');
      } else if (errorMessage.includes('token expired') || errorMessage.includes('token not found')) {
        setError('github_token_expired');
      } else {
        setError(errorMessage);
      }
      
      throw new Error(errorMessage);
    }
  };

  const fetchGitHubData = async (forceRefresh = false) => {
    if (!user) return;

    // If not forcing refresh, try to load cached data first
    if (!forceRefresh) {
      const cached = await loadCachedData();
      if (cached) {
        const lastUpdated = new Date(cached.last_updated);
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000); // Changed from 1 hour to 6 hours
        
        // If cached data is less than 6 hours old, don't fetch fresh data
        if (lastUpdated > sixHoursAgo) {
          return cached.data;
        }
      }
    }

    // Fetch fresh data
    return await fetchFreshGitHubData();
  };

  const refreshData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const freshData = await fetchFreshGitHubData();
      if (freshData) {
        setData(freshData);
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data';
      setError(errorMessage);
      
      // Re-throw the error so it can be caught by the calling function
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load cached data immediately when component mounts
  useEffect(() => {
    if (user) {
      setLoading(true);
      loadCachedData().then((cached) => {
        if (cached) {
          // Always show cached data first for instant loading
          setData(cached.data);
          setLoading(false);
          
          // Check if data is stale and auto-refresh in background
          const lastUpdated = new Date(cached.last_updated);
          const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours threshold
          
          if (lastUpdated < twoHoursAgo) {
            // Data is stale - refresh in background without loading state
            setBackgroundRefreshing(true);
            fetchFreshGitHubData().then((freshData) => {
              if (freshData) {
                setData(freshData);
                // Show subtle notification that data was refreshed
                toast.success('GitHub data refreshed automatically', { 
                  duration: 3000,
                  description: 'Your stats have been updated with the latest information'
                });
              }
            }).catch((err) => {
              // Background refresh failed silently - cached data is still valid
            }).finally(() => {
              setBackgroundRefreshing(false);
            });
          }
        } else {
          // No cached data, try to fetch fresh data if we have a token
          getGitHubToken().then(() => {
            // If we have a token but no cached data, fetch fresh data
            fetchFreshGitHubData().then((freshData) => {
              if (freshData) {
                setData(freshData);
              }
              setLoading(false);
            }).catch((err) => {
              setError(err.message);
              setLoading(false);
            });
          }).catch(() => {
            // No token available, user needs to connect GitHub
            setLoading(false);
          });
        }
      });
    } else {
      // Clear data when user logs out
      setData(null);
      setError(null);
      setLoading(false);
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
