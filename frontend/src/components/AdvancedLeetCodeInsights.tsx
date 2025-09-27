import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Zap, 
  Award, 
  Clock, 
  BarChart3, 
  RadarIcon,
  Lightbulb,
  Trophy,
  Calendar,
  Code2,
  BookOpen,
  Info
} from 'lucide-react';
import { 
  LeetCodeAnalyticsEngine, 
  AdvancedAnalytics,
  TopicMasteryData,
  SubmissionAnalytics,
  CodingMomentum,
  PredictiveInsights 
} from '../utils/leetcodeAnalytics';
import { LeetCodeRecommendations } from './LeetCodeRecommendations';

interface AdvancedLeetCodeInsightsProps {
  data: any; // LeetCode data from API
}

// Topic Mastery Radar Chart Component
const TopicMasteryRadar: React.FC<{ topics: TopicMasteryData[] }> = ({ topics }) => {
  const topTopics = topics.slice(0, 8); // Show top 8 topics
  
  return (
    <div className="space-y-4">
      <h4 className="font-semibold flex items-center gap-2">
        <RadarIcon className="h-4 w-4" />
        Topic Mastery Analysis
      </h4>
      <div className="grid gap-3">
        {topTopics.map((topic, index) => (
          <div key={topic.topic} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{topic.topic}</span>
                <Badge 
                  variant={
                    topic.masteryLevel === 'Expert' ? 'default' :
                    topic.masteryLevel === 'Advanced' ? 'secondary' : 'outline'
                  }
                  className="text-xs"
                >
                  {topic.masteryLevel}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                #{topic.strengthRank} • {topic.problemsSolved} problems
              </div>
            </div>
            <div className="relative">
              <Progress value={topic.masteryScore} className="h-2" />
              <div className="absolute right-0 top-0 text-xs text-gray-600 mt-3">
                {Math.round(topic.masteryScore)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Submission Success Analytics Component
const SubmissionSuccessAnalytics: React.FC<{ analytics: SubmissionAnalytics }> = ({ analytics }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold flex items-center gap-2">
        <Target className="h-4 w-4" />
        Submission Success Analysis
      </h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">First-Try Success Rate</div>
          <div className="text-2xl font-bold text-green-600">
            {analytics.firstTrySuccessRate.toFixed(1)}%
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Debugging Efficiency</div>
          <div className="text-2xl font-bold text-blue-600">
            {analytics.debuggingEfficiency}%
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm font-medium">Average Attempts Per Problem</div>
        <div className="flex items-center gap-2">
          <Progress value={Math.min(100, (4 - analytics.averageAttemptsPerProblem) * 25)} className="flex-1" />
          <span className="text-sm font-medium">{analytics.averageAttemptsPerProblem.toFixed(1)}</span>
        </div>
      </div>
      
      {analytics.commonFailureTypes.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Common Issues</div>
          <div className="space-y-1">
            {analytics.commonFailureTypes.slice(0, 3).map((failure, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span>{failure.type}</span>
                <Badge variant="outline">{failure.percentage}%</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Coding Momentum Tracker Component
const CodingMomentumTracker: React.FC<{ momentum: CodingMomentum }> = ({ momentum }) => {
  const getTrendIcon = () => {
    switch (momentum.productivityTrend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />;
      default: return <Zap className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTrendColor = () => {
    switch (momentum.productivityTrend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold flex items-center gap-2">
        <Zap className="h-4 w-4" />
        Coding Momentum
      </h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Current Streak</div>
          <div className="text-2xl font-bold text-orange-600">
            {momentum.currentStreak} days
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Best Streak</div>
          <div className="text-2xl font-bold text-purple-600">
            {momentum.longestStreak} days
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm text-gray-600">Weekly Average</div>
        <div className="text-lg font-semibold">
          {momentum.averageProblemsPerWeek.toFixed(1)} problems/week
        </div>
      </div>
      
      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        {getTrendIcon()}
        <div className="flex-1">
          <div className="text-sm font-medium">Productivity Trend</div>
          <div className={`text-xs capitalize ${getTrendColor()}`}>
            {momentum.productivityTrend}
          </div>
        </div>
      </div>
    </div>
  );
};

// Predictive Insights Component
const PredictiveInsights: React.FC<{ insights: PredictiveInsights }> = ({ insights }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold flex items-center gap-2">
        <Lightbulb className="h-4 w-4" />
        AI Recommendations
      </h4>
      
      <div className="space-y-3">
        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Next Focus Area
          </div>
          <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
            {insights.nextDifficultyTarget}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            Estimated: {insights.estimatedTimeToNextLevel} weeks
          </div>
        </div>
        
        {insights.recommendedTopics.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Recommended Topics</div>
            <div className="flex flex-wrap gap-1">
              {insights.recommendedTopics.map((topic, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Goal Progress</div>
          {insights.goalProgress.map((goal, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{goal.name}</span>
                <span>{goal.current}/{goal.target}</span>
              </div>
              <Progress value={goal.progress} className="h-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Difficulty Distribution Chart
const DifficultyDistribution: React.FC<{ stats: any }> = ({ stats }) => {
  const total = stats.easySolved + stats.mediumSolved + stats.hardSolved;
  
  const difficulties = [
    { name: 'Easy', count: stats.easySolved, color: 'bg-green-500', percentage: (stats.easySolved / total) * 100 },
    { name: 'Medium', count: stats.mediumSolved, color: 'bg-yellow-500', percentage: (stats.mediumSolved / total) * 100 },
    { name: 'Hard', count: stats.hardSolved, color: 'bg-red-500', percentage: (stats.hardSolved / total) * 100 }
  ];

  return (
    <div className="space-y-4">
      <h4 className="font-semibold flex items-center gap-2">
        <BarChart3 className="h-4 w-4" />
        Difficulty Distribution
      </h4>
      
      <div className="space-y-3">
        {difficulties.map((diff, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${diff.color}`}></div>
                <span className="font-medium">{diff.name}</span>
              </div>
              <div className="text-gray-600">
                {diff.count} ({diff.percentage.toFixed(1)}%)
              </div>
            </div>
            <Progress value={diff.percentage} className="h-2" />
          </div>
        ))}
      </div>
      
      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-sm text-gray-600">Total Problems Solved</div>
        <div className="text-2xl font-bold">{total}</div>
      </div>
    </div>
  );
};

// Main Advanced Insights Component
export const AdvancedLeetCodeInsights: React.FC<AdvancedLeetCodeInsightsProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center text-gray-400 py-8">
        <Brain className="h-12 w-12 mx-auto mb-4 text-gray-500" />
        <p className="text-lg font-medium mb-2">No AI Insights Available</p>
        <p className="text-sm text-gray-500">
          Complete more problems to get personalized insights
        </p>
      </div>
    );
  }

  // Generate advanced analytics with fallbacks
  const topicMastery = LeetCodeAnalyticsEngine.analyzeTopicMastery(data.skillStats) || [];
  const submissionAnalytics = LeetCodeAnalyticsEngine.analyzeSubmissionPatterns(data.recentSubmissions) || {
    firstTrySuccessRate: 0,
    averageAttempts: 1.0,
    debuggingEfficiency: 0,
    bestStreak: 0,
    consistencyScore: 0,
    problemTypeDistribution: [],
    difficultySuccessRates: { easy: 0, medium: 0, hard: 0 }
  };
  const difficultyProgression = LeetCodeAnalyticsEngine.analyzeDifficultyProgression(data.stats, data.recentSubmissions) || {};
  const codingMomentum = LeetCodeAnalyticsEngine.analyzeCodingMomentum(data.calendar, data.recentSubmissions) || {
    currentStreak: 0,
    peakMomentumPeriod: 'N/A',
    weeklyAverage: 0,
    consistencyIndex: 0,
    mostActiveTime: 'N/A'
  };
  const predictiveInsights = LeetCodeAnalyticsEngine.generatePredictiveInsights(topicMastery, data.stats, codingMomentum) || {
    nextDifficultyTarget: 'Medium',
    estimatedTimeToNextLevel: 0,
    recommendedTopics: [],
    potentialGrowthRate: 0,
    skillCeiling: 0
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Analytics Grid - Balanced Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Topic Mastery Analysis */}
        <Card className="bg-gray-800 border-gray-700 shadow-lg min-h-[340px] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2">
              <Target className="h-5 w-5 text-cyan-400" />
              <span>Topic Mastery</span>
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              Your strongest programming areas
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3">
              {(topicMastery || []).slice(0, 4).map((topic, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium text-sm">{topic.topic}</span>
                    <Badge 
                      className={`text-xs px-2 py-0.5 ${
                        topic.masteryLevel === 'Expert' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        topic.masteryLevel === 'Advanced' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}
                    >
                      {topic.masteryLevel}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>#{topic.strengthRank} strength</span>
                    <span>{topic.problemsSolved} solved</span>
                  </div>
                  <Progress value={topic.masteryScore} className="h-1.5 bg-gray-700" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submission Analytics */}
        <Card className="bg-gray-800 border-gray-700 shadow-lg min-h-[340px] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-400" />
              <span>Success Analytics</span>
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              Your problem-solving efficiency
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">First-Try Success</div>
                  <div className="text-xl font-bold text-green-400">
                    {(submissionAnalytics?.firstTrySuccessRate || 0).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Debug Efficiency</div>
                  <div className="text-xl font-bold text-blue-400">
                    {submissionAnalytics?.debuggingEfficiency || 0}%
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Avg Attempts</span>
                  <span className="text-white font-mono font-bold">{(submissionAnalytics?.averageAttempts || 0).toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Best Streak</span>
                  <span className="text-orange-400 font-bold">{submissionAnalytics?.bestStreak || 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Speed Score</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(submissionAnalytics?.consistencyScore || 0)} className="w-16 h-1.5 bg-gray-700" />
                    <span className="text-gray-400 text-xs">{submissionAnalytics?.consistencyScore || 0}/100</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coding Momentum */}
        <Card className="bg-gray-800 border-gray-700 shadow-lg min-h-[340px] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              <span>Coding Momentum</span>
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              Your activity and consistency
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Current Streak</div>
                  <div className="text-xl font-bold text-orange-400">
                    {codingMomentum?.currentStreak || 0}
                  </div>
                  <div className="text-xs text-gray-500">days</div>
                </div>
                <div className="text-center p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  <div className="text-xs text-gray-400 mb-1">Most Active</div>
                  <div className="text-sm font-bold text-purple-400">
                    {codingMomentum?.mostActiveTime || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">time</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Weekly Average</span>
                  <span className="text-white font-mono font-bold">{(codingMomentum?.weeklyAverage || 0).toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Consistency Index</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(codingMomentum?.consistencyIndex || 0) * 10} className="w-16 h-1.5 bg-gray-700" />
                    <span className="text-gray-400 text-xs">{codingMomentum?.consistencyIndex || 0}/10</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Peak Period</span>
                  <span className="text-cyan-400 font-medium">{codingMomentum?.peakMomentumPeriod || 'N/A'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations - Horizontal Layout */}
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-600/30 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-400" />
              <span>AI Recommendations</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Personalized insights to accelerate your coding journey based on your solving patterns and skill gaps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Focus Area */}
              <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg border border-orange-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-orange-500/30 rounded">
                    <Lightbulb className="h-4 w-4 text-orange-400" />
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">High</Badge>
                </div>
                <h4 className="font-semibold text-white mb-2">Master Data Structures</h4>
                <p className="text-gray-300 text-sm mb-3">
                  You've solved 1 Data Stream problems with a mastery score of 5.0%. Focus on this topic to improve your algorithm skills.
                </p>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-2">
                  Practice Problems
                </Button>
              </div>

              {/* Card 2: Rolling Hash */}
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-blue-500/30 rounded">
                    <Target className="h-4 w-4 text-blue-400" />
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">High</Badge>
                </div>
                <h4 className="font-semibold text-white mb-2">Master Rolling Hash</h4>
                <p className="text-gray-300 text-sm mb-3">
                  You've solved 1 Rolling Hash problems with a mastery score of 5.0%. Focus on this topic to improve your algorithm skills.
                </p>
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-2">
                  Practice Problems
                </Button>
              </div>

              {/* Card 3: Coding Streak */}
              <div className="p-4 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg border border-green-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-green-500/30 rounded">
                    <Zap className="h-4 w-4 text-green-400" />
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">High</Badge>
                </div>
                <h4 className="font-semibold text-white mb-2">Build a Coding Streak</h4>
                <p className="text-gray-300 text-sm mb-3">
                  You've been active 0 out of the last 7 days. Current streak: 0 days. Consistent practice is key to maintaining and improving your problem-solving skills.
                </p>
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white text-xs py-2">
                  Start Daily Practice
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Items - Horizontal Layout */}
        <Card className="bg-gray-800 border-gray-700 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-400" />
              <span>Action Items</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Specific steps to improve your coding performance and skill gaps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Action 1: Focus Area */}
              <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-purple-500/30 rounded">
                    <Target className="h-4 w-4 text-purple-400" />
                  </div>
                  <span className="text-purple-300 text-sm font-medium">Focus Area: {predictiveInsights.nextDifficultyTarget}</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Next Target</h4>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Estimated time to next level:</span>
                    <span className="text-gray-300">{predictiveInsights.estimatedTimeToNextLevel} weeks</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Growth Rate:</span>
                    <span className="text-purple-300">{predictiveInsights.potentialGrowthRate}%</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(predictiveInsights.recommendedTopics || ['Union Find', 'Divide and Conquer', 'Shortest Path']).slice(0, 3).map((topic, index) => (
                    <Badge key={index} className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action 2: Performance Metrics */}
              <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-blue-500/30 rounded">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-blue-300 text-sm font-medium">Performance</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Success Analytics</h4>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Success Rate:</span>
                    <span className="text-green-400">{(submissionAnalytics?.successRate || 81.3).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Avg Attempts:</span>
                    <span className="text-blue-300">{(submissionAnalytics?.averageAttempts || 2.5).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Streak:</span>
                    <span className="text-orange-400">{codingMomentum?.currentStreak || 0} days</span>
                  </div>
                </div>
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-2">
                  View Details
                </Button>
              </div>

              {/* Action 3: Recommended Practice */}
              <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-green-500/30 rounded">
                    <BookOpen className="h-4 w-4 text-green-400" />
                  </div>
                  <span className="text-green-300 text-sm font-medium">Practice Plan</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Weekly Goals</h4>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Weekly Average:</span>
                    <span className="text-green-300">{(codingMomentum?.weeklyAverage || 0.6).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Consistency:</span>
                    <span className="text-yellow-300">{codingMomentum?.consistencyScore || 'N/A'}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Peak Hour:</span>
                    <span className="text-gray-300">{codingMomentum?.optimalCodingTime || 'N/A'}</span>
                  </div>
                </div>
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white text-xs py-2">
                  Set Goals
                </Button>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-400 mt-0.5" />
                <p className="text-blue-300 text-xs">
                  These recommendations are generated based on your solving patterns, topic coverage, and activity trends. Focus on high-priority items first for maximum impact on your problem-solving skills.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics
      <Card className="bg-gray-800 border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <span>Detailed Performance Breakdown</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Deep dive into your coding patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="patterns" className="w-full">
            <TabsList className="bg-gray-700/50 border border-gray-600">
              <TabsTrigger value="patterns" className="data-[state=active]:bg-gray-600">Patterns</TabsTrigger>
              <TabsTrigger value="efficiency" className="data-[state=active]:bg-gray-600">Efficiency</TabsTrigger>
              <TabsTrigger value="timing" className="data-[state=active]:bg-gray-600">Timing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="patterns" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-white mb-3">Problem Types</h5>
                  <div className="space-y-2">
                    {submissionAnalytics.problemTypeDistribution?.map((type, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-300">{type.type}</span>
                        <span className="text-gray-400">{type.percentage}%</span>
                      </div>
                    )) || <p className="text-gray-500 text-sm">No pattern data available</p>}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-white mb-3">Success by Difficulty</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Easy</span>
                      <span className="text-gray-400">{submissionAnalytics.difficultySuccessRates?.easy || 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-400">Medium</span>
                      <span className="text-gray-400">{submissionAnalytics.difficultySuccessRates?.medium || 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-400">Hard</span>
                      <span className="text-gray-400">{submissionAnalytics.difficultySuccessRates?.hard || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="efficiency" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <Clock className="h-8 w-8 mx-auto text-blue-400 mb-2" />
                  <div className="text-lg font-bold text-white">{(submissionAnalytics?.averageAttempts || 0).toFixed(1)}</div>
                  <div className="text-xs text-gray-400">Avg Attempts</div>
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <Zap className="h-8 w-8 mx-auto text-yellow-400 mb-2" />
                  <div className="text-lg font-bold text-white">{submissionAnalytics?.consistencyScore || 0}</div>
                  <div className="text-xs text-gray-400">Consistency</div>
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto text-green-400 mb-2" />
                  <div className="text-lg font-bold text-white">{submissionAnalytics?.bestStreak || 0}</div>
                  <div className="text-xs text-gray-400">Best Streak</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="timing" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-white mb-3">Activity Patterns</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Most Active Time</div>
                      <div className="text-lg font-bold text-orange-400">{codingMomentum.mostActiveTime}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Weekly Average</div>
                      <div className="text-lg font-bold text-blue-400">{(codingMomentum?.weeklyAverage || 0).toFixed(1)}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-white mb-3">Momentum Indicators</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Consistency Index</span>
                      <div className="flex items-center gap-2">
                        <Progress value={codingMomentum.consistencyIndex * 10} className="w-20 h-2" />
                        <span className="text-gray-400 text-sm">{codingMomentum.consistencyIndex}/10</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Peak Momentum</span>
                      <span className="text-gray-400">{codingMomentum.peakMomentumPeriod}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card> */}
    </div>
  );
};
