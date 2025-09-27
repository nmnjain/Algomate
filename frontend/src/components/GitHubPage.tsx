import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { 
  Star, 
  GitFork, 
  Users, 
  Calendar, 
  MapPin, 
  Building, 
  ExternalLink,
  Github,
  BookOpen,
  Activity,
  TrendingUp,
  RefreshCw,
  GitBranch,
  Eye,
  GitCommit,
  Code2,
  Zap,
  Target,
  Award,
  Flame
} from 'lucide-react';
import { useGitHubData } from '../utils/useGitHubData';
import { useAuth } from '../contexts/AuthContext';
import GitHubHeatmap from './GitHubHeatmap';
import { toast } from "sonner";
import { useGitHubConnectionStatus, useGitHubActionStatus } from '../utils/useGitHubConnectionStatus';

const GitHubPage: React.FC = () => {
  const { data: githubData, loading, error, refetch, fetchInitial } = useGitHubData();
  const { signInWithGitHub } = useAuth();
  const connectionStatus = useGitHubConnectionStatus();
  const actionStatus = useGitHubActionStatus(error);

  const handleGitHubAction = async () => {

    try {
      switch (actionStatus.action) {
        case 'connect':
          // Clear any error state when reconnecting
          if (error === 'github_token_expired') {
            toast.info('Reconnecting GitHub account...');
          }

          const { error: connectError } = await signInWithGitHub();
          if (connectError) {
            toast.error(`GitHub connection failed: ${connectError.message}`);
          } else {
            if (error === 'github_token_expired') {
              toast.success('GitHub account reconnected successfully!');
            } else {
              toast.success('GitHub account connected successfully!');
            }
            // Fetch fresh data after successful connection
            setTimeout(() => {
              fetchInitial();
            }, 2000);
          }
          break;

        case 'sync':
          toast.info('Loading GitHub data...');
          await fetchInitial();
          toast.success('GitHub data loaded successfully!');
          break;

        case 'refresh':
          toast.info('Refreshing GitHub data...');
          try {
            await refetch();
            toast.success('GitHub data refreshed successfully!');
          } catch (error: any) {
            // If token expired during refresh, automatically redirect to OAuth
            if (error?.message === 'GITHUB_TOKEN_EXPIRED' ||
              error?.message?.includes('token expired') ||
              error?.message?.includes('token not found')) {
              toast.info('GitHub token expired. Reconnecting...');

              const { error: oauthError } = await signInWithGitHub();
              if (oauthError) {
                toast.error(`GitHub reconnection failed: ${oauthError.message}`);
              } else {
                toast.success('GitHub reconnected! Fetching fresh data...');
                // Fetch fresh data after successful reconnection
                setTimeout(() => {
                  fetchInitial();
                }, 2000);
              }
            } else {
              toast.error('Failed to refresh GitHub data');
              throw error; // Re-throw if it's not a token error
            }
          }
          break;
      }
    } catch (error) {
      toast.error('Failed to perform GitHub action');
      console.error('GitHub action error:', error);
    }
  };

  // Language colors mapping to Tailwind classes
  const getLanguageColorClass = (language: string) => {
    const colorMap: Record<string, string> = {
      'JavaScript': 'bg-yellow-500',
      'TypeScript': 'bg-blue-600',
      'Python': 'bg-green-600',
      'CSS': 'bg-blue-500',
      'HTML': 'bg-orange-500',
      'Java': 'bg-red-600',
      'C++': 'bg-blue-700',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-600',
      'PHP': 'bg-purple-600'
    };
    return colorMap[language] || 'bg-gray-500';
  };

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

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <Card className="bg-gradient-to-br from-red-900/20 to-gray-800 border-red-500/20 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="relative">
                <Github className="h-20 w-20 text-red-400 mx-auto" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  GitHub Connection Issue
                </h3>
                <p className="text-gray-300 mb-6 text-lg">{error}</p>
                <div className="space-y-4">
                  <Button 
                    onClick={handleGitHubAction}
                    disabled={actionStatus.disabled || loading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 text-lg"
                  >
                    <Github className="h-5 w-5 mr-2" />
                    {loading ? 'Loading...' : actionStatus.label}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show connection interface when not connected (no data, no error, not loading)
  if (!githubData && !error && !loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/20 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Github className="h-10 w-10 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Connect Your GitHub Account</h2>
                <p className="text-gray-300 max-w-md mx-auto">
                  Connect your GitHub account to view your repositories, contributions, and get insights into your coding journey.
                </p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={handleGitHubAction}
                  disabled={actionStatus.disabled || loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Github className="h-5 w-5 mr-2" />
                  {loading ? 'Loading...' : actionStatus.label}
                </Button>
              </div>

              {/* Feature highlights */}
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-8">
                {[
                  { icon: BookOpen, color: 'blue', text: 'View all your repositories and their statistics' },
                  { icon: Activity, color: 'green', text: 'Track your contribution activity and streaks' },
                  { icon: TrendingUp, color: 'purple', text: 'Get insights into your most used languages' },
                  { icon: Star, color: 'yellow', text: 'Monitor stars, forks, and repository metrics' }
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

  const { profile, stats, recentRepos, activityData, activitySummary } = githubData || {};

  // Mock language data for demonstration (replace with actual data from stats)
  const mockLanguages = [
    { name: 'TypeScript', percentage: 35, color: '#3178c6' },
    { name: 'JavaScript', percentage: 28, color: '#f7df1e' },
    { name: 'Python', percentage: 15, color: '#3776ab' },
    { name: 'CSS', percentage: 12, color: '#1572b6' },
    { name: 'HTML', percentage: 10, color: '#e34f26' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            GitHub Dashboard
          </h1>
          <p className="text-gray-400 text-lg mt-2">Track your coding journey and contributions</p>
        </div>
        <Button 
          variant="outline" 
          onClick={refetch}
          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Profile Section */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-4 ring-purple-500/20">
                    <AvatarImage src={profile.avatar_url} alt={profile.name || profile.login} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-600 to-blue-600">
                      {(profile.name || profile.login)?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-800 flex items-center justify-center">
                    <Github className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white">{profile.name || profile.login}</h2>
                  <p className="text-purple-400 text-lg">@{profile.login}</p>
                  {profile.bio && (
                    <p className="text-gray-300 mt-2 text-lg">{profile.bio}</p>
                  )}
                  <div className="flex items-center space-x-6 mt-3">
                    {(profile as any).location && (
                      <span className="text-gray-400 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                        {(profile as any).location}
                      </span>
                    )}
                    {(profile as any).company && (
                      <span className="text-gray-400 flex items-center">
                        <Building className="h-4 w-4 mr-2 text-green-400" />
                        {(profile as any).company}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.open((profile as any).html_url, '_blank')}
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 font-medium text-lg">Repositories</p>
                  <p className="text-4xl font-bold text-white mt-2">{profile?.public_repos || 0}</p>
                  <p className="text-gray-300 text-sm mt-1">Public repos</p>
                </div>
                <div className="bg-blue-500/20 p-4 rounded-full">
                  <BookOpen className="h-10 w-10 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 font-medium text-lg">Followers</p>
                  <p className="text-4xl font-bold text-white mt-2">{profile?.followers || 0}</p>
                  <p className="text-gray-300 text-sm mt-1">People following</p>
                </div>
                <div className="bg-green-500/20 p-4 rounded-full">
                  <Users className="h-10 w-10 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 font-medium text-lg">Following</p>
                  <p className="text-4xl font-bold text-white mt-2">{profile?.following || 0}</p>
                  <p className="text-gray-300 text-sm mt-1">People you follow</p>
                </div>
                <div className="bg-purple-500/20 p-4 rounded-full">
                  <Eye className="h-10 w-10 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-400 font-medium text-lg">Contributions</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {activitySummary?.totalActivity || 0}
                  </p>
                  <p className="text-gray-300 text-sm mt-1">This year</p>
                </div>
                <div className="bg-orange-500/20 p-4 rounded-full">
                  <TrendingUp className="h-10 w-10 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Languages and Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Languages Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Code2 className="h-6 w-6 mr-2 text-cyan-400" />
                Top Languages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pie Chart Visualization */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                    {mockLanguages.map((lang, index) => {
                      const offset = mockLanguages.slice(0, index).reduce((acc, l) => acc + l.percentage, 0);
                      const circumference = 2 * Math.PI * 40;
                      const strokeDasharray = `${(lang.percentage / 100) * circumference} ${circumference}`;
                      const strokeDashoffset = -((offset / 100) * circumference);
                      
                      return (
                        <circle
                          key={lang.name}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={lang.color}
                          strokeWidth="8"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="opacity-80 hover:opacity-100 transition-opacity duration-300"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Code2 className="h-8 w-8 text-cyan-400 mx-auto mb-1" />
                      <div className="text-sm text-gray-300 font-medium">Languages</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Language List with Visual Bars */}
              <div className="space-y-4">
                {mockLanguages.map((lang, index) => (
                  <motion.div 
                    key={lang.name} 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full shadow-lg"
                          style={{ backgroundColor: lang.color }}
                        ></div>
                        <span className="text-white font-medium">{lang.name}</span>
                      </div>
                      <span className="text-gray-300 font-mono text-sm bg-gray-700/50 px-2 py-1 rounded">
                        {lang.percentage}%
                      </span>
                    </div>
                    
                    {/* Enhanced Progress Bar */}
                    <div className="relative w-full bg-gray-700/50 rounded-full h-3 overflow-hidden border border-gray-600/30">
                      <motion.div 
                        className="h-full rounded-full shadow-sm"
                        style={{ 
                          backgroundColor: lang.color,
                          width: `${lang.percentage}%`
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${lang.percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 + 0.5, ease: "easeOut" }}
                      />
                      
                      {/* Glow effect */}
                      <motion.div 
                        className="absolute top-0 left-0 h-full rounded-full opacity-30"
                        style={{ 
                          backgroundColor: lang.color,
                          width: `${lang.percentage}%`,
                          filter: 'blur(4px)'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${lang.percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 + 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="mt-6 pt-4 border-t border-gray-700/30">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Total Languages</span>
                  <span className="text-white font-bold">{mockLanguages.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-300">Primary Language</span>
                  <span className="text-white font-bold flex items-center">
                    <div 
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: mockLanguages[0].color }}
                    ></div>
                    {mockLanguages[0].name}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="h-6 w-6 mr-2 text-pink-400" />
                Activity Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-700/60 border border-yellow-400/40 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Flame className="h-8 w-8 text-yellow-400" />
                  <div>
                    <p className="text-yellow-300 font-medium">Current Streak</p>
                    <p className="text-gray-300 text-sm">Days in a row</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{activitySummary?.currentStreak || 0}</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700/60 border border-red-400/40 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Award className="h-8 w-8 text-red-400" />
                  <div>
                    <p className="text-red-300 font-medium">Longest Streak</p>
                    <p className="text-gray-300 text-sm">Personal best</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{activitySummary?.longestStreak || 0}</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700/60 border border-indigo-400/40 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Target className="h-8 w-8 text-indigo-400" />
                  <div>
                    <p className="text-indigo-300 font-medium">Active Days</p>
                    <p className="text-gray-300 text-sm">This year</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{activitySummary?.totalDaysActive || 0}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity Heatmap */}
      {activityData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <GitCommit className="h-6 w-6 mr-2 text-green-400" />
                  Contribution Activity
                </div>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                  {activitySummary?.totalActivity || 0} total contributions
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GitHubHeatmap 
                activityData={activityData} 
                activitySummary={activitySummary || {
                  totalActivity: 0,
                  totalDaysActive: 0,
                  maxDailyActivity: 0,
                  avgDailyActivity: 0,
                  currentStreak: 0,
                  longestStreak: 0
                }} 
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Repositories */}
      {recentRepos && recentRepos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <GitBranch className="h-6 w-6 mr-2 text-blue-400" />
                Recent Repositories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRepos.map((repo: any, index: number) => (
                  <motion.div
                    key={repo.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-6 bg-gray-700/80 border border-gray-600/40 rounded-lg hover:bg-gray-600/80 hover:border-gray-500/60 transition-all duration-300 shadow-md"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <GitBranch className="h-5 w-5 text-blue-400" />
                        <h3 className="font-bold text-white text-xl">{repo.name}</h3>
                      </div>
                      {repo.description && (
                        <p className="text-gray-300 mb-3 text-lg">{repo.description}</p>
                      )}
                      <div className="flex items-center space-x-6">
                        {repo.language && (
                          <Badge 
                            variant="secondary" 
                            className={`${getLanguageColorClass(repo.language)} text-white border-0 px-3 py-1`}
                          >
                            {repo.language}
                          </Badge>
                        )}
                        <span className="text-gray-300 flex items-center">
                          <Star className="h-5 w-5 mr-2 text-yellow-400" />
                          <span className="font-mono text-lg">{repo.stars || 0}</span>
                        </span>
                        <span className="text-gray-300 flex items-center">
                          <GitFork className="h-5 w-5 mr-2 text-green-400" />
                          <span className="font-mono text-lg">{repo.forks || 0}</span>
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => window.open(repo.html_url, '_blank')}
                      className="hover:bg-purple-500/20 text-purple-400 hover:text-purple-300"
                    >
                      <ExternalLink className="h-6 w-6" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default GitHubPage;