import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { motion } from 'framer-motion';
import { 
  CalendarDays, 
  Trophy, 
  Target, 
  Code2, 
  Award, 
  Clock, 
  TrendingUp, 
  Users, 
  Star, 
  Brain,
  RefreshCw,
  Zap,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Activity,
  Calendar,
  Flame,
  Languages
} from 'lucide-react';
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
      <div className="max-w-6xl mx-auto space-y-8" style={{ backgroundColor: '#000000' }}>
        {/* Loading Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 bg-gray-700" />
              <Skeleton className="h-4 w-32 bg-gray-700" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-5 w-5 animate-spin text-orange-400" />
            <span className="text-gray-300">Loading LeetCode data...</span>
          </div>
        </div>
        
        {/* Loading Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full bg-gray-700" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!username) {
    return (
      <div className="max-w-6xl mx-auto" style={{ backgroundColor: '#000000' }}>
        <Card className="bg-gray-800 border-gray-700 shadow-2xl">
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Code2 className="h-10 w-10 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Connect Your LeetCode</h2>
                <p className="text-gray-300 max-w-md mx-auto">
                  Enter your LeetCode username to view your coding journey, problem-solving statistics, and get AI-powered insights.
                </p>
              </div>
              
              <div className="max-w-sm mx-auto space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter your LeetCode username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleUsernameSubmit()}
                  />
                  <Button
                    onClick={handleUsernameSubmit}
                    disabled={isUpdatingUsername || !usernameInput.trim()}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6"
                  >
                    {isUpdatingUsername ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      'Connect'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    const isCachedData = data !== null;
    
    return (
      <div className="max-w-6xl mx-auto space-y-8" style={{ backgroundColor: '#000000' }}>
        <Card className="bg-gray-800 border-red-400/50">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">
                LeetCode Connection Issue
              </h3>
              <p className="text-gray-300 mb-6">{error}</p>
              <Button 
                onClick={refetch} 
                variant="outline" 
                className="border-red-400 text-red-400 hover:bg-red-400/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {isCachedData && (
          <Alert className="border-yellow-400/50 bg-yellow-400/10 text-yellow-400">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-yellow-300">
              Showing cached data while we resolve the connection issue.
            </AlertDescription>
          </Alert>
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <Code2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400 bg-clip-text text-transparent">
              LeetCode Dashboard
            </h1>
            <p className="text-gray-300 text-lg">Track your problem-solving journey</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-sm px-3 py-1">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
          <Button 
            onClick={refetch} 
            variant="outline" 
            className="border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50"
            disabled={backgroundRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${backgroundRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Solved</p>
                <p className="text-3xl font-bold text-white">{stats?.totalSolved || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Problems</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Current Ranking</p>
                <p className="text-3xl font-bold text-white">
                  {profile?.ranking ? profile.ranking.toLocaleString() : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Global Rank</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Contest Rating</p>
                <p className="text-3xl font-bold text-white">{data?.contestRanking?.rating || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">Current Rating</p>
              </div>
              <Award className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-white">
                  {stats?.totalSolved && stats?.totalQuestions ? 
                    Math.round((stats.totalSolved / stats.totalQuestions) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Completion</p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Problem Difficulty Breakdown */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gray-800 border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              <span>Problem Difficulty Breakdown</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your progress across different difficulty levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Easy Problems */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 font-semibold text-lg">Easy</span>
                  </div>
                  <span className="text-white font-mono text-lg font-bold">
                    {stats?.easySolved || 0}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Solved: {stats?.easySolved || 0}</span>
                    <span>
                      {stats?.easySolved && stats?.totalQuestions ? 
                        Math.round((stats.easySolved / (stats.totalQuestions * 0.4)) * 100) : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={stats?.easySolved ? (stats.easySolved / (stats?.totalQuestions ? Math.floor(stats.totalQuestions * 0.4) : 1)) * 100 : 0}
                    className="h-3 bg-gray-700"
                  />
                </div>
              </div>

              {/* Medium Problems */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    <span className="text-yellow-400 font-semibold text-lg">Medium</span>
                  </div>
                  <span className="text-white font-mono text-lg font-bold">
                    {stats?.mediumSolved || 0}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Solved: {stats?.mediumSolved || 0}</span>
                    <span>
                      {stats?.mediumSolved && stats?.totalQuestions ? 
                        Math.round((stats.mediumSolved / (stats.totalQuestions * 0.4)) * 100) : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={stats?.mediumSolved ? (stats.mediumSolved / (stats?.totalQuestions ? Math.floor(stats.totalQuestions * 0.4) : 1)) * 100 : 0}
                    className="h-3 bg-gray-700"
                  />
                </div>
              </div>

              {/* Hard Problems */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                    <span className="text-red-400 font-semibold text-lg">Hard</span>
                  </div>
                  <span className="text-white font-mono text-lg font-bold">
                    {stats?.hardSolved || 0}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Solved: {stats?.hardSolved || 0}</span>
                    <span>
                      {stats?.hardSolved && stats?.totalQuestions ? 
                        Math.round((stats.hardSolved / (stats.totalQuestions * 0.2)) * 100) : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={stats?.hardSolved ? (stats.hardSolved / (stats?.totalQuestions ? Math.floor(stats.totalQuestions * 0.2) : 1)) * 100 : 0}
                    className="h-3 bg-gray-700"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modern Navigation Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full"
      >
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <div className="w-full flex justify-center mb-8">
            <TabsList className="bg-gray-800 border border-gray-700 rounded-lg p-1 shadow-lg">
              <TabsTrigger 
                value="activity" 
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-all data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Activity className="h-4 w-4" />
                <span className="font-medium">Activity</span>
              </TabsTrigger>
              <TabsTrigger 
                value="submissions" 
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-all data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Code2 className="h-4 w-4" />
                <span className="font-medium">Submissions</span>
              </TabsTrigger>
              <TabsTrigger 
                value="languages" 
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-all data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Languages className="h-4 w-4" />
                <span className="font-medium">Languages</span>
              </TabsTrigger>
              <TabsTrigger 
                value="contests" 
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-all data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Trophy className="h-4 w-4" />
                <span className="font-medium">Contests</span>
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-all data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Brain className="h-4 w-4" />
                <span className="font-medium">AI Insights</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <TabsContent value="activity">
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CalendarDays className="h-5 w-5 text-cyan-400" />
                Submission Activity
              </CardTitle>
              <CardDescription className="text-gray-400">
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
                <Code2 className="h-5 w-5" />
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
      </motion.div>
    </div>
  );
};
