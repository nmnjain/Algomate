import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Target, 
  TrendingUp, 
  Brain, 
  Clock, 
  Award, 
  Lightbulb, 
  Flame,
  BookOpen,
  Calendar,
  Zap
} from 'lucide-react';
import { LeetCodeAnalyticsEngine } from '../utils/leetcodeAnalytics';

interface LeetCodeData {
  profile: any;
  stats: any;
  recentSubmissions: any[];
  contestHistory: any[];
  calendar: any[];
  languageStats: any[];
  badges: any[];
  skillStats: any[];
}

interface RecommendationCardProps {
  title: string;
  description: string;
  type: 'skill' | 'practice' | 'contest' | 'consistency' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  actionText: string;
  actionUrl?: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  description,
  type,
  priority,
  icon,
  actionText,
  actionUrl
}) => {
  const priorityColors = {
    high: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
    medium: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
    low: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
  };

  const priorityBadgeColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  };

  return (
    <Card className={`${priorityColors[priority]} border-2`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge className={priorityBadgeColors[priority]}>
            {priority.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">{description}</CardDescription>
        {actionUrl ? (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(actionUrl, '_blank')}
          >
            {actionText}
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

interface LeetCodeRecommendationsProps {
  data: LeetCodeData;
}

export const LeetCodeRecommendations: React.FC<LeetCodeRecommendationsProps> = ({ data }) => {
  
  const generateRecommendations = (): RecommendationCardProps[] => {
    const recommendations: RecommendationCardProps[] = [];
    
    // Get analytics insights using static methods
    const topicMastery = LeetCodeAnalyticsEngine.analyzeTopicMastery(data.skillStats);
    const submissionPatterns = LeetCodeAnalyticsEngine.analyzeSubmissionPatterns(data.recentSubmissions);
    const difficultyProgression = LeetCodeAnalyticsEngine.analyzeDifficultyProgression(data.stats, data.recentSubmissions);
    const codingMomentum = LeetCodeAnalyticsEngine.analyzeCodingMomentum(data.calendar, data.recentSubmissions);
    
    // 1. Topic Weakness Recommendations
    const weakTopics = topicMastery
      .filter(topic => topic.masteryScore < 30 && topic.problemsSolved > 0)
      .sort((a, b) => a.masteryScore - b.masteryScore)
      .slice(0, 2);
    
    weakTopics.forEach(topic => {
      recommendations.push({
        title: `Master ${topic.topic}`,
        description: `You've solved ${topic.problemsSolved} ${topic.topic} problems with a mastery score of ${topic.masteryScore.toFixed(1)}%. Focus on this topic to improve your algorithm skills.`,
        type: 'skill',
        priority: 'high',
        icon: <Brain className="w-5 h-5 text-blue-600" />,
        actionText: 'Practice Problems',
        actionUrl: `https://leetcode.com/tag/${topic.topic.toLowerCase().replace(/\s+/g, '-')}/`
      });
    });

    // 2. Difficulty Progression Recommendations
    const easyPercentage = (data.stats.easySolved / data.stats.totalSolved) * 100;
    const hardPercentage = (data.stats.hardSolved / data.stats.totalSolved) * 100;

    if (easyPercentage > 60 && hardPercentage < 10) {
      recommendations.push({
        title: 'Challenge Yourself with Hard Problems',
        description: `You've mastered easy problems (${data.stats.easySolved} solved). It's time to tackle more challenging problems to advance your skills.`,
        type: 'practice',
        priority: 'medium',
        icon: <TrendingUp className="w-5 h-5 text-orange-600" />,
        actionText: 'Browse Hard Problems',
        actionUrl: 'https://leetcode.com/problemset/all/?difficulty=Hard'
      });
    }

    // 3. Consistency Recommendations
    const activeDaysThisWeek = data.calendar
      .slice(-7)
      .filter(day => day.submissionCount > 0).length;
    
    if (activeDaysThisWeek < 3) {
      recommendations.push({
        title: 'Build a Coding Streak',
        description: `You've been active ${activeDaysThisWeek} out of the last 7 days. Current streak: ${codingMomentum.currentStreak} days. Consistent practice is key to maintaining and improving your problem-solving skills.`,
        type: 'consistency',
        priority: 'high',
        icon: <Flame className="w-5 h-5 text-red-600" />,
        actionText: 'Start Daily Practice',
        actionUrl: 'https://leetcode.com/problemset/all/?listId=wpwgkgt'
      });
    }

    // 4. Contest Participation Recommendations
    const contestCount = data.contestHistory.length;
    const recentContests = data.contestHistory.filter(contest => {
      const contestDate = new Date(contest.contest.startTime * 1000);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return contestDate > thirtyDaysAgo;
    }).length;

    if (contestCount > 0 && recentContests === 0) {
      recommendations.push({
        title: 'Join Weekly Contests',
        description: 'You have contest experience but haven\'t participated recently. Weekly contests help improve speed and accuracy under time pressure.',
        type: 'contest',
        priority: 'medium',
        icon: <Award className="w-5 h-5 text-purple-600" />,
        actionText: 'View Upcoming Contests',
        actionUrl: 'https://leetcode.com/contest/'
      });
    }

    // 5. Language Diversification Recommendations
    const primaryLanguage = data.languageStats[0];
    const languageCount = data.languageStats.length;
    
    if (languageCount === 1 && primaryLanguage?.problemsSolved > 20) {
      recommendations.push({
        title: 'Explore New Programming Languages',
        description: `You've solved ${primaryLanguage.problemsSolved} problems in ${primaryLanguage.languageName}. Learning new languages can broaden your problem-solving perspective.`,
        type: 'skill',
        priority: 'low',
        icon: <BookOpen className="w-5 h-5 text-green-600" />,
        actionText: 'Explore Languages',
        actionUrl: 'https://leetcode.com/problemset/all/'
      });
    }

    // 6. Speed Optimization Recommendations
    const slowSubmissions = data.recentSubmissions.filter(sub => 
      sub.runtime && parseInt(sub.runtime.replace('ms', '')) > 1000
    ).length;
    
    if (slowSubmissions > data.recentSubmissions.length * 0.3) {
      recommendations.push({
        title: 'Optimize Runtime Performance',
        description: 'Several of your recent submissions have slower runtimes. Focus on optimizing algorithms and data structure choices.',
        type: 'optimization',
        priority: 'medium',
        icon: <Zap className="w-5 h-5 text-yellow-600" />,
        actionText: 'Learn Optimization',
        actionUrl: 'https://leetcode.com/explore/learn/card/recursion-i/'
      });
    }

    // 7. Study Plan Recommendations
    if (data.stats.totalSolved > 50 && data.stats.totalSolved < 200) {
      recommendations.push({
        title: 'Follow a Structured Study Plan',
        description: 'You\'ve built a solid foundation. Consider following LeetCode\'s curated study plans to systematically improve your skills.',
        type: 'practice',
        priority: 'medium',
        icon: <Calendar className="w-5 h-5 text-indigo-600" />,
        actionText: 'Browse Study Plans',
        actionUrl: 'https://leetcode.com/study-plan/'
      });
    }

    // Return top 6 recommendations
    return recommendations.slice(0, 6);
  };

  const recommendations = generateRecommendations();

  if (recommendations.length === 0) {
    return (
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          Great job! You're maintaining excellent coding practices. Keep up the consistent work and continue challenging yourself with diverse problems.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Personalized Recommendations</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          AI-powered suggestions to accelerate your coding journey based on your solving patterns and skill gaps.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.map((rec, index) => (
          <RecommendationCard key={index} {...rec} />
        ))}
      </div>
      
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          These recommendations are generated based on your solving patterns, topic coverage, and activity trends. 
          Focus on high-priority items first for maximum impact on your problem-solving skills.
        </AlertDescription>
      </Alert>
    </div>
  );
};
