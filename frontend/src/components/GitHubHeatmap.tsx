import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import TooltipPortal from './ui/tooltip-portal';

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
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const hoveredElementRef = useRef<HTMLElement>(null);

  // Group data by weeks for heatmap display (GitHub-style) - same as LeetCode
  const groupByWeeks = (data: ActivityDay[]) => {
    const weeks: ActivityDay[][] = [];
    let currentWeek: ActivityDay[] = [];
    
    // Start from first day and pad the first week if needed
    const firstDay = new Date(data[0]?.date);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Add empty cells for days before the first day of the week
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({
        date: '',
        count: 0,
        level: 0
      });
    }
    
    data.forEach((day, index) => {
      currentWeek.push(day);
      
      // If we have 7 days, start a new week
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Add the last week if it has any days
    if (currentWeek.length > 0) {
      // Pad the last week to have 7 days
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: '',
          count: 0,
          level: 0
        });
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const weeks = groupByWeeks(activityData);
  
  // Create month labels with proper positioning - same logic as LeetCode
  const getMonthLabels = () => {
    const labels: { month: string; position: number }[] = [];
    let currentMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      // Check the first valid day of each week to determine if it's a new month
      const firstValidDay = week.find(day => day.date);
      if (firstValidDay) {
        const date = new Date(firstValidDay.date);
        const month = date.getMonth();
        
        // If this is a new month and it's the first week or the month has changed
        if (month !== currentMonth) {
          // Only add if it's not too close to the previous label (avoid overlapping)
          const lastLabel = labels[labels.length - 1];
          if (!lastLabel || (weekIndex - lastLabel.position) >= 4) {
            currentMonth = month;
            labels.push({
              month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month],
              position: weekIndex
            });
          }
        }
      }
    });
    
    return labels;
  };

  const monthLabels = getMonthLabels();

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
      <div className="border border-gray-700 rounded-md p-4" style={{ borderColor: '#21262d', backgroundColor: '#0d1117', overflow: 'visible' }}>
        {/* Month labels row */}
        <div className="relative mb-2" style={{ marginLeft: '32px', height: '16px' }}>
          {monthLabels.map((label, index) => (
            <div 
              key={index}
              className="absolute text-xs font-medium"
              style={{ 
                color: '#7d8590', 
                left: `${label.position * 14}px`,
                top: '0px'
              }}
            >
              {label.month}
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
                {week.map((day, dayIndex) => (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    ref={hoveredDay === day ? hoveredElementRef : null}
                    className="w-3 h-3 rounded-sm cursor-pointer relative"
                    style={{ 
                      backgroundColor: day.date ? getActivityColor(day.level) : 'transparent',
                      border: day.date ? '1px solid #1c2128' : 'none'
                    }}
                    whileHover={{ scale: day.date ? 1.1 : 1 }}
                    onMouseEnter={(e) => {
                      if (day.date) {
                        setHoveredDay(day);
                        setHoveredElement(e.currentTarget);
                        hoveredElementRef.current = e.currentTarget;
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredDay(null);
                      setHoveredElement(null);
                    }}
                  >
                  </motion.div>
                ))}
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
      </div>
      
      {/* Portal Tooltip */}
      <TooltipPortal
        isVisible={!!hoveredDay && !!hoveredDay.date}
        targetRef={hoveredElementRef}
        content={
          hoveredDay && hoveredDay.date && (
            <div className="text-center">
              <div className="font-medium">
                {hoveredDay.count} contribution{hoveredDay.count !== 1 ? 's' : ''}
              </div>
              <div style={{ color: '#7d8590' }}>{formatDate(hoveredDay.date)}</div>
            </div>
          )
        }
      />
    </div>
  );
};

export default GitHubHeatmap;