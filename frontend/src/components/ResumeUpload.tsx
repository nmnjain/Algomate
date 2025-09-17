import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, AlertCircle, CheckCircle, X, FileImage } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';

interface ResumeUploadProps {
  onFileUpload: (file: File) => Promise<void>;
  onFileRemove?: () => void;
  existingFileName?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string;
  maxSizeInMB?: number;
}

const ALLOWED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg', 
  'image/png': '.png'
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export function ResumeUpload({
  onFileUpload,
  onFileRemove,
  existingFileName,
  isUploading = false,
  uploadProgress = 0,
  error,
  maxSizeInMB = 10
}: ResumeUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
      return `Invalid file type. Please upload PDF, JPG, or PNG files only.`;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size too large. Please upload files smaller than ${maxSizeInMB}MB.`;
    }

    return null;
  }, [maxSizeInMB]);

  const handleFileSelection = useCallback(async (file: File) => {
    const validation = validateFile(file);
    if (validation) {
      setValidationError(validation);
      return;
    }

    setValidationError('');
    setSelectedFile(file);
    
    try {
      await onFileUpload(file);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  }, [onFileUpload, validateFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, [handleFileSelection]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, [handleFileSelection]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove?.();
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    if (extension === 'pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <FileImage className="h-8 w-8 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasFile = existingFileName || selectedFile;

  return (
    <Card className="glassmorphism">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Resume Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={Object.values(ALLOWED_FILE_TYPES).join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Resume file upload"
          title="Select resume file"
        />

        {/* Upload Area */}
        {!hasFile && (
          <motion.div
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
              ${isDragActive 
                ? 'border-primary bg-primary/5 scale-105' 
                : 'border-border hover:border-primary/50 hover:bg-accent/30'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={openFileDialog}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                className={`p-4 rounded-full ${isDragActive ? 'bg-primary/20' : 'bg-accent/50'}`}
                animate={{ 
                  scale: isDragActive ? 1.1 : 1,
                  rotate: isDragActive ? 5 : 0 
                }}
              >
                <Upload className={`h-8 w-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF, JPG, PNG files up to {maxSizeInMB}MB
                </p>
              </div>

              <Button type="button" variant="outline" size="sm">
                Choose File
              </Button>
            </div>
          </motion.div>
        )}

        {/* File Preview */}
        <AnimatePresence>
          {hasFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glassmorphism p-4 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(existingFileName || selectedFile?.name || '')}
                  <div>
                    <p className="font-medium text-sm">
                      {existingFileName || selectedFile?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedFile ? formatFileSize(selectedFile.size) : 'Uploaded file'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!isUploading && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Progress */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Messages */}
        <AnimatePresence>
          {(validationError || error) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {validationError || error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Button (alternative to drag-drop) */}
        {!hasFile && !isUploading && (
          <div className="flex justify-center pt-4">
            <Button onClick={openFileDialog} variant="outline" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Select Resume File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}