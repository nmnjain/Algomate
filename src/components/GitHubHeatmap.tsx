import React from 'react';
import { motion } from 'motion/react';

interface ActivityDay {
  date: string;
  count: number;
  level: number; // 0-4 scale for intensity
}

interface ActivitySummary {
  totalDaysActive: number;
  maxDailyActivity: number;
  avgDailyActivity: number;
  currentStreak: number;
  longestStreak: number;
}

interface GitHubHeatmapProps {
  activityData: ActivityDay[];
  activitySummary: ActivitySummary;
}

const GitHubHeatmap: React.FC<GitHubHeatmapProps> = ({ activityData, activitySummary }) => {
  // Get intensity color based on activity level
  const getIntensityColor = (level: number): string => {
    const colors = [
      'bg-gray-100 dark:bg-gray-800', // 0 - no activity
      'bg-green-100 dark:bg-green-900', // 1 - low activity
      'bg-green-300 dark:bg-green-700', // 2 - medium activity
      'bg-green-500 dark:bg-green-500', // 3 - high activity
      'bg-green-700 dark:bg-green-300', // 4 - very high activity
    ];
    return colors[level] || colors[0];
  };

  // Format date for tooltip
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Get day of week (0 = Sunday, 6 = Saturday)
  const getDayOfWeek = (dateStr: string): number => {
    return new Date(dateStr).getDay();
  };

  // Group data by weeks for proper grid layout
  const groupByWeeks = (data: ActivityDay[]) => {
    const weeks: ActivityDay[][] = [];
    let currentWeek: ActivityDay[] = [];
    
    data.forEach((day, index) => {
      const dayOfWeek = getDayOfWeek(day.date);
      
      // If it's Sunday (0) and we have data in current week, start new week
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        // Fill empty days at the start of first week
        while (currentWeek.length < 7) {
          currentWeek.unshift({
            date: '',
            count: 0,
            level: 0
          });
        }
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push(day);
      
      // If it's the last day, push the current week
      if (index === data.length - 1) {
        // Fill empty days at the end of last week
        while (currentWeek.length < 7) {
          currentWeek.push({
            date: '',
            count: 0,
            level: 0
          });
        }
        weeks.push(currentWeek);
      }
    });
    
    return weeks;
  };

  const weeks = groupByWeeks(activityData);
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div 
      className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          GitHub Activity Heatmap
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your coding activity over the past year
        </p>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {activitySummary.totalDaysActive}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Active Days
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {activitySummary.currentStreak}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Current Streak
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {activitySummary.longestStreak}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Longest Streak
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {activitySummary.maxDailyActivity}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Max Daily
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {activitySummary.avgDailyActivity.toFixed(1)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Avg Daily
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex mb-2 ml-8">
            {monthLabels.map((month, index) => (
              <div key={month} className="text-xs text-gray-600 dark:text-gray-400 w-16 text-center">
                {month}
              </div>
            ))}
          </div>

          {/* Day labels and heatmap grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col mr-2">
              {dayLabels.map((day, index) => (
                <div 
                  key={day} 
                  className={`text-xs text-gray-600 dark:text-gray-400 h-3 flex items-center w-6 ${
                    index % 2 === 1 ? '' : 'opacity-0'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <motion.div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm ${getIntensityColor(day.level)} cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all duration-200`}
                      whileHover={{ scale: 1.2 }}
                      title={day.date ? `${formatDate(day.date)}: ${day.count} activities` : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4 text-xs text-gray-600 dark:text-gray-400">
            <span>Less</span>
            <div className="flex gap-1 mx-2">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getIntensityColor(level)}`}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GitHubHeatmap;
