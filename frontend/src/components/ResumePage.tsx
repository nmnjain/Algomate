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
  Eye, MessageSquare, Search, Network, GitBranch, Database, Cpu, Clock, ExternalLink, FolderOpen
} from 'lucide-react';
import { useResumeUpload } from '../utils/useResumeUpload';
import { useResumeData } from '../utils/useResumeData';
import { ResumeUpload } from './ResumeUpload';

// --- HELPER COMPONENTS for a clean and consistent UI ---

const AnalysisCard = ({ title, icon: Icon, colorClass = 'text-cyan-400', children, className = '' }) => (
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

const QuickStatCard = ({ label, value, icon: Icon }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-center gap-4 transition-all hover:border-gray-600 hover:bg-gray-800">
        <Icon className="w-8 h-8 text-gray-400 flex-shrink-0" />
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const MetricBox = ({ label, value }) => (
  <div className="p-4 bg-gray-900/50 rounded-lg text-center border border-gray-700 h-full flex flex-col justify-center">
    <p className="text-xl md:text-2xl font-bold text-white">{value || 'N/A'}</p>
    <p className="text-xs text-gray-400 mt-1">{label}</p>
  </div>
);

const InfoList = ({ items, icon: Icon, colorClass = 'text-cyan-400' }) => {
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
  const { data, loading, error, refetch, hasResume } = useResumeData();
  const { uploadResume, getAnalysisResult } = useResumeUpload();

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
  if (!hasResume) return <div className="text-center p-8"><ResumeUpload onFileUpload={uploadResume} /></div>;
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
  const formattedDate = data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Invalid Date';

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* PAGE HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Resume Analysis</h1>
          <p className="text-gray-400">AI-powered insights to optimize your career potential</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
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
                {data.file_url && (
                    <div className="flex justify-center">
                        <Button variant="outline" onClick={() => window.open(data.file_url, '_blank')}>
                            <ExternalLink className="w-4 h-4 mr-2" /> View Resume
                        </Button>
                    </div>
                )}
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
              {data.red_flags?.length > 0 ? (
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
                   <p className="text-sm text-gray-300 mt-1">{rec.recommendation}</p>
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
    </div>
  );
};