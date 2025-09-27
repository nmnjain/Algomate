import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Loader2, RefreshCw, FileText, Brain, TrendingUp, Target, Upload, CheckCircle, 
  AlertTriangle, Star, Award, Building, GraduationCap, Briefcase, Code, 
  Users, Zap, BookOpen, ChevronRight, Trophy, Lightbulb, Rocket, BarChart3, 
  Eye, MessageSquare, Search, Network, GitBranch, Database, Cpu, Clock, ExternalLink, FolderOpen,
  Trash2, Edit3, X
} from 'lucide-react';
import { useResumeUpload } from '../utils/useResumeUpload';
import { useResumeData } from '../utils/useResumeData';
import { ResumeUpload } from './ResumeUpload';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

// --- HELPER COMPONENTS for a clean and consistent UI ---

interface AnalysisCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass?: string;
  children: React.ReactNode;
  className?: string;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ title, icon: Icon, colorClass = 'text-cyan-400', children, className = '' }) => (
    <Card className={`bg-gray-800/50 border border-gray-700 shadow-lg backdrop-blur-sm h-full ${className}`}>
        <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg text-white">
                <Icon className={`w-5 h-5 ${colorClass}`} />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

interface QuickStatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

const QuickStatCard: React.FC<QuickStatCardProps> = ({ label, value, icon: Icon }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-center gap-4 transition-all hover:border-gray-600 hover:bg-gray-800">
        <Icon className="w-8 h-8 text-gray-400 flex-shrink-0" />
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);

interface MetricBoxProps {
  label: string;
  value: string | number | undefined;
}

const MetricBox: React.FC<MetricBoxProps> = ({ label, value }) => (
  <div className="p-4 bg-gray-900/50 rounded-lg text-center border border-gray-700 h-full flex flex-col justify-center">
    <p className="text-xl md:text-2xl font-bold text-white">{value || 'N/A'}</p>
    <p className="text-xs text-gray-400 mt-1">{label}</p>
  </div>
);

interface InfoListProps {
  items: string[] | undefined;
  icon: React.ComponentType<{ className?: string }>;
  colorClass?: string;
}

const InfoList: React.FC<InfoListProps> = ({ items, icon: Icon, colorClass = 'text-cyan-400' }) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return <p className="text-sm text-gray-500">No data available.</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start text-sm text-gray-300">
          <Icon className={`w-4 h-4 mr-3 mt-1 flex-shrink-0 ${colorClass}`} />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
};

export const ResumePage: React.FC = () => {
  const { user } = useAuth();
  const { data, loading, error, refetch, hasResume } = useResumeData();
  const { uploadResume, removeResume, getAnalysisResult, state } = useResumeUpload();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get file URL for viewing resume
  const getResumeUrl = async () => {
    if (!data?.filePath) return null;
    try {
      const { data: urlData, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(data.filePath, 3600); // 1 hour expiry
      
      if (error) {
        console.error('Error getting signed URL:', error);
        toast.error('Failed to generate resume URL');
        return null;
      }
      
      return urlData?.signedUrl;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get resume URL');
      return null;
    }
  };

  // Handle viewing resume
  const handleViewResume = async () => {
    const url = await getResumeUrl();
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Handle resume upload (for both new and update)
  const handleResumeUpload = async (file: File) => {
    try {
      setIsUpdating(true);
      
      // Show different messages based on whether this is an update or new upload
      const isUpdate = hasResume;
      
      // Upload the resume (this automatically handles deletion of old resume)
      await uploadResume(file);
      
      setShowUploadModal(false);
      toast.success(isUpdate ? 'Resume updated successfully!' : 'Resume uploaded successfully!');
      
      // Refresh the data to show the new analysis
      await refetch();
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(hasResume ? 'Failed to update resume' : 'Failed to upload resume');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle resume update (remove and upload new)
  const handleUpdateResume = () => {
    setShowUploadModal(true);
  };

  // Handle resume deletion
  const handleDeleteResume = async () => {
    if (window.confirm('Are you sure you want to delete your resume? This action cannot be undone.')) {
      try {
        await removeResume();
        toast.success('Resume deleted successfully');
        refetch();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete resume');
      }
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (data?.processing_status === 'processing') {
      interval = setInterval(async () => {
        const result = await getAnalysisResult();
        if (result?.processing_status === 'completed' || result?.processing_status === 'failed') {
          refetch();
          clearInterval(interval);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [data?.processing_status, getAnalysisResult, refetch]);
  
  // States: Loading, Error, No Resume
  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>;
  if (error) return <div className="text-center p-8 text-red-400">Error: {error} <Button onClick={() => refetch()} className="ml-4">Retry</Button></div>;
  
  // Show upload section if no resume
  if (!hasResume) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Resume Analysis</h1>
            <p className="text-gray-400">Upload your resume to get AI-powered insights and optimize your career potential</p>
          </div>
          <ResumeUpload 
            onFileUpload={handleResumeUpload}
            isUploading={state.isUploading}
            uploadProgress={state.uploadProgress}
            error={state.error || undefined}
          />
        </motion.div>
      </div>
    );
  }
  if (data?.processing_status === 'processing') {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <AnalysisCard title="Analyzing Your Resume..." icon={Clock} colorClass="text-yellow-400">
          <p className="text-gray-400 mt-2">This usually takes 30-60 seconds.</p>
        </AnalysisCard>
      </div>
    );
  }
  if (!data) return <div className="text-center p-8">No analysis data found. Please try again.</div>;

  const totalSkills = (data.skills?.technical ? Object.values(data.skills.technical).flat().length : 0) + (data.skills?.soft_skills?.length || 0);
  const formattedDate = data.uploadedAt ? new Date(data.uploadedAt).toLocaleDateString() : 'Invalid Date';

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* PAGE HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Resume Analysis</h1>
          <p className="text-gray-400">AI-powered insights to optimize your career potential</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleViewResume} variant="outline">
            <Eye className="w-4 h-4 mr-2" />View Resume
          </Button>
          <Button onClick={handleUpdateResume} variant="outline">
            <Edit3 className="w-4 h-4 mr-2" />Update Resume
          </Button>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
          <Button onClick={handleDeleteResume} variant="outline" className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
            <Trash2 className="w-4 h-4 mr-2" />Delete
          </Button>
        </div>
      </motion.div>
      
      {/* DASHBOARD HEADER CARD */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-gray-800/50 border border-gray-700">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-cyan-400 flex-shrink-0"/>
                    <div>
                        <p className="text-xs text-gray-400">Uploaded on {formattedDate}</p>
                        <div className="flex items-center text-xs text-green-400 mt-1">
                            <CheckCircle className="w-3 h-3 mr-1" /> Analysis Complete
                        </div>
                    </div>
                </div>
                <div className="flex justify-center">
                    <div className="text-center">
                        <p className="text-sm text-gray-400">File: {data.fileName}</p>
                        <p className="text-xs text-gray-500 mt-1">{data.processing_status === 'completed' ? 'Ready for insights' : 'Processing...'}</p>
                    </div>
                </div>
                <div className="text-center md:text-right">
                    <p className="text-3xl font-bold text-white">{data.overall_score}</p>
                    <p className="text-sm text-gray-400">Overall Score</p>
                </div>
            </CardContent>
        </Card>
      </motion.div>
      
       {/* QUICK STATS BAR */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <QuickStatCard label="ATS Score" value={`${data.ats_score}`} icon={Search} />
        <QuickStatCard label="Experience Level" value={data.experience_level} icon={Briefcase} />
        <QuickStatCard label="Market Rating" value={data.competitiveness_rating} icon={TrendingUp} />
        <QuickStatCard label="Skills Tracked" value={totalSkills} icon={Code} />
      </motion.div>

      {/* TABS */}
      <Tabs defaultValue="overview">
        <div className="flex justify-center">
          <TabsList className="flex flex-wrap h-auto justify-center gap-1 bg-gray-800 p-1 rounded-xl border border-gray-700">
            <TabsTrigger value="overview"><Eye className="w-4 h-4 mr-2" />Overview</TabsTrigger>
            <TabsTrigger value="experience"><Briefcase className="w-4 h-4 mr-2" />Experience & Projects</TabsTrigger>
            <TabsTrigger value="skills"><Code className="w-4 h-4 mr-2" />Skills & Gaps</TabsTrigger>
            <TabsTrigger value="action_plan"><Lightbulb className="w-4 h-4 mr-2" />Action Plan</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          <AnalysisCard title="AI Summary" icon={Brain} colorClass="text-purple-400">
            <p className="text-gray-300 leading-relaxed">{data.overall_insights}</p>
          </AnalysisCard>
          <div className="grid md:grid-cols-2 gap-6">
            <AnalysisCard title="Standout Qualities" icon={Star} colorClass="text-yellow-400">
              <InfoList items={data.standout_qualities} icon={CheckCircle} colorClass="text-green-400" />
            </AnalysisCard>
            <AnalysisCard title="Red Flags & Concerns" icon={AlertTriangle} colorClass="text-red-400">
              {data.red_flags && data.red_flags.length > 0 ? (
                <InfoList items={data.red_flags} icon={AlertTriangle} colorClass="text-red-400" />
              ) : <p className="text-gray-400">No significant red flags detected. Great work!</p>}
            </AnalysisCard>
          </div>
        </TabsContent>

        <TabsContent value="experience" className="mt-6 space-y-6">
           <AnalysisCard title="Professional Experience" icon={Briefcase} colorClass="text-cyan-400">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricBox label="Level" value={data.experience_analysis?.level}/>
                  <MetricBox label="Total Experience" value={data.experience_analysis?.total_experience_years}/>
                  <MetricBox label="Career Progression" value={data.experience_analysis?.career_progression}/>
                  <MetricBox label="Employment Gaps" value={data.experience_analysis?.gaps_in_employment}/>
               </div>
           </AnalysisCard>
            <div className="grid md:grid-cols-2 gap-6">
              <AnalysisCard title="Project Analysis" icon={FolderOpen} colorClass="text-orange-400">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <MetricBox label="Project Quality" value={data.project_analysis?.project_quality}/>
                    <MetricBox label="Technical Complexity" value={data.project_analysis?.technical_complexity}/>
                    <MetricBox label="Standout Projects" value={data.project_analysis?.standout_projects?.length}/>
                  </div>
                  <h4 className="font-semibold mb-2 text-white">Standout Projects</h4>
                  <InfoList items={data.project_analysis?.standout_projects} icon={Star} colorClass="text-yellow-400"/>
              </AnalysisCard>
               <AnalysisCard title="Education" icon={GraduationCap} colorClass="text-green-400">
                  <MetricBox label="Degree Relevance" value={data.education_analysis?.degree_relevance}/>
                  <MetricBox label="Institution Tier" value={data.education_analysis?.institution_tier}/>
                  <MetricBox label="Academic Performance" value={data.education_analysis?.academic_performance}/>
              </AnalysisCard>
            </div>
        </TabsContent>

        <TabsContent value="skills" className="mt-6 space-y-6">
            <AnalysisCard title="Technical Skills" icon={Code} colorClass="text-blue-400">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
                {Object.entries(data.skills?.technical || {}).map(([category, skills]) => (
                  <div key={category}>
                    <h4 className="font-semibold capitalize text-gray-400 mb-2 text-sm">{category.replace(/_/g, ' ')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {(skills as string[]).map(skill => <Badge key={skill} variant="outline" className="text-gray-300 border-gray-600">{skill}</Badge>)}
                    </div>
                  </div>
                ))}
              </div>
            </AnalysisCard>
             <AnalysisCard title="Skill Gap Analysis" icon={Target} colorClass="text-orange-400">
                 <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-semibold text-white mb-3">Missing Skills for Current Level</h4>
                        <InfoList items={data.skill_gap_analysis?.for_current_level} icon={ChevronRight} colorClass="text-orange-400"/>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-3">Skills for Next Level</h4>
                        <InfoList items={data.skill_gap_analysis?.for_next_level} icon={Rocket} colorClass="text-purple-400"/>
                    </div>
                 </div>
             </AnalysisCard>
        </TabsContent>
        
        <TabsContent value="action_plan" className="mt-6 space-y-6">
           <AnalysisCard title="AI Recommendations" icon={Lightbulb} colorClass="text-yellow-400">
             <div className="grid md:grid-cols-2 gap-4">
               {data.recommendations?.map((rec, index) => (
                 <div key={index} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                   <h4 className="font-semibold text-white">{rec.category} <Badge variant="outline" className="ml-2 border-yellow-400 text-yellow-400">{rec.priority}</Badge></h4>
                   <p className="text-sm text-gray-300 mt-1">{rec.suggestion}</p>
                 </div>
               ))}
             </div>
           </AnalysisCard>
            <div className="grid md:grid-cols-2 gap-6">
               <AnalysisCard title="ATS Optimization" icon={Search} colorClass="text-blue-400">
                 <p className="text-sm text-gray-300 mb-3"><strong>Improvements Needed:</strong> {data.ats_optimization?.improvements_needed}</p>
                 <h4 className="font-semibold text-white mb-2">Keywords to Add</h4>
                 <div className="flex flex-wrap gap-2">
                   {data.ats_optimization?.missing_keywords?.map(kw => <Badge key={kw} className="bg-gray-700 text-cyan-300">{kw}</Badge>)}
                 </div>
               </AnalysisCard>
               <AnalysisCard title="Interview Preparation" icon={MessageSquare} colorClass="text-purple-400">
                 <p className="text-sm text-gray-300"><strong>Readiness:</strong> {data.interview_preparation?.technical_readiness}</p>
                 <h4 className="font-semibold text-white mt-4 mb-2">Likely Topics</h4>
                 <InfoList items={data.interview_preparation?.likely_interview_topics} icon={BookOpen} colorClass="text-cyan-400" />
               </AnalysisCard>
            </div>
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !isUpdating && setShowUploadModal(false)}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {hasResume ? 'Update Resume' : 'Upload Resume'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => !isUpdating && setShowUploadModal(false)}
                disabled={isUpdating}
                className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {hasResume && (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-300 font-semibold mb-1">Replace Current Resume</p>
                    <p className="text-yellow-400 text-sm">
                      This will permanently replace your current resume ({data?.fileName}) and all associated analysis data.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <ResumeUpload
              onFileUpload={handleResumeUpload}
              isUploading={isUpdating || state.isUploading}
              uploadProgress={state.uploadProgress}
              error={state.error || undefined}
              existingFileName={hasResume ? data?.fileName : undefined}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
};