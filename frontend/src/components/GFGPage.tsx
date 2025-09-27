import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Loader2, 
  RefreshCw, 
  User, 
  Calendar, 
  Code, 
  TrendingUp, 
  Target, 
  Trophy, 
  Clock, 
  Zap,
  BookOpen,
  Flame,
  Award,
  BarChart3,
  Activity
} from 'lucide-react';
import { useGFGData } from '../utils/useGFGData';
import { toast } from 'sonner';
import GFGHeatmap from './GFGHeatmap';

export const GFGPage: React.FC = () => {
  const { data, loading, backgroundRefreshing, error, username, updateUsername, refetch } = useGFGData();
  const [newUsername, setNewUsername] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!newUsername.trim()) {
      toast.error('Please enter a GeeksForGeeks username');
      return;
    }

    setIsConnecting(true);
    try {
      const success = await updateUsername(newUsername.trim());
      if (success) {
        toast.success('GeeksForGeeks account connected successfully!');
        setNewUsername('');
      } else {
        toast.error('Failed to connect GeeksForGeeks account');
      }
    } catch (err) {
      console.error('Connection error:', err);
      toast.error('Failed to connect account');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (err) {
      // Error already handled in refetch
    }
  };

  // Connection state
  if (!username || error) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/20 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Code className="h-10 w-10 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Connect Your GeeksForGeeks Account</h2>
                <p className="text-gray-300 max-w-md mx-auto">
                  Track your GeeksForGeeks progress, view detailed analytics, and get insights into your coding journey.
                </p>
              </div>

              {error && (
                <motion.div 
                  className="bg-red-900/20 border border-red-500/30 rounded-xl p-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-3 max-w-md mx-auto">
                  <label htmlFor="gfg-username" className="block text-sm font-medium text-gray-300">
                    GeeksForGeeks Username
                  </label>
                  <Input
                    id="gfg-username"
                    type="text"
                    placeholder="Enter your GFG username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting || !newUsername.trim()}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Code className="h-5 w-5 mr-2" />
                      Connect GeeksForGeeks
                    </>
                  )}
                </Button>
              </div>

              {/* Feature highlights */}
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-8">
                {[
                  { icon: TrendingUp, color: 'green', text: 'View your problem-solving statistics and progress' },
                  { icon: Target, color: 'blue', text: 'Get detailed analytics on your coding patterns' },
                  { icon: Zap, color: 'purple', text: 'Receive AI-powered recommendations for improvement' },
                  { icon: Calendar, color: 'orange', text: 'Track your contribution calendar and streaks' }
                ].map(({ icon: Icon, color, text }, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className={`w-10 h-10 bg-${color}-500/20 rounded-xl flex items-center justify-center border border-${color}-500/30`}>
                      <Icon className={`w-5 h-5 text-${color}-400`} />
                    </div>
                    <p className="text-sm text-gray-300">{text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="animate-pulse">
          <div className="h-12 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <Card className="bg-gradient-to-br from-red-900/20 to-gray-800 border-red-500/20 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="relative">
                <Code className="h-20 w-20 text-red-400 mx-auto" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  No GeeksForGeeks Data Available
                </h3>
                <p className="text-gray-300 mb-6 text-lg">Unable to load your GeeksForGeeks data. Please try refreshing.</p>
                <Button 
                  onClick={handleRefresh} 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 text-lg"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            GeeksForGeeks Dashboard
          </h1>
          <p className="text-gray-300 text-lg">Connected as @{username}</p>
        </div>
        <div className="flex items-center space-x-3">
          {backgroundRefreshing && (
            <div className="flex items-center text-sm text-gray-300 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </div>
          )}
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-green-500 hover:text-green-400"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-r from-green-800 to-emerald-800 border-green-500/20 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center border border-green-500/30">
                <User className="w-8 h-8 text-green-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{data.profile.fullName || data.profile.userName}</h2>
                <p className="text-green-100 text-lg">@{data.profile.userName}</p>
                {data.profile.institute && (
                  <p className="text-green-100 text-sm mt-2">
                    {data.profile.institute} {data.profile.instituteRank && `• Rank: ${data.profile.instituteRank}`}
                  </p>
                )}
                {data.profile.languagesUsed && data.profile.languagesUsed.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {data.profile.languagesUsed.slice(0, 5).map((lang, idx) => (
                      <Badge key={idx} className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{data.stats.totalProblemsSolved}</div>
                <div className="text-green-100 text-sm">Problems Solved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {[
          { label: 'Coding Score', value: data.profile.codingScore || 0, icon: Trophy, color: 'from-yellow-500 to-orange-500' },
          { label: 'Current Streak', value: data.profile.currentStreak || 0, icon: Flame, color: 'from-orange-500 to-red-500' },
          { label: 'Max Streak', value: data.profile.maxStreak || 0, icon: Award, color: 'from-purple-500 to-purple-600' },
          { label: 'Monthly Score', value: data.profile.monthlyScore || 0, icon: BarChart3, color: 'from-blue-500 to-cyan-500' }
        ].map(({ label, value, icon: Icon, color }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          >
            <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 font-medium">{label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Difficulty Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <Card className="bg-gray-800 border-gray-700 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-400" />
              Problems by Difficulty
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'School', value: data.stats.School || 0, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
                { label: 'Basic', value: data.stats.Basic || 0, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
                { label: 'Easy', value: data.stats.Easy || 0, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
                { label: 'Medium', value: data.stats.Medium || 0, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
                { label: 'Hard', value: data.stats.Hard || 0, color: 'bg-red-500/20 text-red-400 border-red-500/30' }
              ].map(({ label, value, color }) => (
                <div key={label} className={`p-3 rounded-lg border ${color} text-center`}>
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-sm font-medium mt-1">{label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Tabs defaultValue="activity" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-gray-800 border border-gray-700 rounded-xl p-1">
              <TabsTrigger 
                value="activity" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white text-gray-300"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger 
                value="problems" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white text-gray-300"
              >
                <Code className="h-4 w-4 mr-2" />
                Problems
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white text-gray-300"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-green-400" />
                    Activity Calendar
                  </h3>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Last updated: {new Date(data.lastUpdated).toLocaleDateString()}
                  </Badge>
                </div>
                <GFGHeatmap data={data.activityCalendar} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="problems" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-green-400" />
                  Recent Problems ({data.solvedProblems.length})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {data.solvedProblems.slice(0, 50).map((problem, index) => (
                    <motion.div 
                      key={`${problem.problemName}-${index}`}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-xl border border-gray-600 hover:border-gray-500 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{problem.problemName}</h4>
                        {problem.date && (
                          <p className="text-sm text-gray-400 mt-1">{new Date(problem.date).toLocaleDateString()}</p>
                        )}
                        {problem.problemUrl && (
                          <a 
                            href={problem.problemUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-green-400 hover:text-green-300 mt-1 inline-block"
                          >
                            View Problem →
                          </a>
                        )}
                      </div>
                      <Badge 
                        className={`ml-4 ${
                          problem.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          problem.difficulty === 'Medium' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          problem.difficulty === 'Easy' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          problem.difficulty === 'Basic' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          'bg-green-500/20 text-green-400 border-green-500/30'
                        }`}
                      >
                        {problem.difficulty}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                  Coding Insights
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Streak Information */}
                  <div className="p-4 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-xl border border-orange-500/20">
                    <h4 className="font-semibold text-white mb-3 flex items-center">
                      <Flame className="w-4 h-4 mr-2 text-orange-400" />
                      Streak Analytics
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">Current Streak:</span>
                        <span className="font-medium text-orange-400">{data.profile.currentStreak || 0} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">Max Streak:</span>
                        <span className="font-medium text-orange-400">{data.profile.maxStreak || 0} days</span>
                      </div>
                      <div className="w-full bg-orange-900/20 rounded-full h-2 mt-3">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, ((data.profile.currentStreak || 0) / Math.max(data.profile.maxStreak || 1, 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Problem Distribution */}
                  <div className="p-4 bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/20">
                    <h4 className="font-semibold text-white mb-3 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2 text-green-400" />
                      Problem Distribution
                    </h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Hard Problems', value: data.stats.Hard || 0, total: data.stats.totalProblemsSolved, color: 'bg-red-500' },
                        { label: 'Medium Problems', value: data.stats.Medium || 0, total: data.stats.totalProblemsSolved, color: 'bg-orange-500' },
                        { label: 'Easy/Basic/School', value: (data.stats.Easy || 0) + (data.stats.Basic || 0) + (data.stats.School || 0), total: data.stats.totalProblemsSolved, color: 'bg-green-500' }
                      ].map(({ label, value, total, color }) => (
                        <div key={label} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">{label}</span>
                            <span className="font-medium text-white">{value}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className={`${color} h-1.5 rounded-full transition-all duration-500`}
                              style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Profile Info */}
                  {(data.profile.institute || data.profile.languagesUsed?.length) && (
                    <div className="md:col-span-2 p-4 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-500/20">
                      <h4 className="font-semibold text-white mb-3 flex items-center">
                        <User className="w-4 h-4 mr-2 text-blue-400" />
                        Profile Information
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {data.profile.institute && (
                          <div>
                            <span className="text-sm text-gray-300">Institute:</span>
                            <p className="font-medium text-white">{data.profile.institute}</p>
                            {data.profile.instituteRank && (
                              <p className="text-sm text-blue-400">Rank: {data.profile.instituteRank}</p>
                            )}
                          </div>
                        )}
                        {data.profile.languagesUsed && data.profile.languagesUsed.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-300">Languages Used:</span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {data.profile.languagesUsed.map((lang, idx) => (
                                <Badge key={idx} className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};