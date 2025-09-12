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

  const fetchGitHubActivity = async (token: string, username: string): Promise<{ activityData: ActivityDay[], activitySummary: ActivitySummary }> => {
    try {
      // Use GitHub's GraphQL API to get real contribution data
      const query = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }
      `;

      const graphqlResponse = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { username }
        })
      });

      if (!graphqlResponse.ok) {
        throw new Error(`GraphQL API error: ${graphqlResponse.status}`);
      }

      const graphqlData = await graphqlResponse.json();
      
      if (graphqlData.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(graphqlData.errors)}`);
      }

      const contributionCalendar = graphqlData.data?.user?.contributionsCollection?.contributionCalendar;
      
      if (!contributionCalendar) {
        throw new Error('No contribution data available');
      }

      // Process the real GitHub contribution data
      const activityData: ActivityDay[] = [];
      let totalContributions = 0;
      
      // Flatten the weeks and days into a single array
      contributionCalendar.weeks.forEach((week: any) => {
        week.contributionDays.forEach((day: any) => {
          const count = day.contributionCount;
          totalContributions += count;
          
          // Calculate intensity level (0-4) based on GitHub's scale
          let level = 0;
          if (count > 0) {
            if (count >= 20) level = 4;
            else if (count >= 10) level = 3;
            else if (count >= 5) level = 2;
            else level = 1;
          }
          
          activityData.push({
            date: day.date,
            count,
            level
          });
        });
      });

      // Calculate statistics from real data
      const activeDays = activityData.filter(day => day.count > 0);
      const totalDaysActive = activeDays.length;
      const maxDailyActivity = Math.max(...activityData.map(day => day.count));
      const avgDailyActivity = totalDaysActive > 0 ? totalContributions / totalDaysActive : 0;
      
      // Calculate current streak (from today backwards)
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      const sortedData = [...activityData]
        .filter(day => day.date <= today)
        .sort((a, b) => b.date.localeCompare(a.date));
      
      for (const day of sortedData) {
        if (day.count > 0) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      
      for (const day of activityData.sort((a, b) => a.date.localeCompare(b.date))) {
        if (day.count > 0) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }
      
      const activitySummary: ActivitySummary = {
        totalActivity: totalContributions,
        totalDaysActive,
        maxDailyActivity,
        avgDailyActivity,
        currentStreak,
        longestStreak
      };
      
      return { 
        activityData: activityData.sort((a, b) => a.date.localeCompare(b.date)), 
        activitySummary 
      };
      
    } catch (error) {
      // Error fetching GitHub GraphQL activity
      
      // Fallback to REST API approach if GraphQL fails
      try {
        
        // Get the last 365 days for a full year view
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 365);
        
        // Initialize activity map
        const activityMap: { [key: string]: number } = {};
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          activityMap[dateStr] = 0;
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        let totalContributions = 0;
        
        // Try to get recent events for basic activity estimation
        try {
          const events = await fetchFromGitHub(`/users/${username}/events?per_page=100`, token);
          
          events.forEach((event: any) => {
            const eventDate = new Date(event.created_at);
            if (eventDate >= startDate && eventDate <= endDate) {
              const dateStr = eventDate.toISOString().split('T')[0];
              if (activityMap.hasOwnProperty(dateStr)) {
                let weight = 1;
                switch (event.type) {
                  case 'PushEvent':
                    weight = event.payload?.commits?.length || 1;
                    break;
                  case 'CreateEvent':
                    weight = 2;
                    break;
                  case 'PullRequestEvent':
                    weight = 3;
                    break;
                  default:
                    weight = 1;
                }
                activityMap[dateStr] += weight;
                totalContributions += weight;
              }
            }
          });
        } catch (eventsError) {
          // Events API also unavailable
        }
        
        // Convert to ActivityDay array
        const activityData: ActivityDay[] = [];
        const activityCounts = Object.values(activityMap);
        const maxActivity = Math.max(...activityCounts, 1);
        
        Object.entries(activityMap).forEach(([date, count]) => {
          let level = 0;
          if (count > 0) {
            const percentage = count / maxActivity;
            if (percentage >= 0.8) level = 4;
            else if (percentage >= 0.6) level = 3;
            else if (percentage >= 0.4) level = 2;
            else level = 1;
          }
          
          activityData.push({ date, count, level });
        });
        
        // Calculate basic statistics
        const activeDays = activityData.filter(day => day.count > 0);
        const totalDaysActive = activeDays.length;
        const maxDailyActivity = Math.max(...activityCounts);
        const avgDailyActivity = totalDaysActive > 0 ? totalContributions / totalDaysActive : 0;
        
        const activitySummary: ActivitySummary = {
          totalActivity: totalContributions,
          totalDaysActive,
          maxDailyActivity,
          avgDailyActivity,
          currentStreak: 0,
          longestStreak: 0
        };
        
        return { 
          activityData: activityData.sort((a, b) => a.date.localeCompare(b.date)), 
          activitySummary 
        };
        
      } catch (fallbackError) {
        // Both GraphQL and REST API failed, return empty data
        
        // Return empty data with proper date range
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
    }
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

      // Fetch activity data
      const { activityData, activitySummary } = await fetchGitHubActivity(token, profile.login);

      const githubData: GitHubData = {
        profile,
        stats: {
          totalRepos: profile.public_repos,
          totalStars,
          totalCommits,
          topLanguages,
        },
        recentRepos,
        activityData,
        activitySummary,
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
