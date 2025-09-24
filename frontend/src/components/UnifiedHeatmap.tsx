import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import TooltipPortal from './ui/tooltip-portal';
import { UnifiedActivityDay } from '../utils/useUnifiedHeatmapData';

interface Props {
  data: UnifiedActivityDay[];
}

export function UnifiedHeatmap({ data }: Props) {
  const [hoveredDay, setHoveredDay] = useState<UnifiedActivityDay | null>(null);
  const hoveredElementRef = useRef<HTMLDivElement>(null);

  const getIntensityColor = (level: number): string => {
    const colors = ['#161b22', '#003875', '#005bb5', '#007bff', '#4da3ff'];
    return colors[Math.min(level, 4)];
  };

  const groupByWeeks = (data: UnifiedActivityDay[]) => {
    const weeks: UnifiedActivityDay[][] = [];
    let currentWeek: UnifiedActivityDay[] = [];
    const firstDay = new Date(data[0]?.date);
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: '', count: 0, level: 0, details: { leetcode: 0, gfg: 0 } });
    }
    data.forEach(day => {
      currentWeek.push(day);
      if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = []; }
    });
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', count: 0, level: 0, details: { leetcode: 0, gfg: 0 } });
      }
      weeks.push(currentWeek);
    }
    return weeks;
  };

  const weeks = groupByWeeks(data);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getMonthLabels = () => {
    const labels: { month: string; position: number }[] = [];
    let currentMonth = -1;
    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find(day => day.date);
      if (firstValidDay) {
        const date = new Date(firstValidDay.date);
        const month = date.getMonth();
        if (month !== currentMonth) {
          if (labels.length === 0 || weekIndex - labels[labels.length - 1].position >= 4) {
            labels.push({ month: monthNames[month], position: weekIndex });
            currentMonth = month;
          }
        }
      }
    });
    return labels;
  };

  const monthLabels = getMonthLabels();
  const totalProblems = data.reduce((sum, day) => sum + day.count, 0);

  return (
    // The component no longer has its own outer card or title
    <>
      <div className="border border-border rounded-md p-4" style={{ backgroundColor: '#0d1117' }}>
        <div className="relative mb-2" style={{ marginLeft: '32px', height: '16px' }}>
          {monthLabels.map((label) => (
            <div key={label.month} className="absolute text-xs" style={{ color: '#7d8590', left: `${label.position * 14}px`}}>
              {label.month}
            </div>
          ))}
        </div>

        <div className="flex">
          <div className="flex flex-col mr-2 text-xs" style={{ width: '30px', color: '#7d8590' }}>
            <div style={{ height: '11px' }}></div>
            <div style={{ height: '11px', lineHeight: '11px', marginBottom: '13px' }}>Mon</div>
            <div style={{ height: '11px' }}></div>
            <div style={{ height: '11px', lineHeight: '11px', marginBottom: '13px' }}>Wed</div>
            <div style={{ height: '11px' }}></div>
            <div style={{ height: '11px', lineHeight: '11px' }}>Fri</div>
          </div>
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    className="w-3 h-3 rounded-sm cursor-pointer"
                    style={{ backgroundColor: day.date ? getIntensityColor(day.level) : 'transparent' }}
                    whileHover={{ scale: 1.1 }}
                    onMouseEnter={(e) => {
                      if (day.date) {
                        setHoveredDay(day);
                        hoveredElementRef.current = e.currentTarget;
                      }
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 text-xs" style={{ color: '#7d8590' }}>
            <span>Total Problems: <span className="font-bold text-foreground">{totalProblems}</span></span>
            <div className="flex items-center gap-2">
                <span>Less</span>
                <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(level => <div key={level} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getIntensityColor(level) }}/>)}
                </div>
                <span>More</span>
            </div>
        </div>
      </div>
      
      <TooltipPortal
        isVisible={!!hoveredDay && !!hoveredDay.date}
        targetRef={hoveredElementRef}
        content={
          hoveredDay && (
            <div className="space-y-1">
              <div className="font-bold">
                {hoveredDay.count} problem{hoveredDay.count !== 1 ? 's' : ''} on {new Date(hoveredDay.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className='text-sm text-muted-foreground'>
                {hoveredDay.details.leetcode > 0 && <div>LeetCode: {hoveredDay.details.leetcode}</div>}
                {hoveredDay.details.gfg > 0 && <div>GFG: {hoveredDay.details.gfg}</div>}
              </div>
            </div>
          )
        }
      />
    </>
  );
}