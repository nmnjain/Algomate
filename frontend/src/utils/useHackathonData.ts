import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Define the structure of a Hackathon object
export interface Hackathon {
  id: string;
  name: string;
  portal_name: string;
  portal_url: string;
  registration_deadline: string;
  start_date: string;
  end_date: string;
  team_size_min: number;
  team_size_max: number;
  prize_money: string;
  problem_statement: string;
  format: 'Online' | 'In-Person' | 'Hybrid';
  location: string | null;
  tags: string[];
}

export function useHackathonData() {
  const { user } = useAuth();
  const [allHackathons, setAllHackathons] = useState<Hackathon[]>([]);
  const [recommendedHackathons, setRecommendedHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all active hackathons and user's recommendations in parallel
      const [hackathonsRes, recommendationsRes] = await Promise.all([
        supabase.from('hackathons').select('*').eq('is_active', true),
        supabase.from('user_platform_data')
          .select('data')
          .eq('user_id', user.id)
          .eq('platform', 'hackathon_recommendations')
          .single()
      ]);

      if (hackathonsRes.error) throw new Error(hackathonsRes.error.message);
      
      const allHacks = hackathonsRes.data as Hackathon[];
      setAllHackathons(allHacks);
      
      // Process recommendations if they exist
      if (recommendationsRes.data) {
        const recommendedIds = recommendationsRes.data.data.recommended_ids || [];
        // Create a fast lookup map for the recommendations
        const hackathonMap = new Map(allHacks.map(h => [h.id, h]));
        const recommended = recommendedIds
          .map((id: string) => hackathonMap.get(id))
          .filter((h: Hackathon | undefined): h is Hackathon => h !== undefined);
        
        setRecommendedHackathons(recommended);
      } else {
        setRecommendedHackathons([]);
      }

    } catch (err: any) {
      setError('Failed to fetch hackathon data. Please try again later.');
      console.error('Error fetching hackathon data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    loading, 
    error, 
    allHackathons, 
    recommendedHackathons, 
    hasRecommendations: recommendedHackathons.length > 0,
    refetch: fetchData 
  };
}