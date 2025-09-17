import { supabase } from '../lib/supabase';

// Cache management utilities
export class GitHubCacheManager {
  
  // Check if cached data is stale
  static isStale(lastUpdated: string, thresholdHours: number = 2): boolean {
    const lastUpdate = new Date(lastUpdated);
    const threshold = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);
    return lastUpdate < threshold;
  }

  // Check if cached data is very old and should be cleaned
  static isVeryOld(lastUpdated: string, thresholdDays: number = 7): boolean {
    const lastUpdate = new Date(lastUpdated);
    const threshold = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);
    return lastUpdate < threshold;
  }

  // Clean very old cache entries
  static async cleanOldCache(userId: string, platform: string = 'github'): Promise<void> {
    try {
      const { data: cachedData } = await supabase
        .from('user_platform_data')
        .select('last_updated')
        .eq('user_id', userId)
        .eq('platform', platform)
        .single();

      if (cachedData && this.isVeryOld(cachedData.last_updated, 7)) {
        // Delete very old cache (7+ days)
        await supabase
          .from('user_platform_data')
          .delete()
          .eq('user_id', userId)
          .eq('platform', platform);
      }
    } catch (error) {
      console.error('Error cleaning old cache:', error);
    }
  }

  // Get cache freshness info
  static async getCacheFreshness(userId: string, platform: string = 'github'): Promise<{
    exists: boolean;
    isStale: boolean;
    isVeryOld: boolean;
    lastUpdated: string | null;
    ageInHours: number | null;
  }> {
    try {
      const { data: cachedData } = await supabase
        .from('user_platform_data')
        .select('last_updated')
        .eq('user_id', userId)
        .eq('platform', platform)
        .single();

      if (!cachedData) {
        return {
          exists: false,
          isStale: false,
          isVeryOld: false,
          lastUpdated: null,
          ageInHours: null,
        };
      }

      const lastUpdated = cachedData.last_updated;
      const ageInHours = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60);

      return {
        exists: true,
        isStale: this.isStale(lastUpdated, 2),
        isVeryOld: this.isVeryOld(lastUpdated, 7),
        lastUpdated,
        ageInHours: Math.round(ageInHours * 10) / 10, // Round to 1 decimal
      };
    } catch (error) {
      console.error('Error checking cache freshness:', error);
      return {
        exists: false,
        isStale: false,
        isVeryOld: false,
        lastUpdated: null,
        ageInHours: null,
      };
    }
  }

  // Force refresh cache (delete and let it be recreated)
  static async forceRefresh(userId: string, platform: string = 'github'): Promise<void> {
    try {
      await supabase
        .from('user_platform_data')
        .delete()
        .eq('user_id', userId)
        .eq('platform', platform);
    } catch (error) {
      console.error('Error forcing cache refresh:', error);
    }
  }
}
