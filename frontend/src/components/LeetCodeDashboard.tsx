import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { CalendarDays, Trophy, Target, Code, Award, Clock, TrendingUp, Users, Star, Brain } from 'lucide-react';
import { useLeetCodeData } from '../utils/useLeetCodeData';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { AdvancedLeetCodeInsights } from './AdvancedLeetCodeInsights';
import LeetCodeHeatmap from './LeetCodeHeatmap';

// Helper function to prepare heatmap data
const prepareHeatmapData = (calendar: any[], stats: any) => {
  // Generate a full year of dates if calendar is empty or insufficient
  const generateFullYearCalendar = () => {
    const calendar = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      calendar.push({
        date: d.toISOString().split('T')[0],
        submissionCount: 0,
        level: 0
      });
    }
    return calendar;
  };

  // Use provided calendar or generate a full year
  let fullCalendar = calendar && calendar.length > 0 ? calendar : generateFullYearCalendar();
  
  // If we have sparse data (like from timestamps), fill in missing dates
  if (calendar && calendar.length > 0 && calendar.length < 300) {
    const calendarMap = new Map();
    calendar.forEach(day => {
      calendarMap.set(day.date, day);
    });
    
    fullCalendar = generateFullYearCalendar().map(day => {
      return calendarMap.get(day.date) || day;
    });
  }

  // Convert calendar data to heatmap format
  const activityData = fullCalendar.map(day => ({
    date: day.date,
    submissionCount: day.submissionCount || 0,
    level: day.level || 0
  }));

  // Calculate activity summary
  const totalSubmissions = fullCalendar.reduce((sum, day) => sum + (day.submissionCount || 0), 0);
  const totalDaysActive = fullCalendar.filter(day => (day.submissionCount || 0) > 0).length;
  const maxDailySubmissions = Math.max(...fullCalendar.map(day => day.submissionCount || 0), 0);
  const avgDailySubmissions = totalDaysActive > 0 ? totalSubmissions / totalDaysActive : 0;

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Calculate current streak (from most recent date backwards)
  const sortedDays = [...fullCalendar].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  for (const day of sortedDays) {
    if (day.submissionCount > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  for (const day of fullCalendar) {
    if (day.submissionCount > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  const activitySummary = {
    totalSubmissions,
    totalDaysActive,
    maxDailySubmissions,
    avgDailySubmissions: Math.round(avgDailySubmissions * 10) / 10,
    currentStreak,
    longestStreak
  };

  return { activityData, activitySummary };
};

// Stats Card Component
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  color?: string;
}> = ({ title, value, icon, subtitle, color = "text-blue-600" }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`${color} opacity-70`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Recent Submissions Component
const RecentSubmissions: React.FC<{ 
  submissions: Array<{
    title: string;
    statusDisplay: string;
    lang: string;
    timestamp: string | number;
    url: string;
  }> 
}> = ({ submissions }) => {
  return (
    <div className="space-y-3">
      {submissions.slice(0, 8).map((submission, index) => (
        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex-1">
            <h4 className="font-medium text-sm">{submission.title}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <Badge 
                variant={submission.statusDisplay === 'Accepted' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {submission.statusDisplay}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {submission.lang}
              </Badge>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {(() => {
              try {
                // Handle different timestamp formats
                let date;
                if (typeof submission.timestamp === 'string') {
                  // Check if it's a numeric string (Unix timestamp)
                  if (/^\d+$/.test(submission.timestamp)) {
                    const unixTimestamp = parseInt(submission.timestamp, 10);
                    // Convert seconds to milliseconds
                    const timestampMs = unixTimestamp * 1000;
                    date = new Date(timestampMs);
                  } else {
                    // Try parsing as regular date string
                    date = new Date(submission.timestamp);
                  }
                } else if (typeof submission.timestamp === 'number') {
                  // If it's a number, check if it's in seconds or milliseconds
                  const timestampMs = submission.timestamp.toString().length === 10 
                    ? submission.timestamp * 1000 
                    : submission.timestamp;
                  date = new Date(timestampMs);
                } else {
                  // Fallback for other formats
                  date = new Date(submission.timestamp);
                }
                
                // Check if the date is valid
                if (isNaN(date.getTime())) {
                  return 'Invalid Date';
                }
                
                return date.toLocaleDateString();
              } catch (error) {
                console.error('Error parsing timestamp:', submission.timestamp, error);
                return 'Invalid Date';
              }
            })()}
          </div>
        </div>
      ))}
    </div>
  );
};

// Language Stats Component
const LanguageStats: React.FC<{ 
  languageStats: Array<{ languageName: string; problemsSolved: number }> 
}> = ({ languageStats }) => {
  const total = languageStats.reduce((sum, lang) => sum + lang.problemsSolved, 0);
  
  return (
    <div className="space-y-3">
      {languageStats.slice(0, 5).map((lang, index) => {
        const percentage = total > 0 ? (lang.problemsSolved / total) * 100 : 0;
        return (
          <div key={index}>
            <div className="flex justify-between text-sm">
              <span className="font-medium">{lang.languageName}</span>
              <span className="text-gray-600">{lang.problemsSolved} problems</span>
            </div>
            <Progress value={percentage} className="mt-1" />
          </div>
        );
      })}
    </div>
  );
};

// Contest History Component
const ContestHistory: React.FC<{ 
  contests: Array<{
    contest: { title: string; startTime: number };
    rating: number;
    globalRanking: number;
    problemsSolved: number;
    totalProblems: number;
  }> 
}> = ({ contests }) => (
  <div className="space-y-3">
    {contests.slice(0, 5).map((contest, index) => (
      <div key={index} className="p-3 rounded-lg border">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">{contest.contest.title}</h4>
          <Badge variant="outline">
            Rank {contest.globalRanking.toLocaleString()}
          </Badge>
        </div>
        <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
          <span>
            {contest.problemsSolved}/{contest.totalProblems} solved
          </span>
          <span>Rating: {contest.rating}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {(() => {
            try {
              // Contest start time is usually in seconds, convert to milliseconds
              const date = new Date(contest.contest.startTime * 1000);
              
              if (isNaN(date.getTime())) {
                return 'Invalid Date';
              }
              
              return date.toLocaleDateString();
            } catch (error) {
              console.error('Error parsing contest timestamp:', contest.contest.startTime, error);
              return 'Invalid Date';
            }
          })()}
        </div>
      </div>
    ))}
  </div>
);

// Main LeetCode Dashboard Component
export const LeetCodeDashboard: React.FC = () => {
  const { 
    data, 
    loading, 
    backgroundRefreshing, 
    error, 
    username, 
    refetch, 
    updateUsername 
  } = useLeetCodeData();

  // Persistent tab state
  const [activeTab, setActiveTab] = React.useState<string>(() => {
    // Initialize from localStorage or default to 'activity'
    const saved = localStorage.getItem('leetcode-dashboard-tab');
    return saved || 'activity';
  });

  // Save tab state to localStorage when it changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    localStorage.setItem('leetcode-dashboard-tab', newTab);
  };

  // Username input handler
  const [usernameInput, setUsernameInput] = React.useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = React.useState(false);

  const handleUsernameSubmit = async () => {
    if (!usernameInput.trim()) return;
    
    setIsUpdatingUsername(true);
    try {
      const success = await updateUsername(usernameInput.trim());
      if (success) {
        // The useEffect in useLeetCodeData will automatically fetch data
      }
    } catch (err) {
      console.error('Failed to update username:', err);
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!username) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Connect LeetCode
          </CardTitle>
          <CardDescription>
            Enter your LeetCode username to view your coding statistics and progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter LeetCode username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleUsernameSubmit()}
            />
            <Button 
              onClick={handleUsernameSubmit}
              disabled={isUpdatingUsername || !usernameInput.trim()}
            >
              {isUpdatingUsername ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    const isCachedData = data !== null;
    
    return (
      <div className="space-y-4">
        {isCachedData && (
          <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              {error} Showing cached data while we resolve the issue.
            </AlertDescription>
          </Alert>
        )}
        
        {!isCachedData && (
          <Card>
            <CardContent className="p-6">
              <Alert>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={refetch} 
                  variant="outline" 
                  size="sm"
                >
                  Retry
                </Button>
                <Button 
                  onClick={() => setUsernameInput('')} 
                  variant="ghost" 
                  size="sm"
                >
                  Change Username
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {isCachedData && renderDashboardContent()}
      </div>
    );
  }

  return renderDashboardContent();

  function renderDashboardContent() {
    if (!data) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              No LeetCode data available
            </div>
          </CardContent>
        </Card>
      );
    }

    const { profile, stats, recentSubmissions, contestHistory, calendar, languageStats } = data;

    // Prepare heatmap data
    const { activityData, activitySummary } = prepareHeatmapData(calendar || [], stats);
    
  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Code className="h-6 w-6 text-orange-500" />
            LeetCode Dashboard
          </h2>
          <p className="text-gray-600">
            Tracking progress for <span className="font-medium">@{username}</span>
            {backgroundRefreshing && (
              <span className="ml-2 text-xs text-blue-600">Refreshing...</span>
            )}
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm" className="whitespace-nowrap">
          Refresh Data
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Problems Solved"
          value={stats.totalSolved}
          icon={<Target className="h-6 w-6" />}
          subtitle={`of ${stats.totalQuestions} total`}
          color="text-green-600"
        />
        <StatsCard
          title="Contest Rating"
          value={stats.ranking > 0 ? stats.ranking.toLocaleString() : 'Unrated'}
          icon={<Trophy className="h-6 w-6" />}
          subtitle="Global Ranking"
          color="text-yellow-600"
        />
        <StatsCard
          title="Reputation"
          value={stats.reputation}
          icon={<Star className="h-6 w-6" />}
          subtitle="Community Points"
          color="text-purple-600"
        />
        <StatsCard
          title="Easy | Medium | Hard"
          value={`${stats.easySolved} | ${stats.mediumSolved} | ${stats.hardSolved}`}
          icon={<TrendingUp className="h-6 w-6" />}
          subtitle="Problems by difficulty"
          color="text-blue-600"
        />
      </div>

      {/* Difficulty Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Problem Solving Progress</CardTitle>
          <CardDescription>Track your progress across different difficulty levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-green-600">Easy</span>
                <span>{stats.easySolved} solved</span>
              </div>
              <Progress value={(stats.easySolved / (stats.totalQuestions * 0.4)) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-yellow-600">Medium</span>
                <span>{stats.mediumSolved} solved</span>
              </div>
              <Progress value={(stats.mediumSolved / (stats.totalQuestions * 0.4)) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-red-600">Hard</span>
                <span>{stats.hardSolved} solved</span>
              </div>
              <Progress value={(stats.hardSolved / (stats.totalQuestions * 0.2)) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="w-full flex justify-center mb-6">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            <TabsTrigger value="activity" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              Activity
            </TabsTrigger>
            <TabsTrigger value="submissions" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              Submissions
            </TabsTrigger>
            <TabsTrigger value="languages" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              Languages
            </TabsTrigger>
            <TabsTrigger value="contests" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              Contests
            </TabsTrigger>
            <TabsTrigger value="insights" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1">
              <Brain className="h-3 w-3" />
              Insights
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Submission Activity
              </CardTitle>
              <CardDescription>
                Your daily submission activity over the past year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeetCodeHeatmap 
                activityData={activityData} 
                activitySummary={activitySummary} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Submissions
              </CardTitle>
              <CardDescription>
                Your latest problem submissions and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentSubmissions.length > 0 ? (
                <RecentSubmissions submissions={recentSubmissions} />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No recent submissions found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Programming Languages
              </CardTitle>
              <CardDescription>
                Distribution of problems solved by programming language
              </CardDescription>
            </CardHeader>
            <CardContent>
              {languageStats.length > 0 ? (
                <LanguageStats languageStats={languageStats} />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No language statistics available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Contest History
              </CardTitle>
              <CardDescription>
                Your performance in LeetCode contests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contestHistory.length > 0 ? (
                <ContestHistory contests={contestHistory} />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No contest history available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <AdvancedLeetCodeInsights data={data} />
        </TabsContent>
      </Tabs>
    </div>
    );
  }
};
