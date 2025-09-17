import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { ErrorHandler, ErrorCodes, ResumeError } from './errorHandler';

interface ResumeUploadState {
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  uploadedFile: {
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
  } | null;
}

interface ResumeAnalysisResult {
  id: string;
  extracted_text: string;
  ocr_confidence: number;
  skills: {
    technical: string[];
    soft: string[];
  };
  experience_level: string;
  focus_areas: string[];
  ai_insights: string;
  recommendations: any[];
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface UseResumeUploadReturn {
  state: ResumeUploadState;
  uploadResume: (file: File) => Promise<void>;
  removeResume: () => Promise<void>;
  getAnalysisResult: () => Promise<ResumeAnalysisResult | null>;
  triggerAnalysis: (filePath: string) => Promise<void>;
  resetState: () => void;
}

const STORAGE_BUCKET = 'resumes';
const FASTAPI_ENDPOINT = import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000';

export function useResumeUpload(): UseResumeUploadReturn {
  const { user } = useAuth();
  const [state, setState] = useState<ResumeUploadState>({
    isUploading: false,
    uploadProgress: 0,
    error: null,
    uploadedFile: null,
  });

  const resetState = useCallback(() => {
    setState({
      isUploading: false,
      uploadProgress: 0,
      error: null,
      uploadedFile: null,
    });
  }, []);

  const updateState = useCallback((updates: Partial<ResumeUploadState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const uploadResume = useCallback(async (file: File) => {
    if (!user) {
      const authError = ErrorHandler.handleAuthenticationError(
        new Error('User not authenticated'),
        { operation: 'upload_resume' }
      );
      ErrorHandler.showUserFriendlyError(authError);
      return;
    }

    // Validate file before starting upload
    const validationError = ErrorHandler.handleFileValidationError(file);
    if (validationError) {
      updateState({ error: validationError.message });
      ErrorHandler.showUserFriendlyError(validationError);
      return;
    }

    updateState({ 
      isUploading: true, 
      uploadProgress: 0, 
      error: null 
    });

    try {
      // Check if user already has a resume and remove it first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('resume_file_path')
        .eq('id', user.id)
        .single();

      if (!userError && userData?.resume_file_path) {
        console.log('Existing resume found, removing before upload...');
        
        // Remove existing file from storage
        const { error: storageError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([userData.resume_file_path]);

        if (storageError) {
          console.warn('Storage removal failed:', storageError.message);
        }

        // Remove existing resume analysis records
        const { error: analysisError } = await supabase
          .from('resume_analysis')
          .delete()
          .eq('user_id', user.id)
          .eq('file_path', userData.resume_file_path);

        if (analysisError) {
          console.warn('Analysis removal failed:', analysisError.message);
        }

        // Remove from user_platform_data cache
        const { error: cacheError } = await supabase
          .from('user_platform_data')
          .delete()
          .eq('user_id', user.id)
          .eq('platform', 'resume');

        if (cacheError) {
          console.warn('Cache removal failed:', cacheError.message);
        }

        toast.info('Removing previous resume and uploading new one...');
      }

      updateState({ uploadProgress: 10 });

      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `resume_${timestamp}.${fileExtension}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to Supabase Storage with retry logic
      const uploadOperation = async () => {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw ErrorHandler.handleUploadError(uploadError, {
            userId: user.id,
            fileName: file.name,
            fileSize: file.size,
            operation: 'supabase_upload'
          });
        }

        return uploadData;
      };

      await ErrorHandler.retryOperation(uploadOperation, 2, 1000);
      updateState({ uploadProgress: 50 });

      // Update user profile with resume information
      const { error: profileError } = await supabase
        .from('users')
        .update({
          resume_file_name: fileName,
          resume_file_path: filePath,
          resume_uploaded_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) {
        // Clean up uploaded file if profile update fails
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([filePath]);
        
        const dbError = ErrorHandler.handleDatabaseError(profileError, 'update_user_profile', {
          userId: user.id,
          fileName,
          filePath
        });
        throw dbError;
      }

      updateState({ uploadProgress: 75 });

      // Create initial resume analysis record
      const { data: analysisData, error: analysisError } = await supabase
        .from('resume_analysis')
        .insert([{
          user_id: user.id,
          file_path: filePath,
          file_name: fileName,
          file_size: file.size,
          mime_type: file.type,
          processing_status: 'pending',
        }])
        .select()
        .single();

      if (analysisError) {
        const dbError = ErrorHandler.handleDatabaseError(analysisError, 'create_analysis_record', {
          userId: user.id,
          fileName,
          filePath
        });
        throw dbError;
      }

      updateState({ uploadProgress: 90 });

      // Trigger backend OCR and AI analysis
      await triggerAnalysis(filePath);

      const isUpdate = userData?.resume_file_path;

      updateState({
        isUploading: false,
        uploadProgress: 100,
        uploadedFile: {
          fileName,
          filePath,
          fileSize: file.size,
          mimeType: file.type,
        },
      });

      toast.success(
        isUpdate 
          ? 'Resume updated successfully! Re-analyzing with AI...' 
          : 'Resume uploaded successfully! Analysis in progress...'
      );

    } catch (error) {
      console.error('Resume upload failed:', error);
      
      if (error instanceof ResumeError) {
        updateState({
          isUploading: false,
          uploadProgress: 0,
          error: error.message,
        });
        ErrorHandler.showUserFriendlyError(error);
        ErrorHandler.logError(error, { userId: user.id, fileName: file.name });
      } else {
        const genericError = ErrorHandler.createError(
          ErrorCodes.UPLOAD_FAILED,
          'An unexpected error occurred during upload. Please try again.',
          { userId: user.id, fileName: file.name, fileSize: file.size }
        );
        
        updateState({
          isUploading: false,
          uploadProgress: 0,
          error: genericError.message,
        });
        
        ErrorHandler.showUserFriendlyError(genericError);
        ErrorHandler.logError(genericError, { originalError: error });
      }
    }
  }, [user, updateState]);

  const removeResume = useCallback(async () => {
    if (!user) {
      toast.error('You must be logged in to remove a resume');
      return;
    }

    try {
      // Get current resume file path
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('resume_file_path')
        .eq('id', user.id)
        .single();

      if (userError || !userData?.resume_file_path) {
        throw new Error('No resume file found to remove');
      }

      const filePath = userData.resume_file_path;

      // Remove file from storage
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage removal failed:', storageError.message);
      }

      // Remove resume analysis records
      const { error: analysisError } = await supabase
        .from('resume_analysis')
        .delete()
        .eq('user_id', user.id)
        .eq('file_path', filePath);

      if (analysisError) {
        console.warn('Analysis removal failed:', analysisError.message);
      }

      // Update user profile
      const { error: profileError } = await supabase
        .from('users')
        .update({
          resume_file_name: null,
          resume_file_path: null,
          resume_uploaded_at: null,
        })
        .eq('id', user.id);

      if (profileError) {
        throw new Error(`Profile update failed: ${profileError.message}`);
      }

      // Remove from platform data cache
      const { error: cacheError } = await supabase
        .from('user_platform_data')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', 'resume');

      if (cacheError) {
        console.warn('Cache removal failed:', cacheError.message);
      }

      resetState();
      toast.success('Resume removed successfully');

    } catch (error) {
      console.error('Resume removal failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Removal failed';
      
      updateState({ error: errorMessage });
      toast.error(`Removal failed: ${errorMessage}`);
    }
  }, [user, updateState, resetState]);

  const triggerAnalysis = useCallback(async (filePath: string) => {
    if (!user) return;

    try {
      // Get signed URL for the file
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (urlError || !signedUrlData?.signedUrl) {
        throw new Error('Failed to generate file access URL');
      }

      // Call FastAPI backend for OCR and AI analysis
      const response = await fetch(`${FASTAPI_ENDPOINT}/analyze-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_url: signedUrlData.signedUrl,
          file_path: filePath,
          user_id: user.id,
          supabase_url: import.meta.env.VITE_SUPABASE_URL,
          supabase_service_key: import.meta.env.VITE_SUPABASE_SERVICE_KEY, // Service key for backend access
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis request failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Analysis triggered successfully:', result);

    } catch (error) {
      console.error('Analysis trigger failed:', error);
      
      // Update analysis status to failed
      await supabase
        .from('resume_analysis')
        .update({
          processing_status: 'failed',
          processing_error: error instanceof Error ? error.message : 'Analysis failed',
        })
        .eq('user_id', user.id)
        .eq('file_path', filePath);
    }
  }, [user]);

  const getAnalysisResult = useCallback(async (): Promise<ResumeAnalysisResult | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('resume_analysis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Failed to fetch analysis result:', error);
        return null;
      }

      return data as ResumeAnalysisResult;

    } catch (error) {
      console.error('Error fetching analysis result:', error);
      return null;
    }
  }, [user]);

  return {
    state,
    uploadResume,
    removeResume,
    getAnalysisResult,
    triggerAnalysis,
    resetState,
  };
}