import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface ResumeData {
  fileName: string;
  filePath: string;
  uploadedAt: string;
  analysis_id?: string;
  extracted_text?: string;
  ocr_confidence?: number;
  
  // Enhanced Skills Structure
  skills?: {
    technical: {
      programming_languages: string[];
      frameworks_libraries: string[];
      databases: string[];
      cloud_platforms: string[];
      devops_tools: string[];
      other_technical: string[];
    };
    soft_skills: string[];
    certifications: string[];
    missing_critical_skills: string[];
  };
  
  // Core Analysis Fields
  experience_level?: string;
  focus_areas?: string[];
  ai_insights?: string;
  recommendations?: Array<{
    category: string;
    suggestion: string;
    priority: 'High' | 'Medium' | 'Low';
  }>;
  
  // Comprehensive Analysis Fields
  experience_analysis?: {
    level: string;
    total_experience_years: string;
    career_progression: string;
    industry_exposure: string[];
    gaps_in_employment: string;
  };
  
  project_analysis?: {
    project_quality: string;
    technical_complexity: string;
    business_impact: string;
    standout_projects: string[];
    missing_project_types: string[];
  };
  
  education_analysis?: {
    degree_relevance: string;
    institution_tier: string;
    academic_performance: string;
    additional_courses: string[];
  };
  
  resume_quality?: {
    overall_score: string;
    formatting: string;
    content_clarity: string;
    quantified_achievements: string;
  };
  
  skill_gap_analysis?: {
    for_current_level: string[];
    for_next_level: string[];
    trending_technologies: string[];
    learning_priority: {
      high: string[];
      medium: string[];
      low: string[];
    };
  };
  
  market_competitiveness?: {
    overall_rating: string;
    salary_range_estimate: string;
    target_companies: string[];
    competitive_advantages: string[];
    major_weaknesses: string[];
  };
  
  industry_alignment?: {
    best_fit_roles: string[];
    emerging_opportunities: string[];
    remote_work_readiness: string;
  };
  
  ats_optimization?: {
    current_ats_score: string;
    missing_keywords: string[];
    formatting_issues: string[];
    improvements_needed: string[];
  };
  
  interview_preparation?: {
    technical_readiness: string;
    likely_interview_topics: string[];
    preparation_suggestions: string[];
  };
  
  career_trajectory?: {
    next_logical_step: string;
    five_year_potential: string;
    career_pivot_options: string[];
  };
  
  red_flags?: string[];
  standout_qualities?: string[];
  overall_insights?: string;
  
  // Scores for Quick Access
  overall_score?: number;
  ats_score?: number;
  competitiveness_rating?: string;
  
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
  last_updated?: string;
}

interface UseResumeDataReturn {
  data: ResumeData | null;
  loading: boolean;
  backgroundRefreshing: boolean;
  error: string | null;
  hasResume: boolean;
  refetch: () => Promise<void>;
}

const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

export function useResumeData(): UseResumeDataReturn {
  const { user } = useAuth();
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [backgroundRefreshing, setBackgroundRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCacheValidity = useCallback((lastUpdated: string): boolean => {
    const cacheAge = Date.now() - new Date(lastUpdated).getTime();
    return cacheAge < CACHE_DURATION;
  }, []);

  const fetchFromDatabase = useCallback(async (isBackground = false): Promise<ResumeData | null> => {
    if (!user) return null;

    try {
      // Check if user has a resume file
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('resume_file_name, resume_file_path, resume_uploaded_at')
        .eq('id', user.id)
        .single();

      if (userError || !userData?.resume_file_path) {
        return null; // No resume uploaded
      }

      // Get cached platform data
      const { data: cachedData, error: cacheError } = await supabase
        .from('user_platform_data')
        .select('data, last_updated')
        .eq('user_id', user.id)
        .eq('platform', 'resume')
        .single();

      // Get latest analysis results
      const { data: analysisData, error: analysisError } = await supabase
        .from('resume_analysis')
        .select('*')
        .eq('user_id', user.id)
        .eq('file_path', userData.resume_file_path)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const resumeData: ResumeData = {
        fileName: userData.resume_file_name,
        filePath: userData.resume_file_path,
        uploadedAt: userData.resume_uploaded_at,
      };

      // Add analysis data if available
      if (analysisData) {
        resumeData.analysis_id = analysisData.id;
        resumeData.extracted_text = analysisData.extracted_text;
        resumeData.ocr_confidence = analysisData.ocr_confidence;
        resumeData.skills = analysisData.skills;
        resumeData.experience_level = analysisData.experience_level;
        resumeData.focus_areas = analysisData.focus_areas;
        resumeData.ai_insights = analysisData.ai_insights;
        resumeData.recommendations = analysisData.recommendations;
        resumeData.processing_status = analysisData.processing_status;
        
        // Add all the detailed analysis fields
        resumeData.experience_analysis = analysisData.experience_analysis;
        resumeData.project_analysis = analysisData.project_analysis;
        resumeData.education_analysis = analysisData.education_analysis;
        resumeData.resume_quality = analysisData.resume_quality;
        resumeData.skill_gap_analysis = analysisData.skill_gap_analysis;
        resumeData.market_competitiveness = analysisData.market_competitiveness;
        resumeData.industry_alignment = analysisData.industry_alignment;
        resumeData.ats_optimization = analysisData.ats_optimization;
        resumeData.interview_preparation = analysisData.interview_preparation;
        resumeData.career_trajectory = analysisData.career_trajectory;
        resumeData.red_flags = analysisData.red_flags;
        resumeData.standout_qualities = analysisData.standout_qualities;
        resumeData.overall_insights = analysisData.overall_insights;
        resumeData.overall_score = analysisData.overall_score;
        resumeData.ats_score = analysisData.ats_score;
        resumeData.competitiveness_rating = analysisData.competitiveness_rating;
      }

      // Add cached data if available and fresh
      if (cachedData && !cacheError) {
        const cacheIsValid = checkCacheValidity(cachedData.last_updated);
        if (cacheIsValid || isBackground) {
          const cached = cachedData.data as any;
          resumeData.last_updated = cachedData.last_updated;
          // Merge cached data with analysis data
          Object.assign(resumeData, cached);
        }
      }

      return resumeData;

    } catch (err) {
      console.error('Error fetching resume data:', err);
      throw err;
    }
  }, [user, checkCacheValidity]);

  const refetch = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      setLoading(true);

      const resumeData = await fetchFromDatabase(false);
      setData(resumeData);

      if (!resumeData) {
        setError('No resume found. Please upload a resume first.');
      }

    } catch (err) {
      console.error('Resume data fetch failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch resume data';
      setError(errorMessage);
      toast.error(`Failed to load resume data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [user, fetchFromDatabase]);

  const backgroundRefresh = useCallback(async () => {
    if (!user || !data?.last_updated) return;

    // Only refresh if cache is stale
    const cacheIsValid = checkCacheValidity(data.last_updated);
    if (cacheIsValid) return;

    try {
      setBackgroundRefreshing(true);
      const freshData = await fetchFromDatabase(true);
      
      if (freshData) {
        setData(freshData);
      }

    } catch (err) {
      console.error('Background refresh failed:', err);
      // Don't show error toast for background refresh failures
    } finally {
      setBackgroundRefreshing(false);
    }
  }, [user, data?.last_updated, fetchFromDatabase, checkCacheValidity]);

  // Initial fetch and background refresh logic
  useEffect(() => {
    if (!user) {
      setData(null);
      setError(null);
      return;
    }

    if (!data) {
      // Initial fetch
      refetch();
    } else {
      // Background refresh if needed
      backgroundRefresh();
    }
  }, [user, data, refetch, backgroundRefresh]);

  return {
    data,
    loading,
    backgroundRefreshing,
    error,
    hasResume: !!data?.filePath,
    refetch,
  };
}