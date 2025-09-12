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

interface ActivityDay {
  date: string;
  count: number;
  level: number; // 0-4 scale for intensity
}

interface ActivitySummary {
  totalActivity: number;
  totalDaysActive: number;
  maxDailyActivity: number;
  avgDailyActivity: number;
  currentStreak: number;
  longestStreak: number;
}

interface GitHubData {
  profile: GitHubProfile;
  stats: GitHubStats;
  recentRepos: ProcessedGitHubRepo[];
  activityData?: ActivityDay[];
  activitySummary?: ActivitySummary;
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

  const fetchGitHubActivity = async (token: string, username: string): Promise<{ activityData: ActivityDay[], activitySummary: ActivitySummary }> => {
    try {
      // Fetch user events from GitHub API (up to 300 recent events)
      const events = await fetchFromGitHub(`/users/${username}/events?per_page=100`, token);
      
      // Get the last 365 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 365);
      
      // Initialize activity map for all days in the past year
      const activityMap: { [key: string]: number } = {};
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        activityMap[dateStr] = 0;
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Count activities by date
      let totalActivity = 0;
      events.forEach((event: any) => {
        const eventDate = new Date(event.created_at);
        const dateStr = eventDate.toISOString().split('T')[0];
        
        // Only count relevant activity types
        const relevantTypes = [
          'PushEvent',
          'PullRequestEvent', 
          'IssuesEvent',
          'CreateEvent',
          'ReleaseEvent',
          'ForkEvent',
          'WatchEvent',
          'IssueCommentEvent',
          'PullRequestReviewEvent'
        ];
        
        if (relevantTypes.includes(event.type) && activityMap.hasOwnProperty(dateStr)) {
          // Weight different event types differently
          let weight = 1;
          switch (event.type) {
            case 'PushEvent':
              weight = event.payload?.size || 1; // Number of commits in push
              break;
            case 'PullRequestEvent':
              weight = 3;
              break;
            case 'CreateEvent':
              weight = 2;
              break;
            case 'ReleaseEvent':
              weight = 4;
              break;
            default:
              weight = 1;
          }
          
          activityMap[dateStr] += weight;
          totalActivity += weight;
        }
      });
      
      // Convert to ActivityDay array and calculate levels
      const activityData: ActivityDay[] = [];
      const activityCounts = Object.values(activityMap);
      const maxActivity = Math.max(...activityCounts);
      
      Object.entries(activityMap).forEach(([date, count]) => {
        // Calculate intensity level (0-4)
        let level = 0;
        if (count > 0) {
          if (maxActivity <= 1) {
            level = count > 0 ? 1 : 0;
          } else {
            const percentage = count / maxActivity;
            if (percentage >= 0.75) level = 4;
            else if (percentage >= 0.5) level = 3;
            else if (percentage >= 0.25) level = 2;
            else level = 1;
          }
        }
        
        activityData.push({ date, count, level });
      });
      
      // Calculate statistics
      const activeDays = activityData.filter(day => day.count > 0);
      const totalDaysActive = activeDays.length;
      const maxDailyActivity = Math.max(...activityCounts);
      const avgDailyActivity = totalDaysActive > 0 ? totalActivity / totalDaysActive : 0;
      
      // Calculate streaks
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      // Start from most recent day and work backwards for current streak
      const sortedData = [...activityData].reverse();
      for (let i = 0; i < sortedData.length; i++) {
        if (sortedData[i].count > 0) {
          tempStreak++;
          if (i === currentStreak) {
            currentStreak = tempStreak;
          }
        } else {
          if (i === currentStreak) {
            currentStreak = 0;
          }
          tempStreak = 0;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      }
      
      const activitySummary: ActivitySummary = {
        totalActivity,
        totalDaysActive,
        maxDailyActivity,
        avgDailyActivity,
        currentStreak,
        longestStreak
      };
      
      return { activityData: activityData.sort((a, b) => a.date.localeCompare(b.date)), activitySummary };
      
    } catch (error) {
      console.error('Error fetching GitHub activity:', error);
      // Return empty activity data if fetch fails
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 365);
      
      const emptyActivityData: ActivityDay[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        emptyActivityData.push({
          date: currentDate.toISOString().split('T')[0],
          count: 0,
          level: 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return {
        activityData: emptyActivityData,
        activitySummary: {
          totalActivity: 0,
          totalDaysActive: 0,
          maxDailyActivity: 0,
          avgDailyActivity: 0,
          currentStreak: 0,
          longestStreak: 0
        }
      };
    }
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
        // No cached GitHub data found
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
        // GitHub data cached successfully
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

      // Fetch activity data
      const { activityData, activitySummary } = await fetchGitHubActivity(token, profile.login);

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
        activityData,
        activitySummary,
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
                // Background refresh failed
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
