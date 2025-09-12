import React, { useState } from 'react';
import { motion } from 'motion/react';

interface ActivityDay {
  date: string;
  count: number;
  level: number; // 0-4 scale for intensity
}

interface ActivitySummary {
  totalActivity: number;
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
  const [hoveredDay, setHoveredDay] = useState<ActivityDay | null>(null);

  // Group data by weeks for heatmap display
  const groupByWeeks = (data: ActivityDay[]) => {
    const weeks: ActivityDay[][] = [];
    let currentWeek: ActivityDay[] = [];
    
    data.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay(); // 0 = Sunday, 6 = Saturday
      
      // If it's Sunday and we have days in current week, start a new week
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push(day);
      
      // If it's the last day, push the current week
      if (index === data.length - 1) {
        weeks.push(currentWeek);
      }
    });
    
    return weeks;
  };

  const weeks = groupByWeeks(activityData);
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Get color for activity level (exactly matching GitHub's styling)
  const getActivityColor = (level: number) => {
    switch (level) {
      case 0: return '#161b22'; // Very dark gray for no activity
      case 1: return '#0e4429'; // Dark green
      case 2: return '#006d32'; // Medium green  
      case 3: return '#26a641'; // Bright green
      case 4: return '#39d353'; // Brightest green
      default: return '#161b22';
    }
  };

  // Format date for tooltip
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4" style={{ backgroundColor: '#0d1117', borderColor: '#30363d' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium" style={{ color: '#f0f6fc' }}>
          {activitySummary.totalActivity} contributions
        </h3>
        
      </div>

      {/* Main heatmap container */}
      <div className="border border-gray-700 rounded-md p-4" style={{ borderColor: '#21262d', backgroundColor: '#0d1117' }}>
        {/* Month labels row */}
        <div className="flex mb-2" style={{ marginLeft: '32px' }}>
          {monthLabels.map((month, index) => (
            <div 
              key={index}
              className="text-xs font-medium flex-1 text-left"
              style={{ color: '#7d8590', minWidth: '40px' }}
            >
              {month}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Day labels column */}
          <div className="flex flex-col mr-2" style={{ width: '30px' }}>
            <div className="h-3 mb-1"></div> {/* Spacer for alignment */}
            <div className="text-xs mb-1" style={{ color: '#7d8590', height: '11px', lineHeight: '11px' }}>Mon</div>
            <div className="h-3 mb-1"></div>
            <div className="text-xs mb-1" style={{ color: '#7d8590', height: '11px', lineHeight: '11px' }}>Wed</div>
            <div className="h-3 mb-1"></div>
            <div className="text-xs mb-1" style={{ color: '#7d8590', height: '11px', lineHeight: '11px' }}>Fri</div>
            <div className="h-3"></div>
          </div>

          {/* Contribution grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const day = week.find((d) => new Date(d.date).getDay() === dayIndex);
                  return (
                    <motion.div
                      key={`${weekIndex}-${dayIndex}`}
                      className="w-3 h-3 rounded-sm cursor-pointer"
                      style={{ 
                        backgroundColor: day ? getActivityColor(day.level) : getActivityColor(0),
                        border: '1px solid #1c2128'
                      }}
                      whileHover={{ scale: 1.1 }}
                      onMouseEnter={() => day && setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section with legend and learn link */}
        <div className="flex justify-between items-center mt-4">
          <button className="text-xs hover:underline" style={{ color: '#7d8590' }}>
            Learn how we count contributions
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#7d8590' }}>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="w-3 h-3 rounded-sm"
                  style={{ 
                    backgroundColor: getActivityColor(level),
                    border: '1px solid #1c2128'
                  }}
                />
              ))}
            </div>
            <span className="text-xs" style={{ color: '#7d8590' }}>More</span>
          </div>
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-50 text-white text-xs rounded-md px-2 py-1 pointer-events-none shadow-lg"
            style={{ 
              backgroundColor: '#21262d',
              border: '1px solid #30363d',
              top: '-40px',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            <div className="text-center">
              <div className="font-medium">{hoveredDay.count} contributions</div>
              <div style={{ color: '#7d8590' }}>{formatDate(hoveredDay.date)}</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GitHubHeatmap;