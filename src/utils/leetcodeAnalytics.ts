// Advanced LeetCode Analytics Engine
// This utility processes raw LeetCode data to extract meaningful insights

export interface AdvancedAnalytics {
  topicMastery: TopicMasteryData[];
  submissionAnalytics: SubmissionAnalytics;
  difficultyProgression: DifficultyProgression;
  codingMomentum: CodingMomentum;
  streakAnalysis: StreakAnalysis;
  languageEvolution: LanguageEvolution;
  predictiveInsights: PredictiveInsights;
}

export interface TopicMasteryData {
  topic: string;
  problemsSolved: number;
  masteryLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  masteryScore: number; // 0-100
  strengthRank: number;
  relativePerformance: number;
}

export interface SubmissionAnalytics {
  firstTrySuccessRate: number;
  averageAttemptsPerProblem: number;
  commonFailureTypes: FailureTypeAnalysis[];
  debuggingEfficiency: number;
  submissionPatterns: SubmissionPattern[];
}

export interface FailureTypeAnalysis {
  type: 'Time Limit Exceeded' | 'Runtime Error' | 'Compile Error' | 'Wrong Answer';
  count: number;
  percentage: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface DifficultyProgression {
  easyToMediumTransition: Date | null;
  mediumToHardTransition: Date | null;
  currentFocus: 'Easy' | 'Medium' | 'Hard';
  difficultyDistributionTrend: DifficultyTrend[];
  progressionVelocity: number;
}

export interface CodingMomentum {
  currentStreak: number;
  longestStreak: number;
  averageProblemsPerWeek: number;
  productivityTrend: 'increasing' | 'stable' | 'decreasing';
  bestPerformancePeriod: DateRange;
}

export interface StreakAnalysis {
  currentActiveStreak: number;
  longestHistoricalStreak: number;
  streakFrequency: number;
  averageStreakLength: number;
  streakBreakPatterns: string[];
}

export interface LanguageEvolution {
  primaryLanguage: string;
  languageShifts: LanguageShift[];
  proficiencyByLanguage: LanguageProficiency[];
}

export interface PredictiveInsights {
  recommendedTopics: string[];
  nextDifficultyTarget: string;
  estimatedTimeToNextLevel: number;
  goalProgress: GoalProgress[];
}

// Advanced Analytics Engine
export class LeetCodeAnalyticsEngine {
  
  static analyzeTopicMastery(skillStats: any[]): TopicMasteryData[] {
    if (!skillStats?.length) return [];
    
    const totalProblems = skillStats.reduce((sum, skill) => sum + skill.problemsSolved, 0);
    
    return skillStats
      .sort((a, b) => b.problemsSolved - a.problemsSolved)
      .map((skill, index) => {
        const masteryScore = this.calculateMasteryScore(skill.problemsSolved);
        return {
          topic: skill.tagName,
          problemsSolved: skill.problemsSolved,
          masteryLevel: this.getMasteryLevel(masteryScore),
          masteryScore,
          strengthRank: index + 1,
          relativePerformance: (skill.problemsSolved / totalProblems) * 100
        };
      });
  }
  
  static analyzeSubmissionPatterns(submissions: any[]): SubmissionAnalytics {
    if (!submissions?.length) {
      return {
        firstTrySuccessRate: 0,
        averageAttemptsPerProblem: 0,
        commonFailureTypes: [],
        debuggingEfficiency: 0,
        submissionPatterns: []
      };
    }
    
    // Group submissions by problem
    const problemGroups = this.groupSubmissionsByProblem(submissions);
    
    // Calculate first-try success rate
    const firstTrySuccesses = Object.values(problemGroups)
      .filter((problemSubmissions: any) => 
        problemSubmissions.length === 1 && 
        problemSubmissions[0].statusDisplay === 'Accepted'
      ).length;
    
    const firstTrySuccessRate = (firstTrySuccesses / Object.keys(problemGroups).length) * 100;
    
    // Calculate average attempts per problem
    const totalAttempts = Object.values(problemGroups)
      .reduce((sum: number, problemSubmissions: any) => sum + problemSubmissions.length, 0);
    
    const averageAttemptsPerProblem = totalAttempts / Object.keys(problemGroups).length;
    
    // Analyze failure types
    const failureTypes = this.analyzeFailureTypes(submissions);
    
    // Calculate debugging efficiency (lower attempts = higher efficiency)
    const debuggingEfficiency = Math.max(0, 100 - (averageAttemptsPerProblem - 1) * 20);
    
    return {
      firstTrySuccessRate: Math.round(firstTrySuccessRate * 100) / 100,
      averageAttemptsPerProblem: Math.round(averageAttemptsPerProblem * 100) / 100,
      commonFailureTypes: failureTypes,
      debuggingEfficiency: Math.round(debuggingEfficiency),
      submissionPatterns: this.identifySubmissionPatterns(submissions)
    };
  }
  
  static analyzeDifficultyProgression(stats: any, submissions: any[]): DifficultyProgression {
    const { easySolved, mediumSolved, hardSolved } = stats;
    
    // Determine current focus based on recent submissions and ratios
    let currentFocus: 'Easy' | 'Medium' | 'Hard' = 'Easy';
    
    if (hardSolved > 10 && hardSolved / (easySolved + mediumSolved + hardSolved) > 0.1) {
      currentFocus = 'Hard';
    } else if (mediumSolved > easySolved / 2) {
      currentFocus = 'Medium';
    }
    
    // Calculate progression velocity (problems per month)
    const totalProblems = easySolved + mediumSolved + hardSolved;
    const progressionVelocity = this.calculateProgressionVelocity(submissions, totalProblems);
    
    return {
      easyToMediumTransition: mediumSolved > 0 ? this.estimateTransitionDate(submissions, 'Medium') : null,
      mediumToHardTransition: hardSolved > 0 ? this.estimateTransitionDate(submissions, 'Hard') : null,
      currentFocus,
      difficultyDistributionTrend: this.analyzeDifficultyTrend(easySolved, mediumSolved, hardSolved),
      progressionVelocity
    };
  }
  
  static analyzeCodingMomentum(calendar: any[], submissions: any[]): CodingMomentum {
    if (!calendar?.length) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        averageProblemsPerWeek: 0,
        productivityTrend: 'stable',
        bestPerformancePeriod: { start: new Date(), end: new Date() }
      };
    }
    
    // Calculate streaks from calendar data
    const streakData = this.calculateStreaks(calendar);
    
    // Calculate weekly averages
    const weeksWithActivity = calendar.filter(day => day.submissionCount > 0).length / 7;
    const totalSubmissions = calendar.reduce((sum, day) => sum + day.submissionCount, 0);
    const averageProblemsPerWeek = weeksWithActivity > 0 ? totalSubmissions / weeksWithActivity : 0;
    
    // Determine productivity trend
    const productivityTrend = this.calculateProductivityTrend(calendar);
    
    // Find best performance period
    const bestPerformancePeriod = this.findBestPerformancePeriod(calendar);
    
    return {
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      averageProblemsPerWeek: Math.round(averageProblemsPerWeek * 10) / 10,
      productivityTrend,
      bestPerformancePeriod
    };
  }
  
  static generatePredictiveInsights(
    topicMastery: TopicMasteryData[], 
    stats: any, 
    analytics: any
  ): PredictiveInsights {
    // Find weak areas for recommendations
    const weakTopics = topicMastery
      .filter(topic => topic.masteryLevel === 'Beginner' || topic.masteryLevel === 'Intermediate')
      .slice(0, 3)
      .map(topic => topic.topic);
    
    // Determine next difficulty target
    const { easySolved, mediumSolved, hardSolved } = stats;
    let nextDifficultyTarget = 'Medium';
    
    if (easySolved > 50 && mediumSolved < 30) {
      nextDifficultyTarget = 'Medium';
    } else if (mediumSolved > 100 && hardSolved < 20) {
      nextDifficultyTarget = 'Hard';
    } else if (hardSolved > 50) {
      nextDifficultyTarget = 'Expert Hard';
    }
    
    // Estimate time to next level (based on current velocity)
    const currentVelocity = analytics.averageProblemsPerWeek || 1;
    const problemsNeeded = this.calculateProblemsNeededForNextLevel(stats, nextDifficultyTarget);
    const estimatedTimeToNextLevel = Math.ceil(problemsNeeded / currentVelocity);
    
    return {
      recommendedTopics: weakTopics,
      nextDifficultyTarget,
      estimatedTimeToNextLevel,
      goalProgress: this.calculateGoalProgress(stats)
    };
  }
  
  // Helper methods
  private static calculateMasteryScore(problemsSolved: number): number {
    if (problemsSolved === 0) return 0;
    if (problemsSolved < 5) return Math.min(25, problemsSolved * 5);
    if (problemsSolved < 15) return 25 + (problemsSolved - 5) * 2.5;
    if (problemsSolved < 40) return 50 + (problemsSolved - 15) * 1.5;
    return Math.min(100, 87.5 + (problemsSolved - 40) * 0.25);
  }
  
  private static getMasteryLevel(score: number): 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' {
    if (score < 25) return 'Beginner';
    if (score < 50) return 'Intermediate';
    if (score < 80) return 'Advanced';
    return 'Expert';
  }
  
  private static groupSubmissionsByProblem(submissions: any[]) {
    return submissions.reduce((groups, submission) => {
      const key = submission.titleSlug;
      if (!groups[key]) groups[key] = [];
      groups[key].push(submission);
      return groups;
    }, {});
  }
  
  private static analyzeFailureTypes(submissions: any[]): FailureTypeAnalysis[] {
    const failures = submissions.filter(s => s.statusDisplay !== 'Accepted');
    const total = failures.length;
    
    if (total === 0) return [];
    
    const types = failures.reduce((acc, submission) => {
      const type = submission.statusDisplay;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(types).map(([type, count]: [string, any]) => ({
      type: type as any,
      count,
      percentage: Math.round((count / total) * 100),
      trend: 'stable' as const // Would need historical data for actual trend
    }));
  }
  
  private static calculateStreaks(calendar: any[]) {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Calculate current streak (from today backwards)
    const today = new Date().toISOString().split('T')[0];
    const sortedCalendar = [...calendar]
      .filter(day => day.date <= today)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    for (const day of sortedCalendar) {
      if (day.submissionCount > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    for (const day of calendar.sort((a, b) => a.date.localeCompare(b.date))) {
      if (day.submissionCount > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    return { currentStreak, longestStreak };
  }
  
  private static calculateProgressionVelocity(submissions: any[], totalProblems: number): number {
    if (!submissions.length) return 0;
    
    // Estimate based on recent submission frequency
    const recentSubmissions = submissions.slice(0, 10);
    const timeSpan = recentSubmissions.length > 1 ? 
      parseInt(recentSubmissions[0].timestamp) - parseInt(recentSubmissions[recentSubmissions.length - 1].timestamp) : 
      0;
    
    if (timeSpan === 0) return 0;
    
    const problemsPerSecond = recentSubmissions.length / timeSpan;
    const problemsPerMonth = problemsPerSecond * 30 * 24 * 60 * 60;
    
    return Math.round(problemsPerMonth * 10) / 10;
  }
  
  private static calculateProductivityTrend(calendar: any[]): 'increasing' | 'stable' | 'decreasing' {
    if (calendar.length < 14) return 'stable';
    
    const recentWeek = calendar.slice(-7).reduce((sum, day) => sum + day.submissionCount, 0);
    const previousWeek = calendar.slice(-14, -7).reduce((sum, day) => sum + day.submissionCount, 0);
    
    if (recentWeek > previousWeek * 1.2) return 'increasing';
    if (recentWeek < previousWeek * 0.8) return 'decreasing';
    return 'stable';
  }
  
  private static findBestPerformancePeriod(calendar: any[]) {
    // Find the 7-day period with highest activity
    let maxActivity = 0;
    let bestStart = 0;
    
    for (let i = 0; i <= calendar.length - 7; i++) {
      const weekActivity = calendar.slice(i, i + 7).reduce((sum, day) => sum + day.submissionCount, 0);
      if (weekActivity > maxActivity) {
        maxActivity = weekActivity;
        bestStart = i;
      }
    }
    
    return {
      start: new Date(calendar[bestStart]?.date || new Date()),
      end: new Date(calendar[bestStart + 6]?.date || new Date())
    };
  }
  
  private static calculateProblemsNeededForNextLevel(stats: any, target: string): number {
    const { easySolved, mediumSolved, hardSolved } = stats;
    
    switch (target) {
      case 'Medium': return Math.max(0, 100 - mediumSolved);
      case 'Hard': return Math.max(0, 50 - hardSolved);
      case 'Expert Hard': return Math.max(0, 100 - hardSolved);
      default: return 10;
    }
  }
  
  private static calculateGoalProgress(stats: any) {
    const goals = [
      { name: 'Easy Master', target: 200, current: stats.easySolved },
      { name: 'Medium Explorer', target: 150, current: stats.mediumSolved },
      { name: 'Hard Challenger', target: 50, current: stats.hardSolved },
      { name: 'Total Problems', target: 500, current: stats.totalSolved }
    ];
    
    return goals.map(goal => ({
      ...goal,
      progress: Math.min(100, (goal.current / goal.target) * 100)
    }));
  }
  
  private static identifySubmissionPatterns(submissions: any[]) {
    // Analyze submission timing patterns
    const hourCounts = new Array(24).fill(0);
    
    submissions.forEach(submission => {
      const date = new Date(parseInt(submission.timestamp) * 1000);
      const hour = date.getHours();
      hourCounts[hour]++;
    });
    
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    
    return [
      { pattern: 'Peak Activity Hour', value: `${peakHour}:00` },
      { pattern: 'Total Sessions', value: submissions.length.toString() }
    ];
  }
  
  private static estimateTransitionDate(submissions: any[], difficulty: string): Date | null {
    // This would require actual difficulty data per submission
    // For now, return null - could be enhanced with more data
    return null;
  }
  
  private static analyzeDifficultyTrend(easy: number, medium: number, hard: number) {
    const total = easy + medium + hard;
    return [
      { difficulty: 'Easy', count: easy, percentage: (easy / total) * 100 },
      { difficulty: 'Medium', count: medium, percentage: (medium / total) * 100 },
      { difficulty: 'Hard', count: hard, percentage: (hard / total) * 100 }
    ];
  }
}

// Helper interfaces
interface DateRange {
  start: Date;
  end: Date;
}

interface DifficultyTrend {
  difficulty: string;
  count: number;
  percentage: number;
}

interface SubmissionPattern {
  pattern: string;
  value: string;
}

interface LanguageShift {
  from: string;
  to: string;
  transitionDate: Date;
}

interface LanguageProficiency {
  language: string;
  problemsSolved: number;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface GoalProgress {
  name: string;
  target: number;
  current: number;
  progress: number;
}
