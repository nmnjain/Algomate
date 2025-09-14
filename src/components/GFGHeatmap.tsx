import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import TooltipPortal from './ui/tooltip-portal';

interface GFGActivityDay {
  date: string;
  problemCount: number;
  level: number; // 0-4 intensity level
  problems?: string[];
}

interface GFGHeatmapProps {
  data: GFGActivityDay[];
  year?: number;
}

const GFGHeatmap: React.FC<GFGHeatmapProps> = ({ data, year = 2025 }) => {
  const [hoveredDay, setHoveredDay] = useState<GFGActivityDay | null>(null);
  const hoveredElementRef = useRef<HTMLDivElement>(null);

  // Get intensity color for GFG theme (GitHub-style with green colors)
  const getIntensityColor = (level: number): string => {
    const colors = [
      '#161b22', // 0 - no activity (dark background)
      '#0e4429', // 1 - low activity (dark green)
      '#006d32', // 2 - medium activity (medium green)
      '#26a641', // 3 - high activity (bright green)
      '#39d353', // 4 - very high activity (brightest green)
    ];
    return colors[Math.min(level, 4)];
  };

  // Group data by weeks for heatmap display (GitHub-style)
  const groupByWeeks = (data: GFGActivityDay[]) => {
    const weeks: GFGActivityDay[][] = [];
    let currentWeek: GFGActivityDay[] = [];
    
    // Start from first day and pad the first week if needed
    const firstDay = new Date(data[0]?.date);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Add empty cells for days before the first day of the week
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({
        date: '',
        problemCount: 0,
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
          problemCount: 0,
          level: 0
        });
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const weeks = groupByWeeks(data);
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Create month labels with proper positioning
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
          if (labels.length === 0 || weekIndex - labels[labels.length - 1].position >= 4) {
            labels.push({
              month: monthNames[month],
              position: weekIndex
            });
            currentMonth = month;
          }
        }
      }
    });
    
    return labels;
  };

  const monthLabels = getMonthLabels();

  // Calculate total problems solved
  const totalProblems = data.reduce((sum, day) => sum + day.problemCount, 0);
  const activeDays = data.filter(day => day.problemCount > 0).length;
  const currentStreak = calculateCurrentStreak(data);
  const longestStreak = calculateLongestStreak(data);

  function calculateCurrentStreak(days: GFGActivityDay[]): number {
    let streak = 0;
    const sortedDays = [...days].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (const day of sortedDays) {
      if (day.problemCount > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  function calculateLongestStreak(days: GFGActivityDay[]): number {
    let maxStreak = 0;
    let currentStreak = 0;
    
    const sortedDays = [...days].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
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

  const handleDayHover = (day: GFGActivityDay, event: React.MouseEvent<HTMLDivElement>) => {
    setHoveredDay(day);
  };

  const handleDayLeave = () => {
    setHoveredDay(null);
  };

  return (
    <div className="space-y-4">
      {/* Summary Section */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span className="font-medium">
          Current streak: <span className="text-green-600">{currentStreak}</span> days • Longest streak: <span className="text-green-600">{longestStreak}</span> days
        </span>
        <span>
          {totalProblems} problems solved • {activeDays} active days
        </span>
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

          {/* Submission grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    className="w-3 h-3 rounded-sm cursor-pointer relative"
                    style={{ 
                      backgroundColor: day.date ? getIntensityColor(day.level) : 'transparent',
                      border: day.date ? '1px solid #1c2128' : 'none'
                    }}
                    whileHover={{ scale: day.date ? 1.1 : 1 }}
                    onMouseEnter={(e) => {
                      if (day.date) {
                        setHoveredDay(day);
                        // @ts-ignore - We need to assign the ref for positioning
                        hoveredElementRef.current = e.currentTarget;
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredDay(null);
                    }}
                  >
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section with legend */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-4">
            <span className="text-xs" style={{ color: '#7d8590' }}>
              Current streak: {currentStreak} days
            </span>
            <span className="text-xs" style={{ color: '#7d8590' }}>
              Longest streak: {longestStreak} days
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#7d8590' }}>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="w-3 h-3 rounded-sm"
                  style={{ 
                    backgroundColor: getIntensityColor(level),
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
          hoveredDay && (
            <div className="space-y-2">
              <div className="font-semibold">
                {new Date(hoveredDay.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="text-sm">
                {hoveredDay.problemCount === 0 ? (
                  <span className="text-gray-500">No problems solved</span>
                ) : (
                  <span>
                    <strong>{hoveredDay.problemCount}</strong> problem{hoveredDay.problemCount !== 1 ? 's' : ''} solved
                  </span>
                )}
              </div>
              {hoveredDay.problems && hoveredDay.problems.length > 0 && (
                <div className="text-xs text-gray-600 border-t pt-2">
                  {hoveredDay.problems.slice(0, 3).map((problem, index) => (
                    <div key={index}>{problem}</div>
                  ))}
                  {hoveredDay.problems.length > 3 && (
                    <div className="text-gray-500">
                      +{hoveredDay.problems.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        }
      />
    </div>
  );
};

export default GFGHeatmap;