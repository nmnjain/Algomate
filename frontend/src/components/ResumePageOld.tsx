import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Loader2, 
  RefreshCw, 
  FileText, 
  Brain, 
  TrendingUp, 
  Target, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Star, 
  Award, 
  Building, 
  GraduationCap, 
  Briefcase, 
  Code, 
  Users, 
  Zap, 
  Shield, 
  BookOpen, 
  ChevronRight, 
  AlertTriangle,
  Trophy, 
  Lightbulb, 
  Rocket, 
  BarChart3, 
  Eye, 
  MessageSquare,
  Search, 
  Network, 
  GitBranch, 
  Database, 
  Globe, 
  Cpu
} from 'lucide-react';
import { useResumeData } from '../utils/useResumeData';
import { ResumeUpload } from './ResumeUpload';

export const ResumePage: React.FC = () => {
  const { data, loading, backgroundRefreshing, error, hasResume, refetch } = useResumeData();
  const [showUpload, setShowUpload] = useState(false);

  // No resume uploaded state
  if (!hasResume && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8 text-center space-y-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    AI-Powered Resume Analysis
                  </h1>
                  <p className="text-gray-600 mt-3 text-lg">
                    Upload your resume to get comprehensive AI insights, skill assessments, and personalized recommendations.
                  </p>
                </div>
              </div>

              {error && (
                <motion.div 
                  className="bg-red-50 border border-red-200 rounded-xl p-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-red-800 text-sm">{error}</p>
                </motion.div>
              )}

              <div className="space-y-6 max-w-md mx-auto">
                {!showUpload ? (
                  <Button 
                    onClick={() => setShowUpload(true)}
                    className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Resume
                  </Button>
                ) : (
                  <div className="bg-white/50 p-6 rounded-xl border border-gray-200">
                    <ResumeUpload onFileUpload={async (file: File) => {
                      // Handle file upload
                      setShowUpload(false);
                      await refetch();
                    }} />
                  </div>
                )}
              </div>

              {/* Feature highlights */}
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-8">
                {[
                  { icon: Brain, color: 'indigo', text: 'Advanced AI analysis of your skills and experience' },
                  { icon: TrendingUp, color: 'purple', text: 'Career trajectory analysis and growth opportunities' },
                  { icon: Target, color: 'pink', text: 'ATS optimization and keyword recommendations' },
                  { icon: Lightbulb, color: 'blue', text: 'Personalized improvement suggestions' }
                ].map(({ icon: Icon, color, text }, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-3 p-4 rounded-xl bg-white/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${color}-600`} />
                    </div>
                    <p className="text-sm text-gray-700">{text}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="p-12 text-center bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {data?.processing_status === 'processing' ? 'Analyzing Resume' : 'Loading Resume Data'}
              </h3>
              <p className="text-gray-600 mt-2">
                {data?.processing_status === 'processing' 
                  ? 'Our AI is analyzing your resume and generating insights...' 
                  : 'Fetching your resume analysis...'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="p-12 text-center bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">No Resume Data Available</h3>
              <p className="text-gray-600 mt-2">Unable to load your resume analysis. Please try refreshing.</p>
            </div>
            <Button onClick={refetch} variant="outline" className="rounded-xl">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Resume Analysis Dashboard
            </h1>
            <p className="text-gray-600 text-lg">AI-powered insights to optimize your career potential</p>
          </div>
          <div className="flex items-center space-x-3">
            {backgroundRefreshing && (
              <div className="flex items-center text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-xl">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </div>
            )}
            <Button onClick={() => setShowUpload(true)} variant="outline" className="rounded-xl bg-white/50 backdrop-blur-sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload New
            </Button>
            <Button onClick={refetch} variant="outline" className="rounded-xl bg-white/50 backdrop-blur-sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpload(false)}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Upload New Resume</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowUpload(false)}>
                    ×
                  </Button>
                </div>
                <ResumeUpload onFileUpload={async (file: File) => {
                  // Handle file upload
                  setShowUpload(false);
                  await refetch();
                }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resume Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{data.fileName}</h2>
                  <p className="text-indigo-100">
                    Uploaded on {new Date(data.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {data.processing_status === 'completed' && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="text-sm">Analysis Complete</span>
                  </div>
                )}
                {data.processing_status === 'processing' && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-yellow-300" />
                    <span className="text-sm">Processing...</span>
                  </div>
                )}
                {data.overall_score && (
                  <div className="text-right">
                    <div className="text-2xl font-bold">{data.overall_score}/100</div>
                    <div className="text-indigo-100 text-sm">Overall Score</div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {[
            { 
              label: 'ATS Score', 
              value: data.ats_score || data.ats_optimization?.current_ats_score || 'N/A', 
              icon: Search, 
              color: 'bg-gradient-to-br from-blue-400 to-blue-600' 
            },
            { 
              label: 'Experience Level', 
              value: data.experience_level || data.experience_analysis?.level || 'N/A', 
              icon: Briefcase, 
              color: 'bg-gradient-to-br from-green-400 to-green-600' 
            },
            { 
              label: 'Market Rating', 
              value: data.competitiveness_rating || data.market_competitiveness?.overall_rating || 'N/A', 
              icon: TrendingUp, 
              color: 'bg-gradient-to-br from-purple-400 to-purple-600' 
            },
            { 
              label: 'Skills Count', 
              value: data.skills ? (
                data.skills.technical.programming_languages.length +
                data.skills.technical.frameworks_libraries.length +
                data.skills.technical.databases.length +
                data.skills.soft_skills.length
              ) : 'N/A', 
              icon: Code, 
              color: 'bg-gradient-to-br from-orange-400 to-orange-600' 
            }
          ].map(({ label, value, icon: Icon, color }, index) => (
            <Card key={label} className="p-4 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <div className="flex justify-center">
              <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-xl p-1">
                <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  <Eye className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="skills" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  <Code className="h-4 w-4 mr-2" />
                  Skills
                </TabsTrigger>
                <TabsTrigger value="insights" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  <Brain className="h-4 w-4 mr-2" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  <Target className="h-4 w-4 mr-2" />
                  Tips
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Experience Analysis */}
                {data.experience_analysis && (
                  <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                        Experience Analysis
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Level:</span>
                        <Badge className="bg-indigo-100 text-indigo-800">{data.experience_analysis.level}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Experience:</span>
                        <span className="font-medium">{data.experience_analysis.total_experience_years}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Career Progression:</span>
                        <span className="font-medium text-right text-sm max-w-xs">{data.experience_analysis.career_progression}</span>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Resume Quality */}
                {data.resume_quality && (
                  <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-indigo-600" />
                        Resume Quality
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Overall Score:</span>
                        <Badge className="bg-green-100 text-green-800">{data.resume_quality.overall_score}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Formatting:</span>
                        <span className="font-medium">{data.resume_quality.formatting}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Content Clarity:</span>
                        <span className="font-medium">{data.resume_quality.content_clarity}</span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Market Competitiveness */}
              {data.market_competitiveness && (
                <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-indigo-600" />
                    Market Competitiveness
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600 mb-2">
                        {data.market_competitiveness.overall_rating}
                      </div>
                      <div className="text-sm text-gray-600">Overall Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600 mb-2">
                        {data.market_competitiveness.salary_range_estimate}
                      </div>
                      <div className="text-sm text-gray-600">Salary Range</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600 mb-2">
                        {data.market_competitiveness.target_companies?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Target Companies</div>
                    </div>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              {data.skills && (
                <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Code className="w-5 h-5 mr-2 text-indigo-600" />
                    Skills Portfolio
                  </h3>
                  
                  {/* Technical Skills Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { title: 'Programming Languages', items: data.skills.technical.programming_languages, icon: Code, color: 'blue' },
                      { title: 'Frameworks & Libraries', items: data.skills.technical.frameworks_libraries, icon: GitBranch, color: 'purple' },
                      { title: 'Databases', items: data.skills.technical.databases, icon: Database, color: 'green' },
                      { title: 'Cloud Platforms', items: data.skills.technical.cloud_platforms, icon: Globe, color: 'indigo' },
                      { title: 'DevOps Tools', items: data.skills.technical.devops_tools, icon: Cpu, color: 'orange' },
                      { title: 'Other Technical', items: data.skills.technical.other_technical, icon: Zap, color: 'yellow' }
                    ].map((category) => (
                      category.items.length > 0 && (
                        <div key={category.title} className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <category.icon className={`w-4 h-4 text-${category.color}-600`} />
                            <h4 className="font-medium text-gray-900">{category.title}</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {category.items.map((skill, index) => (
                              <Badge key={index} className={`bg-${category.color}-100 text-${category.color}-800 hover:bg-${category.color}-200`}>
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>

                  {/* Soft Skills */}
                  {data.skills.soft_skills.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <Users className="w-4 h-4 text-pink-600" />
                        <h4 className="font-medium text-gray-900">Soft Skills</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.skills.soft_skills.map((skill, index) => (
                          <Badge key={index} className="bg-pink-100 text-pink-800 hover:bg-pink-200">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {data.skills.certifications.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <Award className="w-4 h-4 text-yellow-600" />
                        <h4 className="font-medium text-gray-900">Certifications</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.skills.certifications.map((cert, index) => (
                          <Badge key={index} className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              {data.ai_insights && (
                <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-indigo-600" />
                    AI Insights
                  </h3>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {data.ai_insights.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </Card>
              )}

              {/* Career Trajectory */}
              {data.career_trajectory && (
                <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Rocket className="w-5 h-5 mr-2 text-indigo-600" />
                    Career Trajectory
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Next Logical Step</h4>
                      <p className="text-gray-700 text-sm">{data.career_trajectory.next_logical_step}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Five Year Potential</h4>
                      <p className="text-gray-700 text-sm">{data.career_trajectory.five_year_potential}</p>
                    </div>
                    {data.career_trajectory.career_pivot_options.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Career Pivot Options</h4>
                        <div className="flex flex-wrap gap-2">
                          {data.career_trajectory.career_pivot_options.map((option, index) => (
                            <Badge key={index} className="bg-blue-100 text-blue-800">
                              {option}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              {data.recommendations && data.recommendations.length > 0 && (
                <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-indigo-600" />
                    Personalized Recommendations
                  </h3>
                  <div className="space-y-4">
                    {data.recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        className={`p-4 rounded-xl border-l-4 ${
                          rec.priority === 'High' ? 'bg-red-50 border-red-400' :
                          rec.priority === 'Medium' ? 'bg-yellow-50 border-yellow-400' :
                          'bg-blue-50 border-blue-400'
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-start space-x-3">
                          <Badge className={`mt-1 ${
                            rec.priority === 'High' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {rec.priority}
                          </Badge>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{rec.category}</h4>
                            <p className="text-sm text-gray-700">{rec.suggestion}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              )}

              {/* ATS Optimization */}
              {data.ats_optimization && (
                <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Search className="w-5 h-5 mr-2 text-indigo-600" />
                    ATS Optimization
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current ATS Score</span>
                      <Badge className="bg-blue-100 text-blue-800">{data.ats_optimization.current_ats_score}</Badge>
                    </div>
                    
                    {data.ats_optimization.missing_keywords.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Missing Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {data.ats_optimization.missing_keywords.map((keyword, index) => (
                            <Badge key={index} className="bg-red-100 text-red-800">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {data.ats_optimization.improvements_needed.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Improvements Needed</h4>
                        <div className="space-y-2">
                          {data.ats_optimization.improvements_needed.map((improvement, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{improvement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};