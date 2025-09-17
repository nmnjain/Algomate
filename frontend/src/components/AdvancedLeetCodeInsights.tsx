import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
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
  Code2
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
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No data available for advanced analytics
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generate advanced analytics
  const topicMastery = LeetCodeAnalyticsEngine.analyzeTopicMastery(data.skillStats);
  const submissionAnalytics = LeetCodeAnalyticsEngine.analyzeSubmissionPatterns(data.recentSubmissions);
  const difficultyProgression = LeetCodeAnalyticsEngine.analyzeDifficultyProgression(data.stats, data.recentSubmissions);
  const codingMomentum = LeetCodeAnalyticsEngine.analyzeCodingMomentum(data.calendar, data.recentSubmissions);
  const predictiveInsights = LeetCodeAnalyticsEngine.generatePredictiveInsights(topicMastery, data.stats, codingMomentum);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-semibold">Advanced Analytics</h3>
        <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Mastery */}
        <Card>
          <CardContent className="p-6">
            <TopicMasteryRadar topics={topicMastery} />
          </CardContent>
        </Card>

        {/* Submission Analytics */}
        <Card>
          <CardContent className="p-6">
            <SubmissionSuccessAnalytics analytics={submissionAnalytics} />
          </CardContent>
        </Card>

        {/* Coding Momentum */}
        <Card>
          <CardContent className="p-6">
            <CodingMomentumTracker momentum={codingMomentum} />
          </CardContent>
        </Card>

        {/* Predictive Insights */}
        <Card>
          <CardContent className="p-6">
            <PredictiveInsights insights={predictiveInsights} />
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Distribution */}
      <Card>
        <CardContent className="p-6">
          <DifficultyDistribution stats={data.stats} />
        </CardContent>
      </Card>

      {/* Additional Insights Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Detailed Insights
          </CardTitle>
          <CardDescription>
            Deep dive into your coding patterns and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="patterns" className="space-y-4">
            <div className="w-full flex justify-center mb-4">
              <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                <TabsTrigger value="patterns" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  Patterns
                </TabsTrigger>
                <TabsTrigger value="growth" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  Growth
                </TabsTrigger>
                <TabsTrigger value="comparison" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  Benchmarks
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  AI Recommendations
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="patterns" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Problem-Solving Style</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Preferred Difficulty:</span>
                      <span className="font-medium">{difficultyProgression.currentFocus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium">{submissionAnalytics.firstTrySuccessRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Attempts:</span>
                      <span className="font-medium">{submissionAnalytics.averageAttemptsPerProblem.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Activity Patterns</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Current Streak:</span>
                      <span className="font-medium">{codingMomentum.currentStreak} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekly Rate:</span>
                      <span className="font-medium">{codingMomentum.averageProblemsPerWeek.toFixed(1)} problems</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Momentum:</span>
                      <span className={`font-medium capitalize ${
                        codingMomentum.productivityTrend === 'increasing' ? 'text-green-600' :
                        codingMomentum.productivityTrend === 'decreasing' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {codingMomentum.productivityTrend}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="growth" className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Growth Trajectory</h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Progress to Next Level</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {predictiveInsights.nextDifficultyTarget}
                    </div>
                    <div className="text-xs text-gray-500">
                      ETA: {predictiveInsights.estimatedTimeToNextLevel} weeks at current pace
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="text-sm font-medium mb-2">Skill Development Areas</div>
                    <div className="flex flex-wrap gap-1">
                      {predictiveInsights.recommendedTopics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Performance Benchmarks</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Global Ranking</div>
                      <div className="text-lg font-semibold">#{data.stats.ranking.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Total Solved</div>
                      <div className="text-lg font-semibold">{data.stats.totalSolved}</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="text-sm text-gray-600 mb-2">Strongest Topics</div>
                    <div className="space-y-1">
                      {topicMastery.slice(0, 3).map((topic, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span>{topic.topic}</span>
                          <span className="font-medium">{topic.problemsSolved} problems</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="recommendations" className="space-y-4">
              <LeetCodeRecommendations data={data} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
