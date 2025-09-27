import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { 
  Code2, 
  Trophy, 
  Target, 
  TrendingUp, 
  CheckCircle,
  Circle,
  RefreshCw,
  Award
} from "lucide-react";
import { useLeetCodeData } from '../utils/useLeetCodeData';
import LeetCodeHeatmap from './LeetCodeHeatmap';
import { AdvancedLeetCodeInsights } from './AdvancedLeetCodeInsights';
import { useState } from 'react';

export function LeetCodePage() {
  const { data: leetcodeData, loading, error, refetch, username, updateUsername } = useLeetCodeData();
  
  // Username input handler
  const [usernameInput, setUsernameInput] = useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  const handleUsernameSubmit = async () => {
    if (!usernameInput.trim()) return;
    
    setIsUpdatingUsername(true);
    try {
      const success = await updateUsername(usernameInput.trim());
      if (success) {
        // The useEffect in useLeetCodeData will automatically fetch data
        setUsernameInput(''); // Clear input after successful connection
      }
    } catch (err) {
      console.error('Failed to update username:', err);
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  // Utility function to format Unix timestamps
  const formatTimestamp = (timestamp: string | number) => {
    try {
      const date = new Date(parseInt(timestamp.toString()) * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-orange-400" />
          <p className="text-gray-400">Loading LeetCode data...</p>
        </div>
      </div>
    );
  }

  // Show username input form if no username is set
  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Code2 className="h-16 w-16 mx-auto text-gray-600" />
          <h2 className="text-xl font-bold text-white">LeetCode Connection Error</h2>
          <p className="text-gray-400 max-w-md">
            {error}
          </p>
          <Button 
            onClick={() => refetch()} 
            className="bg-orange-600 hover:bg-orange-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const stats = leetcodeData?.stats;
  const profile = leetcodeData?.profile;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              LeetCode Dashboard
            </h1>
            <p className="text-gray-400 text-lg">Track your algorithmic problem-solving journey</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => refetch()} 
              className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white shadow-lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total Solved Card */}
        <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Solved</p>
                <p className="text-3xl font-bold text-white mt-2">{stats?.totalSolved || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Problems Completed</p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <Trophy className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Ranking Card */}
        <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Current Ranking</p>
                <p className="text-3xl font-bold text-white mt-2">{stats?.ranking || profile?.ranking || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">Global Position</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-full">
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contest Rating Card */}
        <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Contest Rating</p>
                <p className="text-3xl font-bold text-white mt-2">{leetcodeData?.contestRanking?.rating || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">Competition Score</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <Award className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Rate Card */}
        <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats?.totalSolved && stats?.totalQuestions 
                    ? Math.round((stats.totalSolved / stats.totalQuestions) * 100) 
                    : 'N/A'}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Completion Rate</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                <Target className="h-8 w-8 text-green-400" />
              </div>
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
              <Code2 className="h-5 w-5 text-cyan-400" />
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

      {/* Activity Heatmap Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="bg-gray-800 border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Target className="h-5 w-5 text-cyan-400" />
              <span>Submission Activity Heatmap</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Visual representation of your coding activity over the past year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
              <LeetCodeHeatmap 
                activityData={(() => {
                  // Transform calendar data from API
                  const calendarData = leetcodeData?.calendar || [];
                  
                  if (calendarData.length === 0) {
                    return []; // Return empty array if no data
                  }
                  
                  // Transform existing calendar data to match expected format
                  return calendarData.map(day => {
                    const submissionCount = day.submissionCount || day.count || 0;
                    // Better level calculation: 0 = no activity, 1+ = visible activity
                    let level = 0;
                    if (submissionCount === 0) level = 0;
                    else if (submissionCount === 1) level = 1;
                    else if (submissionCount <= 3) level = 2;
                    else if (submissionCount <= 6) level = 3;
                    else level = 4;
                    
                    return {
                      date: day.date || day.timestamp || '',
                      submissionCount,
                      level
                    };
                  });
                })()}
                activitySummary={{
                  totalSubmissions: leetcodeData?.stats?.totalSolved || 0,
                  totalDaysActive: leetcodeData?.calendar?.length || 0,
                  maxDailySubmissions: Math.max(...(leetcodeData?.calendar || []).map(day => day.submissionCount || day.count || 0), 0),
                  avgDailySubmissions: leetcodeData?.calendar?.length ? 
                    (leetcodeData?.calendar?.reduce((sum, day) => sum + (day.submissionCount || day.count || 0), 0) / leetcodeData.calendar.length) : 0,
                  currentStreak: leetcodeData?.streak?.current || 0,
                  longestStreak: leetcodeData?.streak?.longest || 0
                }}
              />
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
        <Tabs defaultValue="overview" className="space-y-8">
          <div className="w-full flex justify-center mb-8">
            <TabsList className="bg-gray-800 border border-gray-700 rounded-lg p-1 shadow-lg">
              <TabsTrigger 
                value="overview" 
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-all data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="submissions" 
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-all data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Code2 className="h-4 w-4" />
                <span className="font-medium">Submissions</span>
              </TabsTrigger>
              <TabsTrigger 
                value="skills" 
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-all data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Trophy className="h-4 w-4" />
                <span className="font-medium">Skills</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Info */}
              {/* <Card className="bg-gray-800 border-gray-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-cyan-400" />
                    <span>Profile Overview</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Your LeetCode profile information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Code2 className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{profile.name || profile.username || 'LeetCode User'}</h3>
                          <p className="text-orange-400 font-medium">@{profile.username || 'username'}</p>
                          <p className="text-sm text-gray-400">Global Rank: #{profile.ranking || 'N/A'}</p>
                        </div>
                      </div>
                      {profile.about && (
                        <div className="mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                          <p className="text-gray-300 text-sm">{profile.about}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card> */}

              {/* AI Insights */}
              <Card className="bg-gray-800 border-gray-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Award className="h-5 w-5 text-purple-400" />
                    <span>AI Insights</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Personalized insights and recommendations based on your coding patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdvancedLeetCodeInsights data={leetcodeData} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Code2 className="h-5 w-5 text-cyan-400" />
                  <span>All Recent Submissions</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Complete history of your recent problem submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leetcodeData?.recentSubmissions?.map((submission, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-700/50 border border-gray-600/50 hover:bg-gray-700/70 hover:border-gray-500/50 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        {submission.statusDisplay === 'Accepted' ? (
                          <div className="p-2 bg-green-500/20 rounded-full">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          </div>
                        ) : (
                          <div className="p-2 bg-red-500/20 rounded-full">
                            <Circle className="h-5 w-5 text-red-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-white text-lg">{submission.title}</h3>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge className={`text-xs ${submission.statusDisplay === 'Accepted' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                              {submission.statusDisplay}
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                              {submission.lang}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm text-gray-400 font-mono">
                          {formatTimestamp(submission.timestamp)}
                        </p>
                        {submission.runtime && (
                          <p className="text-xs text-gray-500">Runtime: {submission.runtime}</p>
                        )}
                      </div>
                    </motion.div>
                  )) || (
                    <div className="text-center py-12">
                      <Code2 className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                      <p className="text-gray-400">No submissions data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-cyan-400" />
                    <span>Top Programming Skills</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Your strongest problem-solving categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {leetcodeData?.skillStats?.slice(0, 8).map((skill, index) => (
                      <div key={skill.tagName} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">{skill.tagName}</span>
                          <div className="text-right">
                            <span className="text-sm text-gray-300 font-mono">{skill.problemsSolved}</span>
                            <span className="text-xs text-gray-500 ml-1">solved</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (skill.problemsSolved / Math.max(...(leetcodeData?.skillStats?.map(s => s.problemsSolved) || [1]))) * 100)}%` }}
                            transition={{ delay: index * 0.1, duration: 0.8 }}
                            className={`h-3 rounded-full transition-all duration-300 ${
                              index === 0 ? 'bg-gradient-to-r from-orange-400 to-amber-500' :
                              index === 1 ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                              index === 2 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                              index === 3 ? 'bg-gradient-to-r from-purple-400 to-violet-500' : 
                              index === 4 ? 'bg-gradient-to-r from-pink-400 to-rose-500' :
                              index === 5 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                              'bg-gradient-to-r from-gray-400 to-gray-500'
                            }`}
                          />
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-12">
                        <Trophy className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400">No skill data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Code2 className="h-5 w-5 text-cyan-400" />
                    <span>Programming Languages</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Your most used programming languages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {leetcodeData?.languageStats?.slice(0, 6).map((lang, index) => (
                      <div key={lang.languageName} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">{lang.languageName}</span>
                          <div className="text-right">
                            <span className="text-sm text-gray-300 font-mono">{lang.problemsSolved}</span>
                            <span className="text-xs text-gray-500 ml-1">problems</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (lang.problemsSolved / Math.max(...(leetcodeData?.languageStats?.map(l => l.problemsSolved) || [1]))) * 100)}%` }}
                            transition={{ delay: index * 0.1, duration: 0.8 }}
                            className={`h-3 rounded-full transition-all duration-300 ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                              index === 1 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                              index === 2 ? 'bg-gradient-to-r from-green-400 to-teal-500' :
                              index === 3 ? 'bg-gradient-to-r from-red-400 to-pink-500' :
                              index === 4 ? 'bg-gradient-to-r from-purple-400 to-indigo-500' :
                              'bg-gradient-to-r from-gray-400 to-slate-500'
                            }`}
                          />
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-12">
                        <Code2 className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400">No language data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}