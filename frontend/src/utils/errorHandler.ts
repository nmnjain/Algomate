// Enhanced error handling utilities for resume upload and analysis
import { toast } from 'sonner';

export class ResumeError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'ResumeError';
  }
}

export enum ErrorCodes {
  // File Upload Errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  
  // OCR Processing Errors
  OCR_FAILED = 'OCR_FAILED',
  OCR_LOW_CONFIDENCE = 'OCR_LOW_CONFIDENCE',
  OCR_NO_TEXT_FOUND = 'OCR_NO_TEXT_FOUND',
  
  // AI Analysis Errors
  AI_ANALYSIS_FAILED = 'AI_ANALYSIS_FAILED',
  AI_QUOTA_EXCEEDED = 'AI_QUOTA_EXCEEDED',
  AI_INVALID_RESPONSE = 'AI_INVALID_RESPONSE',
  
  // Database Errors
  DB_CONNECTION_FAILED = 'DB_CONNECTION_FAILED',
  DB_WRITE_FAILED = 'DB_WRITE_FAILED',
  DB_READ_FAILED = 'DB_READ_FAILED',
  
  // Authentication Errors
  USER_NOT_AUTHENTICATED = 'USER_NOT_AUTHENTICATED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_UNAVAILABLE = 'API_UNAVAILABLE',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR'
}

export interface ErrorContext {
  userId?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  filePath?: string;
  operation?: string;
  timestamp?: string;
  additionalData?: any;
}

export class ErrorHandler {
  static createError(code: ErrorCodes, message: string, context?: ErrorContext): ResumeError {
    return new ResumeError(message, code, {
      ...context,
      timestamp: new Date().toISOString()
    });
  }

  static handleFileValidationError(file: File, maxSizeInMB: number = 10): ResumeError | null {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    
    if (file.size > maxSizeInBytes) {
      return this.createError(
        ErrorCodes.FILE_TOO_LARGE,
        `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum limit of ${maxSizeInMB}MB`,
        { fileName: file.name, fileSize: file.size }
      );
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return this.createError(
        ErrorCodes.INVALID_FILE_TYPE,
        `File type "${file.type}" is not supported. Please upload PDF, JPG, or PNG files only.`,
        { fileName: file.name, fileType: file.type }
      );
    }

    return null;
  }

  static handleUploadError(error: any, context?: ErrorContext): ResumeError {
    if (error?.message?.includes('quota')) {
      return this.createError(
        ErrorCodes.STORAGE_QUOTA_EXCEEDED,
        'Storage quota exceeded. Please contact support or try again later.',
        context
      );
    }

    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return this.createError(
        ErrorCodes.NETWORK_ERROR,
        'Network error occurred during upload. Please check your connection and try again.',
        context
      );
    }

    return this.createError(
      ErrorCodes.UPLOAD_FAILED,
      `Upload failed: ${error?.message || 'Unknown error'}`,
      context
    );
  }

  static handleOCRError(error: any, context?: ErrorContext): ResumeError {
    if (error?.message?.includes('confidence')) {
      return this.createError(
        ErrorCodes.OCR_LOW_CONFIDENCE,
        'OCR confidence is too low. Please ensure the document is clear and high quality.',
        context
      );
    }

    if (error?.message?.includes('no text')) {
      return this.createError(
        ErrorCodes.OCR_NO_TEXT_FOUND,
        'No readable text found in the document. Please ensure the document contains text.',
        context
      );
    }

    return this.createError(
      ErrorCodes.OCR_FAILED,
      `Text extraction failed: ${error?.message || 'OCR processing error'}`,
      context
    );
  }

  static handleAIError(error: any, context?: ErrorContext): ResumeError {
    if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
      return this.createError(
        ErrorCodes.AI_QUOTA_EXCEEDED,
        'AI analysis quota exceeded. Please try again later or contact support.',
        context
      );
    }

    if (error?.message?.includes('invalid') || error?.message?.includes('parse')) {
      return this.createError(
        ErrorCodes.AI_INVALID_RESPONSE,
        'AI analysis returned invalid data. Please try again.',
        context
      );
    }

    return this.createError(
      ErrorCodes.AI_ANALYSIS_FAILED,
      `AI analysis failed: ${error?.message || 'Analysis processing error'}`,
      context
    );
  }

  static handleDatabaseError(error: any, operation: string, context?: ErrorContext): ResumeError {
    if (error?.message?.includes('connection')) {
      return this.createError(
        ErrorCodes.DB_CONNECTION_FAILED,
        'Database connection failed. Please try again.',
        { ...context, operation }
      );
    }

    if (operation.includes('write') || operation.includes('insert') || operation.includes('update')) {
      return this.createError(
        ErrorCodes.DB_WRITE_FAILED,
        `Failed to save data: ${error?.message || 'Database write error'}`,
        { ...context, operation }
      );
    }

    return this.createError(
      ErrorCodes.DB_READ_FAILED,
      `Failed to retrieve data: ${error?.message || 'Database read error'}`,
      { ...context, operation }
    );
  }

  static handleAuthenticationError(error: any, context?: ErrorContext): ResumeError {
    if (error?.message?.includes('unauthorized') || error?.message?.includes('auth')) {
      return this.createError(
        ErrorCodes.USER_NOT_AUTHENTICATED,
        'Please log in to continue.',
        context
      );
    }

    return this.createError(
      ErrorCodes.INSUFFICIENT_PERMISSIONS,
      'Insufficient permissions for this operation.',
      context
    );
  }

  static showUserFriendlyError(error: ResumeError): void {
    const errorConfig = this.getErrorConfig(error.code as ErrorCodes);
    
    toast.error(error.message, {
      description: errorConfig.description,
      duration: errorConfig.duration,
      action: errorConfig.action ? {
        label: errorConfig.action.label,
        onClick: errorConfig.action.onClick
      } : undefined
    });

    // Log detailed error for debugging
    console.error('Resume Error:', {
      code: error.code,
      message: error.message,
      context: error.context,
      stack: error.stack
    });
  }

  private static getErrorConfig(code: ErrorCodes): {
    description?: string;
    duration?: number;
    action?: { label: string; onClick: () => void };
  } {
    switch (code) {
      case ErrorCodes.FILE_TOO_LARGE:
        return {
          description: 'Try compressing your file or using a different format.',
          duration: 6000
        };
      
      case ErrorCodes.INVALID_FILE_TYPE:
        return {
          description: 'Supported formats: PDF, JPG, PNG',
          duration: 5000
        };
      
      case ErrorCodes.OCR_LOW_CONFIDENCE:
        return {
          description: 'Try uploading a clearer image or PDF with better quality text.',
          duration: 7000
        };
      
      case ErrorCodes.AI_QUOTA_EXCEEDED:
        return {
          description: 'Our AI service is temporarily at capacity. Please try again in a few minutes.',
          duration: 8000,
          action: {
            label: 'Retry Later',
            onClick: () => {
              // Could implement retry logic
              console.log('User requested retry later');
            }
          }
        };
      
      case ErrorCodes.NETWORK_ERROR:
        return {
          description: 'Check your internet connection and try again.',
          duration: 5000,
          action: {
            label: 'Retry',
            onClick: () => {
              window.location.reload();
            }
          }
        };
      
      default:
        return {
          description: 'Please try again or contact support if the problem persists.',
          duration: 5000
        };
    }
  }

  static logError(error: ResumeError, additionalData?: any): void {
    // In production, this would send to error tracking service
    console.error('Resume Processing Error:', {
      code: error.code,
      message: error.message,
      context: error.context,
      additionalData,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });

    // Could integrate with error tracking services like Sentry
    // Sentry.captureException(error, { extra: additionalData });
  }

  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw lastError!;
  }
}