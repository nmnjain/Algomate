// Advanced analytics engine for GeeksForGeeks data analysis
// Provides comprehensive insights into coding patterns, difficulty progression, and performance metrics

interface GFGSolvedProblem {
  date: string;
  difficulty: string;
  problemUrl: string;
  problemName: string;
}

interface GFGStats {
  Easy: number;
  Hard: number;
  Basic: number;
  Medium: number;
  School: number;
  totalProblemsSolved: number;
}

interface GFGProfile {
  fullName: string;
  userName: string;
  institute: string;
  maxStreak: number;
  codingScore: number;
  monthlyScore: number;
  currentStreak: number;
  instituteRank: string;
  languagesUsed: string[];
  profilePicture: string;
  totalProblemsSolved: number;
}

interface GFGActivityDay {
  date: string;
  level: number;
  problems: string[];
  problemCount: number;
}

interface GFGData {
  stats: GFGStats;
  profile: GFGProfile;
  lastUpdated: string;
  solvedProblems: GFGSolvedProblem[];
  activityCalendar: GFGActivityDay[];
}

// Difficulty progression analysis
export interface DifficultyProgressionInsight {
  difficultyDistribution: {
    school: { count: number; percentage: number };
    basic: { count: number; percentage: number };
    easy: { count: number; percentage: number };
    medium: { count: number; percentage: number };
    hard: { count: number; percentage: number };
  };
  progressionScore: number; // 0-100 scale
  nextLevelRecommendation: string;
  balanceAnalysis: {
    isBalanced: boolean;
    underrepresentedLevels: string[];
    strongAreas: string[];
  };
}

// Coding momentum and consistency analysis
export interface CodingMomentumInsight {
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  averageProblemsPerDay: number;
  consistencyScore: number; // 0-100 scale
  weeklyPattern: {
    [key: string]: number; // day of week -> average problems
  };
  monthlyTrend: {
    direction: 'improving' | 'declining' | 'stable';
    trendScore: number;
  };
  productivityInsights: string[];
}

// Performance benchmarking and growth analysis
export interface PerformanceBenchmarkInsight {
  totalProblemsRank: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  codingScoreAnalysis: {
    currentScore: number;
    estimatedPercentile: number;
    scoreGrowthPotential: number;
  };
  institutionalPerformance?: {
    rank: string;
    institute: string;
    competitiveAnalysis: string;
  };
  strengthsAndWeaknesses: {
    strengths: string[];
    improvementAreas: string[];
  };
}

// Problem-solving pattern analysis
export interface ProblemSolvingPatternInsight {
  favoriteTopics: string[];
  solvingVelocity: number; // problems per week
  difficultyComfortZone: string;
  explorationScore: number; // variety in problem types
  focusAreas: {
    topic: string;
    problemCount: number;
    masteryLevel: 'beginner' | 'intermediate' | 'advanced';
  }[];
  recommendations: string[];
}

export class GFGAnalytics {
  private data: GFGData;

  constructor(data: GFGData) {
    this.data = data;
  }

  // Analyze difficulty progression and balance
  analyzeDifficultyProgression(): DifficultyProgressionInsight {
    const stats = this.data.stats;
    const total = stats.totalProblemsSolved || 1; // Prevent division by zero

    const distribution = {
      school: { 
        count: stats.School || 0, 
        percentage: Math.round(((stats.School || 0) / total) * 100) 
      },
      basic: { 
        count: stats.Basic || 0, 
        percentage: Math.round(((stats.Basic || 0) / total) * 100) 
      },
      easy: { 
        count: stats.Easy || 0, 
        percentage: Math.round(((stats.Easy || 0) / total) * 100) 
      },
      medium: { 
        count: stats.Medium || 0, 
        percentage: Math.round(((stats.Medium || 0) / total) * 100) 
      },
      hard: { 
        count: stats.Hard || 0, 
        percentage: Math.round(((stats.Hard || 0) / total) * 100) 
      },
    };

    // Calculate progression score based on difficulty balance and advancement
    const idealDistribution = { school: 10, basic: 20, easy: 30, medium: 30, hard: 10 };
    let progressionScore = 0;
    
    // Reward balanced distribution
    Object.entries(idealDistribution).forEach(([level, ideal]) => {
      const actual = distribution[level as keyof typeof distribution].percentage;
      const difference = Math.abs(actual - ideal);
      progressionScore += Math.max(0, 20 - difference); // Max 20 points per level
    });

    // Bonus for hard problems
    progressionScore += Math.min(20, distribution.hard.count * 2);

    progressionScore = Math.min(100, progressionScore);

    // Analyze balance
    const underrepresented: string[] = [];
    const strongAreas: string[] = [];

    Object.entries(distribution).forEach(([level, data]) => {
      if (data.percentage < 5 && total > 20) {
        underrepresented.push(level);
      } else if (data.percentage > 40) {
        strongAreas.push(level);
      }
    });

    // Next level recommendation
    let nextLevel = 'easy';
    if (distribution.easy.count > 10) nextLevel = 'medium';
    if (distribution.medium.count > 15) nextLevel = 'hard';
    if (distribution.hard.count > 10) nextLevel = 'advanced topics';

    return {
      difficultyDistribution: distribution,
      progressionScore,
      nextLevelRecommendation: `Focus on ${nextLevel} problems to advance your skills`,
      balanceAnalysis: {
        isBalanced: underrepresented.length === 0 && strongAreas.length <= 1,
        underrepresentedLevels: underrepresented,
        strongAreas,
      },
    };
  }

  // Analyze coding momentum and consistency
  analyzeCodingMomentum(): CodingMomentumInsight {
    const calendar = this.data.activityCalendar;
    const activeDays = calendar.filter(day => day.problemCount > 0).length;
    const totalProblems = calendar.reduce((sum, day) => sum + day.problemCount, 0);
    
    // Calculate streaks
    const currentStreak = this.calculateCurrentStreak(calendar);
    const longestStreak = this.calculateLongestStreak(calendar);
    
    // Weekly pattern analysis
    const weeklyPattern: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0,
      'Thursday': 0, 'Friday': 0, 'Saturday': 0
    };
    
    calendar.forEach(day => {
      const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' });
      weeklyPattern[dayName] += day.problemCount;
    });

    // Calculate consistency score
    const averageProblemsPerDay = totalProblems / Math.max(activeDays, 1);
    const consistencyScore = Math.min(100, 
      (activeDays / 365) * 60 + // 60% weight for active days
      Math.min(40, currentStreak * 2) // 40% weight for current streak
    );

    // Monthly trend analysis (simplified)
    const recentDays = calendar.slice(-30);
    const recentAverage = recentDays.reduce((sum, day) => sum + day.problemCount, 0) / 30;
    const olderDays = calendar.slice(-60, -30);
    const olderAverage = olderDays.reduce((sum, day) => sum + day.problemCount, 0) / 30;
    
    let trendDirection: 'improving' | 'declining' | 'stable' = 'stable';
    let trendScore = 0;
    
    if (recentAverage > olderAverage * 1.2) {
      trendDirection = 'improving';
      trendScore = Math.min(100, (recentAverage / olderAverage) * 50);
    } else if (recentAverage < olderAverage * 0.8) {
      trendDirection = 'declining';
      trendScore = Math.max(0, 100 - ((olderAverage / recentAverage) * 50));
    } else {
      trendScore = 75; // Stable is good
    }

    // Generate productivity insights
    const insights = [];
    if (currentStreak > 7) {
      insights.push(`Amazing! You're on a ${currentStreak}-day streak. Keep it up!`);
    }
    if (activeDays > 200) {
      insights.push('You show exceptional consistency with 200+ active days this year.');
    }
    if (averageProblemsPerDay > 3) {
      insights.push('High productivity: solving 3+ problems per active day on average.');
    }

    return {
      currentStreak,
      longestStreak,
      activeDays,
      averageProblemsPerDay: Math.round(averageProblemsPerDay * 10) / 10,
      consistencyScore: Math.round(consistencyScore),
      weeklyPattern,
      monthlyTrend: {
        direction: trendDirection,
        trendScore: Math.round(trendScore),
      },
      productivityInsights: insights,
    };
  }

  // Analyze performance benchmarks
  analyzePerformanceBenchmarks(): PerformanceBenchmarkInsight {
    const profile = this.data.profile;
    const stats = this.data.stats;
    const total = stats.totalProblemsSolved;

    // Determine rank based on total problems
    let rank: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'beginner';
    if (total >= 500) rank = 'expert';
    else if (total >= 200) rank = 'advanced';
    else if (total >= 50) rank = 'intermediate';

    // Coding score analysis
    const codingScore = profile.codingScore || 0;
    const estimatedPercentile = Math.min(99, Math.max(1, 
      20 + (codingScore / 50) // Rough estimation
    ));
    
    const scoreGrowthPotential = Math.max(0, 100 - estimatedPercentile);

    // Institutional performance
    const institutionalPerformance = profile.instituteRank ? {
      rank: profile.instituteRank,
      institute: profile.institute || 'Unknown',
      competitiveAnalysis: parseInt(profile.instituteRank) <= 10 ? 
        'Top performer in your institution!' : 
        'Room for improvement in institutional ranking.',
    } : undefined;

    // Strengths and weaknesses analysis
    const strengths = [];
    const improvementAreas = [];

    if (stats.Hard > 10) strengths.push('Strong problem-solving skills (Hard problems)');
    if (stats.Medium > 30) strengths.push('Solid foundation (Medium problems)');
    if (profile.currentStreak && profile.currentStreak > 5) {
      strengths.push('Consistent practice habits');
    }

    if (stats.Hard < 5 && total > 50) improvementAreas.push('Challenge yourself with Hard problems');
    if (stats.Medium < total * 0.3) improvementAreas.push('Build strong foundation with Medium problems');
    if (codingScore < 1000) improvementAreas.push('Focus on improving coding score');

    return {
      totalProblemsRank: rank,
      codingScoreAnalysis: {
        currentScore: codingScore,
        estimatedPercentile: Math.round(estimatedPercentile),
        scoreGrowthPotential: Math.round(scoreGrowthPotential),
      },
      institutionalPerformance,
      strengthsAndWeaknesses: {
        strengths,
        improvementAreas,
      },
    };
  }

  // Analyze problem-solving patterns
  analyzeProblemSolvingPatterns(): ProblemSolvingPatternInsight {
    const stats = this.data.stats;
    const calendar = this.data.activityCalendar;
    const problems = this.data.solvedProblems;

    // Calculate solving velocity (problems per week)
    const activeDays = calendar.filter(day => day.problemCount > 0).length;
    const solvingVelocity = Math.round((stats.totalProblemsSolved / Math.max(activeDays / 7, 1)) * 10) / 10;

    // Determine comfort zone
    const maxDifficulty = Math.max(stats.School, stats.Basic, stats.Easy, stats.Medium, stats.Hard);
    let difficultyComfortZone = 'School';
    if (maxDifficulty === stats.Hard) difficultyComfortZone = 'Hard';
    else if (maxDifficulty === stats.Medium) difficultyComfortZone = 'Medium';
    else if (maxDifficulty === stats.Easy) difficultyComfortZone = 'Easy';
    else if (maxDifficulty === stats.Basic) difficultyComfortZone = 'Basic';

    // Exploration score (variety in problem types)
    const difficultyCount = [stats.School, stats.Basic, stats.Easy, stats.Medium, stats.Hard]
      .filter(count => count > 0).length;
    const explorationScore = Math.round((difficultyCount / 5) * 100);

    // Generate topic insights (simplified)
    const favoriteTopics = ['Array', 'String', 'Dynamic Programming', 'Graph', 'Tree'];
    const focusAreas = [
      { topic: 'Arrays & Strings', problemCount: stats.Easy + stats.Basic, masteryLevel: 'intermediate' as const },
      { topic: 'Algorithm Design', problemCount: stats.Medium, masteryLevel: 'intermediate' as const },
      { topic: 'Advanced Topics', problemCount: stats.Hard, masteryLevel: 'beginner' as const },
    ];

    // Recommendations
    const recommendations = [];
    if (stats.Hard < 5) recommendations.push('Challenge yourself with more Hard problems');
    if (explorationScore < 60) recommendations.push('Explore different difficulty levels for balanced growth');
    if (solvingVelocity < 2) recommendations.push('Increase practice frequency for better momentum');

    return {
      favoriteTopics,
      solvingVelocity,
      difficultyComfortZone,
      explorationScore,
      focusAreas,
      recommendations,
    };
  }

  // Helper methods
  private calculateCurrentStreak(calendar: GFGActivityDay[]): number {
    let streak = 0;
    const sortedDays = [...calendar].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (const day of sortedDays) {
      if (day.problemCount > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private calculateLongestStreak(calendar: GFGActivityDay[]): number {
    let maxStreak = 0;
    let currentStreak = 0;
    
    const sortedDays = [...calendar].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (const day of sortedDays) {
      if (day.problemCount > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  }

  // Generate comprehensive insights
  generateComprehensiveInsights() {
    return {
      difficultyProgression: this.analyzeDifficultyProgression(),
      codingMomentum: this.analyzeCodingMomentum(),
      performanceBenchmarks: this.analyzePerformanceBenchmarks(),
      problemSolvingPatterns: this.analyzeProblemSolvingPatterns(),
    };
  }
}