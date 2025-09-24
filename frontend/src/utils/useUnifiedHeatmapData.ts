import { useMemo } from 'react';
import { useLeetCodeData } from './useLeetCodeData';
import { useGFGData } from './useGFGData';

export interface UnifiedActivityDay {
  date: string;
  count: number;
  level: number;
  details: {
    leetcode: number;
    gfg: number;
  };
}

export const useUnifiedHeatmapData = () => {
  const { data: leetcodeData, loading: leetcodeLoading } = useLeetCodeData();
  const { data: gfgData, loading: gfgLoading } = useGFGData();

  const loading = leetcodeLoading || gfgLoading;

  const unifiedData = useMemo(() => {
    const activityMap = new Map<string, { leetcode: number; gfg: number }>();

    // 1. Populate map with LeetCode data
    if (leetcodeData?.calendar && Array.isArray(leetcodeData.calendar)) {
      leetcodeData.calendar.forEach((day: any) => {
        if (!day.date) return;
        activityMap.set(day.date, { leetcode: day.submissionCount || 0, gfg: 0 });
      });
    }

    // 2. Populate and MERGE map with GFG data
    // --- THIS IS THE FIX: Changed 'gfgData.activity' to 'gfgData.activityCalendar' ---
    if (gfgData?.activityCalendar && Array.isArray(gfgData.activityCalendar)) {
      gfgData.activityCalendar.forEach((day: any) => {
        if (!day.date) return;
        const gfgCount = day.problemCount || 0;
        
        if (activityMap.has(day.date)) {
          activityMap.get(day.date)!.gfg = gfgCount;
        } else {
          activityMap.set(day.date, { leetcode: 0, gfg: gfgCount });
        }
      });
    }

    // 3. Create the final, full-year array with correct total counts
    const fullYearData: UnifiedActivityDay[] = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);
    startDate.setDate(startDate.getDate() + 1);

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const activity = activityMap.get(dateStr);

        if (activity) {
            fullYearData.push({
                date: dateStr,
                count: activity.leetcode + activity.gfg,
                level: 0,
                details: activity
            });
        } else {
            fullYearData.push({ date: dateStr, count: 0, level: 0, details: { leetcode: 0, gfg: 0 } });
        }
    }

    // 4. Calculate intensity levels
    const counts = fullYearData.filter(d => d.count > 0).map(d => d.count);
    if (counts.length === 0) {
        return fullYearData;
    }
    
    const q1 = quantile(counts, 0.25);
    const q2 = quantile(counts, 0.50);
    const q3 = quantile(counts, 0.75);

    fullYearData.forEach(day => {
      if (day.count > 0) {
        if (day.count >= q3 && q3 > 0) day.level = 4;
        else if (day.count >= q2 && q2 > 0) day.level = 3;
        else if (day.count >= q1 && q1 > 0) day.level = 2;
        else day.level = 1;
      } else {
        day.level = 0;
      }
    });

    return fullYearData;
  }, [leetcodeData, gfgData]);

  return { data: unifiedData, loading };
};

const quantile = (arr: number[], q: number) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
};