import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

// LeetCode API Base URL from environment variables
const LEETCODE_API_BASE = import.meta.env.VITE_LEETCODE_API_BASE_URL || 'https://myleetcodeapi-98392092765.asia-south1.run.app';

// Type definitions based on alfa-leetcode-api responses
interface LeetCodeProfile {
  username: string;
  name: string;
  avatar: string;
  ranking: number;
  reputation: number;
  gitHub?: string;
  twitter?: string;
  linkedIN?: string;
  website?: string[];
  country?: string;
  company?: string;
  school?: string;
  skillTags?: string[];
  about?: string;
}

interface LeetCodeStats {
  totalSolved: number;
  totalSubmissions: {
    difficulty: string;
    count: number;
    submissions: number;
  }[];
  totalQuestions: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  contributionPoint: number;
  reputation: number;
}

interface LeetCodeSubmission {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: string | number;
  statusDisplay: string;
  lang: string;
  langVerboseName: string;
  runtime: string;
  url: string;
  isPending: string;
  memory: string;
}

interface LeetCodeContest {
  attended: boolean;
  rating: number;
  globalRanking: number;
  totalParticipants: number;
  trendDirection: string;
  problemsSolved: number;
  totalProblems: number;
  finishTimeInSeconds: number;
  contest: {
    title: string;
    startTime: number;
  };
}

interface LeetCodeCalendarDay {
  date: string;
  submissionCount: number;
  level: number; // 0-4 intensity level
}

interface LeetCodeLanguageStats {
  languageName: string;
  problemsSolved: number;
}

interface LeetCodeBadge {
  id: string;
  displayName: string;
  icon: string;
  creationDate: string;
}

interface LeetCodeSkillStats {
  tagName: string;
  tagSlug: string;
  problemsSolved: number;
}

interface LeetCodeContestRanking {
  globalRanking: number;
  totalParticipants: number;
  attendedContestsCount: number;
  rating: number;
  topPercentage: number;
}

interface LeetCodeData {
  profile: LeetCodeProfile;
  stats: LeetCodeStats;
  recentSubmissions: LeetCodeSubmission[];
  contestHistory: LeetCodeContest[];
  calendar: LeetCodeCalendarDay[];
  languageStats: LeetCodeLanguageStats[];
  badges: LeetCodeBadge[];
  skillStats: LeetCodeSkillStats[];
  contestRanking?: LeetCodeContestRanking | null;
  yearlyCalendar?: any | null;
}

export function useLeetCodeData() {
  const [data, setData] = useState<LeetCodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [backgroundRefreshing, setBackgroundRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const { user } = useAuth();

  // Simple fetch from your LeetCode API server
  const fetchFromLeetCodeAPI = async (endpoint: string): Promise<any> => {
    const response = await fetch(`${LEETCODE_API_BASE}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TechConnect-App',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('LeetCode user not found. Please check your username.');
      }
      throw new Error(`LeetCode API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  };

  // Process calendar data to match our format
  const processCalendarData = (calendarData: any): LeetCodeCalendarDay[] => {
    if (!calendarData) {
      return [];
    }

    let submissionCalendar: any = {};
    
    // Handle yearlyCalendar format (nested structure)
    if (calendarData.data?.matchedUser?.userCalendar?.submissionCalendar) {
      const yearlyData = calendarData.data.matchedUser.userCalendar.submissionCalendar;
      
      if (typeof yearlyData === 'string') {
        try {
          submissionCalendar = JSON.parse(yearlyData);
        } catch (error) {
          console.error('❌ Error parsing yearly calendar data:', error);
          return [];
        }
      } else {
        submissionCalendar = yearlyData;
      }
    }
    // Fallback: Handle direct submissionCalendar at matchedUser level
    else if (calendarData.data?.matchedUser?.submissionCalendar) {
      const yearlyData = calendarData.data.matchedUser.submissionCalendar;
      
      if (typeof yearlyData === 'string') {
        try {
          submissionCalendar = JSON.parse(yearlyData);
        } catch (error) {
          console.error('❌ Error parsing fallback yearly calendar data:', error);
          return [];
        }
      } else {
        submissionCalendar = yearlyData;
      }
    }
    // Handle direct submissionCalendar object (from your API)
    else if (calendarData.submissionCalendar && typeof calendarData.submissionCalendar === 'object') {
      submissionCalendar = calendarData.submissionCalendar;
    }
    // Handle string format (JSON encoded)
    else if (calendarData.submissionCalendar && typeof calendarData.submissionCalendar === 'string') {
      try {
        submissionCalendar = JSON.parse(calendarData.submissionCalendar);
      } catch (error) {
        console.error('❌ Error parsing calendar data:', error);
        return [];
      }
    }
    else {
      // No valid calendar data found
    }

    // Create full year calendar (2025)
    
    const calendarArray: LeetCodeCalendarDay[] = [];
    
    // Show full 2025 calendar from January 1st to December 31st
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-12-31');
    
    const currentDate = new Date(startDate);
    let foundSubmissions = 0;
    
    while (currentDate <= endDate) {
      const timestamp = Math.floor(currentDate.getTime() / 1000).toString();
      const submissionCount = submissionCalendar[timestamp] || 0;
      
      if (submissionCount > 0) {
        foundSubmissions++;
      }
      
      // Calculate intensity level (0-4) based on submission count
      let level = 0;
      if (submissionCount > 0) {
        if (submissionCount >= 10) level = 4;
        else if (submissionCount >= 5) level = 3;
        else if (submissionCount >= 3) level = 2;
        else level = 1;
      }
      
      calendarArray.push({
        date: currentDate.toISOString().split('T')[0],
        submissionCount,
        level
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return calendarArray;
  };

  // Fetch fresh LeetCode data with parallel calls for optimal performance
  const fetchFreshLeetCodeData = async (leetcodeUsername: string) => {
    try {
      // Fetch all data in parallel for maximum performance
      const [
        profileResponse,
        solvedResponse,
        contestResponse,
        submissionsResponse,
        calendarResponse,
        languageStatsResponse,
        badgesResponse,
        skillStatsResponse,
        contestRankingResponse,
        yearlyCalendarResponse
      ] = await Promise.allSettled([
        fetchFromLeetCodeAPI(`/userProfile/${leetcodeUsername}`),
        fetchFromLeetCodeAPI(`/${leetcodeUsername}/solved`),
        fetchFromLeetCodeAPI(`/${leetcodeUsername}/contest`),
        fetchFromLeetCodeAPI(`/${leetcodeUsername}/submission?limit=50`), // Back to 50 for better analytics
        fetchFromLeetCodeAPI(`/${leetcodeUsername}/calendar`),
        fetchFromLeetCodeAPI(`/languageStats?username=${leetcodeUsername}`),
        fetchFromLeetCodeAPI(`/${leetcodeUsername}/badges`),
        fetchFromLeetCodeAPI(`/skillStats/${leetcodeUsername}`),
        fetchFromLeetCodeAPI(`/userContestRankingInfo/${leetcodeUsername}`),
        fetchFromLeetCodeAPI(`/userProfileCalendar?username=${leetcodeUsername}&year=2025`)
      ]);

      // Extract successful responses
      const profile = profileResponse.status === 'fulfilled' ? profileResponse.value : null;
      const solved = solvedResponse.status === 'fulfilled' ? solvedResponse.value : null;
      const contest = contestResponse.status === 'fulfilled' ? contestResponse.value : null;
      const submissions = submissionsResponse.status === 'fulfilled' ? submissionsResponse.value?.submission || [] : [];
      const calendar = calendarResponse.status === 'fulfilled' ? calendarResponse.value : null;
      

      // Extract language stats with flexible data access
      const extractLanguageStats = (langResponse: any) => {
        if (!langResponse) return [];
        
        // Try different possible structures
        const languageArray = langResponse.matchedUser?.languageProblemCount || 
                             langResponse.languageProblemCount || 
                             langResponse.data || 
                             langResponse;
        
        if (!Array.isArray(languageArray)) {
          return [];
        }

        return languageArray.map((lang: any) => ({
          languageName: lang.languageName || lang.name || 'Unknown',
          problemsSolved: lang.problemsSolved || lang.count || 0,
        }));
      };

      const languageStatsProcessed = languageStatsResponse.status === 'fulfilled' ? 
        extractLanguageStats(languageStatsResponse.value) : [];
      const badges = badgesResponse.status === 'fulfilled' ? badgesResponse.value?.badges || [] : [];
      const skillStats = skillStatsResponse.status === 'fulfilled' ? skillStatsResponse.value?.data?.matchedUser?.tagProblemCounts?.advanced || [] : [];
      const contestRanking = contestRankingResponse.status === 'fulfilled' ? contestRankingResponse.value : null;
      const yearlyCalendar = yearlyCalendarResponse.status === 'fulfilled' ? yearlyCalendarResponse.value : null;

      if (!profile) {
        throw new Error('Failed to fetch LeetCode profile. User might not exist.');
      }

      // Extract data from the correct nested structure
      const profileData = profile?.profile || profile || {};
      const solvedData = solved?.solved || solved || {};

      const stats: LeetCodeStats = {
        totalSolved: solvedData.solvedProblem || profileData.totalSolved || 0,
        totalSubmissions: profileData.totalSubmissions || [],
        totalQuestions: profileData.totalQuestions || 0,
        easySolved: solvedData.easySolved || profileData.easySolved || 0,
        mediumSolved: solvedData.mediumSolved || profileData.mediumSolved || 0,
        hardSolved: solvedData.hardSolved || profileData.hardSolved || 0,
        ranking: contestRanking?.userContestRanking?.globalRanking || profileData.ranking || 0,
        contributionPoint: profileData.contributionPoint || 0,
        reputation: profileData.reputation || 0,
      };

      // Process calendar data - handle both yearly and regular calendar formats
      const calendarData = processCalendarData(yearlyCalendar || calendar || profileData);

      // Build the complete data object
      const leetcodeData: LeetCodeData = {
        profile: {
          username: leetcodeUsername,
          name: profileData.name || leetcodeUsername,
          avatar: profileData.avatar || '',
          ranking: contestRanking?.userContestRanking?.globalRanking || profileData.ranking || 0,
          reputation: profileData.reputation || 0,
          gitHub: profileData.gitHub,
          twitter: profileData.twitter,
          linkedIN: profileData.linkedIN,
          website: profileData.website,
          country: profileData.country,
          company: profileData.company,
          school: profileData.school,
          skillTags: profileData.skillTags || [],
          about: profileData.about,
        },
        stats,
        recentSubmissions: submissions.slice(0, 50), // Back to 50 for better analytics
        contestHistory: contest?.contestHistory || [],
        calendar: calendarData,
        languageStats: languageStatsProcessed,
        badges: badges.map((badge: any) => ({
          id: badge.id,
          displayName: badge.displayName,
          icon: badge.icon,
          creationDate: badge.creationDate
        })),
        skillStats: skillStats.map((skill: any) => ({
          tagName: skill.tagName,
          tagSlug: skill.tagSlug,
          problemsSolved: skill.problemsSolved
        })),
        contestRanking: contestRanking?.userContestRanking || null,
        yearlyCalendar: yearlyCalendar || null
      };

      // Cache the data
      if (user) {
        try {
          const { error: cacheError } = await supabase
            .from('user_platform_data')
            .upsert({
              user_id: user.id,
              platform: 'leetcode',
              data: leetcodeData,
              last_updated: new Date().toISOString(),
            }, { 
              onConflict: 'user_id,platform',
              ignoreDuplicates: false 
            });

          if (cacheError) {
            console.error('LeetCode cache write error:', cacheError);
          }
        } catch (err) {
          console.error('LeetCode cache write failed:', err);
        }
      }

      return leetcodeData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch LeetCode data';
      console.error('LeetCode data fetch error:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Load cached data
  const loadCachedData = async () => {
    if (!user) return null;

    try {
      const { data: cachedData, error: cacheError } = await supabase
        .from('user_platform_data')
        .select('data, last_updated')
        .eq('user_id', user.id)
        .eq('platform', 'leetcode')
        .single();

      if (cacheError || !cachedData) {
        return null;
      }

      setData(cachedData.data);
      return cachedData;
    } catch (err) {
      console.error('LeetCode cache read failed:', err);
    }
    
    return null;
  };

  // Get LeetCode username from user profile
  const getLeetCodeUsername = async () => {
    if (!user) return null;

    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('leetcode_username')
        .eq('id', user.id)
        .single();

      if (error || !userData?.leetcode_username) {
        return null;
      }

      return userData.leetcode_username;
    } catch (err) {
      return null;
    }
  };

  // Update LeetCode username
  const updateLeetCodeUsername = async (newUsername: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          leetcode_username: newUsername,
          leetcode_connected_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Failed to update LeetCode username:', error);
        return false;
      }

      setUsername(newUsername);
      return true;
    } catch (err) {
      console.error('Failed to update LeetCode username:', err);
      return false;
    }
  };

  // Main fetch function
  const fetchLeetCodeData = async (forceRefresh = false, providedUsername?: string) => {
    const targetUsername = providedUsername || username;
    
    if (!targetUsername) {
      setError('No LeetCode username provided');
      return;
    }

    // If not forcing refresh, try to load cached data first
    if (!forceRefresh) {
      const cached = await loadCachedData();
      if (cached) {
        const lastUpdated = new Date(cached.last_updated);
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        
        // If cached data is less than 6 hours old, don't fetch fresh data
        if (lastUpdated > sixHoursAgo) {
          return cached.data;
        }
      }
    }

    // Fetch fresh data
    return await fetchFreshLeetCodeData(targetUsername);
  };

  // Refresh data function
  const refreshData = async () => {
    if (!username) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const freshData = await fetchFreshLeetCodeData(username);
      if (freshData) {
        setData(freshData);
        toast.success('LeetCode data refreshed successfully!');
      }
    } catch (err) {
      console.error('Error refreshing LeetCode data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh LeetCode data';
      
      toast.error('Failed to refresh LeetCode data', {
        description: errorMessage,
        duration: 5000
      });
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    if (user) {
      setLoading(true);
      
      // First, get the LeetCode username
      getLeetCodeUsername().then((leetcodeUsername) => {
        if (leetcodeUsername) {
          setUsername(leetcodeUsername);
          
          // Try to load cached data first
          loadCachedData().then((cached) => {
            if (cached) {
              setData(cached.data);
              setLoading(false);
              
              // Check if data is stale and auto-refresh in background
              const lastUpdated = new Date(cached.last_updated);
              const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000); // Back to 2 hours with your own server
              
              if (lastUpdated < twoHoursAgo) {
                setBackgroundRefreshing(true);
                fetchFreshLeetCodeData(leetcodeUsername).then((freshData) => {
                  if (freshData) {
                    setData(freshData);
                    toast.success('LeetCode data refreshed automatically', { 
                      duration: 3000,
                      description: 'Your stats have been updated with the latest information'
                    });
                  }
                }).catch((err) => {
                  console.warn('Background refresh failed:', err);
                  toast.warning('Background refresh failed', {
                    description: 'Using cached data. You can manually refresh if needed.',
                    duration: 4000
                  });
                }).finally(() => {
                  setBackgroundRefreshing(false);
                });
              }
            } else {
              // No cached data, fetch fresh data
              fetchFreshLeetCodeData(leetcodeUsername).then((freshData) => {
                if (freshData) {
                  setData(freshData);
                }
                setLoading(false);
              }).catch((err) => {
                setError(err.message);
                setLoading(false);
              });
            }
          });
        } else {
          // No username set
          setLoading(false);
        }
      });
    } else {
      // Clear data when user logs out
      setData(null);
      setError(null);
      setUsername(null);
      setLoading(false);
    }
  }, [user]);

  return {
    data,
    loading,
    backgroundRefreshing,
    error,
    username,
    refetch: refreshData,
    updateUsername: updateLeetCodeUsername,
    fetchInitial: (usernameToUse?: string) => {
      if (usernameToUse) {
        setUsername(usernameToUse);
        return fetchLeetCodeData(false, usernameToUse);
      }
      return fetchLeetCodeData(false);
    },
    forceRefresh: refreshData,
  };
}
