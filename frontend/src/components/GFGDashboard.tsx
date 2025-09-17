import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader2, RefreshCw, User, Calendar, Code, TrendingUp, Target, Trophy, Clock, Zap } from 'lucide-react';
import { useGFGData } from '../utils/useGFGData';
import { toast } from 'sonner';
import GFGHeatmap from './GFGHeatmap';
import { GFGAnalytics } from '../utils/gfgAnalytics';

const GFGDashboard: React.FC = () => {
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

  // Generate analytics if data is available
  const analytics = data ? new GFGAnalytics(data).generateComprehensiveInsights() : null;

  if (!username || error) {
    return (
      <Card className="p-8 text-center space-y-6">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <Code className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Connect Your GeeksForGeeks Account</h3>
            <p className="text-gray-600 mt-2">
              Track your GeeksForGeeks progress, view detailed analytics, and get AI-powered recommendations.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4 max-w-md mx-auto">
          <div className="space-y-2">
            <label htmlFor="gfg-username" className="block text-sm font-medium text-gray-700">
              GeeksForGeeks Username
            </label>
            <Input
              id="gfg-username"
              type="text"
              placeholder="Enter your GFG username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
            />
          </div>
          <Button 
            onClick={handleConnect} 
            disabled={isConnecting || !newUsername.trim()}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 transition-colors"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect GeeksForGeeks'
            )}
          </Button>
        </div>

        <div className="space-y-3 max-w-lg mx-auto">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-gray-700 mt-1">View your problem-solving statistics and progress</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm text-gray-700 mt-1">Get detailed analytics on your coding patterns</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-sm text-gray-700 mt-1">Receive AI-powered recommendations for improvement</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-sm text-gray-700 mt-1">Track your contribution calendar and streaks</p>
          </div>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Loading GeeksForGeeks Data</h3>
            <p className="text-gray-600">Fetching your latest statistics...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <Code className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No Data Available</h3>
            <p className="text-gray-600">Unable to load GeeksForGeeks data. Please try refreshing.</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">GeeksForGeeks Dashboard</h2>
          <p className="text-gray-600">Track your progress and get insights on your coding journey</p>
        </div>
        <div className="flex items-center space-x-3">
          {backgroundRefreshing && (
            <div className="flex items-center text-sm text-gray-600">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </div>
          )}
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Solved</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalProblemsSolved}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Coding Score</p>
              <p className="text-2xl font-bold text-gray-900">{data.profile.codingScore || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">{data.profile.currentStreak || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Max Streak</p>
              <p className="text-2xl font-bold text-gray-900">{data.profile.maxStreak || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="activity" className="space-y-6">
        <div className="w-full flex justify-center mb-6">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            <TabsTrigger value="activity" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1">
              <Calendar className="h-3 w-3" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="problems" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1">
              <Code className="h-3 w-3" />
              Problems
            </TabsTrigger>
            <TabsTrigger value="profile" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1">
              <User className="h-3 w-3" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="insights" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-1">
              <TrendingUp className="h-3 w-3" />
              Insights
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <GFGHeatmap data={data.activityCalendar} />
          
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Coding Momentum</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Days</span>
                    <span className="font-semibold">{analytics.codingMomentum.activeDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consistency Score</span>
                    <Badge variant={analytics.codingMomentum.consistencyScore > 70 ? 'default' : 'secondary'}>
                      {analytics.codingMomentum.consistencyScore}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Problems per Day</span>
                    <span className="font-semibold">{analytics.codingMomentum.averageProblemsPerDay}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Weekly Pattern</h3>
                <div className="space-y-2">
                  {Object.entries(analytics.codingMomentum.weeklyPattern).map(([day, count]) => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 w-20">{day.slice(0, 3)}</span>
                      <div className="flex-1 mx-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (count / Math.max(...Object.values(analytics.codingMomentum.weeklyPattern))) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Problems Tab */}
        <TabsContent value="problems" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Problem Distribution</h3>
              <div className="space-y-4">
                {[
                  { level: 'School', count: data.stats.School, color: 'bg-gray-500' },
                  { level: 'Basic', count: data.stats.Basic, color: 'bg-green-400' },
                  { level: 'Easy', count: data.stats.Easy, color: 'bg-green-500' },
                  { level: 'Medium', count: data.stats.Medium, color: 'bg-yellow-500' },
                  { level: 'Hard', count: data.stats.Hard, color: 'bg-red-500' },
                ].map(({ level, count, color }) => (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${color}`} />
                      <span className="text-gray-700">{level}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{count}</span>
                      <span className="text-sm text-gray-500">
                        ({Math.round((count / data.stats.totalProblemsSolved) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {analytics && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Difficulty Analysis</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progression Score</span>
                    <Badge variant={analytics.difficultyProgression.progressionScore > 70 ? 'default' : 'secondary'}>
                      {analytics.difficultyProgression.progressionScore}%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{analytics.difficultyProgression.nextLevelRecommendation}</p>
                  </div>
                  {analytics.difficultyProgression.balanceAnalysis.underrepresentedLevels.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Suggestion:</strong> Try more {analytics.difficultyProgression.balanceAnalysis.underrepresentedLevels.join(', ')} problems
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Username</span>
                  <span className="font-semibold">{data.profile.userName}</span>
                </div>
                {data.profile.fullName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Full Name</span>
                    <span className="font-semibold">{data.profile.fullName}</span>
                  </div>
                )}
                {data.profile.institute && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Institute</span>
                    <span className="font-semibold">{data.profile.institute}</span>
                  </div>
                )}
                {data.profile.instituteRank && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Institute Rank</span>
                    <Badge variant="outline">#{data.profile.instituteRank}</Badge>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Coding Score</span>
                  <span className="font-semibold text-blue-600">{data.profile.codingScore || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Score</span>
                  <span className="font-semibold text-green-600">{data.profile.monthlyScore || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Problems</span>
                  <span className="font-semibold">{data.stats.totalProblemsSolved}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Rank</h3>
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold capitalize text-gray-900">
                      {analytics.performanceBenchmarks.totalProblemsRank}
                    </p>
                    <p className="text-sm text-gray-600">Performance Level</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      Estimated {analytics.performanceBenchmarks.codingScoreAnalysis.estimatedPercentile}th percentile
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Growth Opportunities</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Strengths:</p>
                    <div className="space-y-1">
                      {analytics.performanceBenchmarks.strengthsAndWeaknesses.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm text-gray-600">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Areas for Improvement:</p>
                    <div className="space-y-1">
                      {analytics.performanceBenchmarks.strengthsAndWeaknesses.improvementAreas.map((area, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          <span className="text-sm text-gray-600">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GFGDashboard;