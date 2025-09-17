import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  Loader2, RefreshCw, FileText, Brain, TrendingUp, Target, Upload, CheckCircle, 
  AlertCircle, Clock, Star, Award, Building, GraduationCap, Briefcase, 
  Code, Users, Zap, Shield, BookOpen, Map, ChevronRight, AlertTriangle,
  Trophy, Lightbulb, Rocket, BarChart3, Eye, MessageSquare, Calendar,
  Search, Network, GitBranch, Database, Globe, Cpu, Smartphone,
  ChartBar, PieChart
} from 'lucide-react';
import { useResumeUpload } from '../utils/useResumeUpload';
import { useResumeData } from '../utils/useResumeData';
import { ResumeUpload } from './ResumeUpload';
import { toast } from 'sonner';

interface SkillsVisualizationProps {
  skills: {
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
}

const SkillsVisualization: React.FC<SkillsVisualizationProps> = ({ skills }) => {
  const skillCategories = [
    {
      title: 'Programming Languages',
      items: skills.technical.programming_languages,
      icon: Code,
      color: 'blue'
    },
    {
      title: 'Frameworks & Libraries',
      items: skills.technical.frameworks_libraries,
      icon: GitBranch,
      color: 'purple'
    },
    {
      title: 'Databases',
      items: skills.technical.databases,
      icon: Database,
      color: 'green'
    },
    {
      title: 'Cloud Platforms',
      items: skills.technical.cloud_platforms,
      icon: Globe,
      color: 'indigo'
    },
    {
      title: 'DevOps Tools',
      items: skills.technical.devops_tools,
      icon: Cpu,
      color: 'orange'
    },
    {
      title: 'Other Technical',
      items: skills.technical.other_technical,
      icon: Zap,
      color: 'yellow'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      green: 'bg-green-100 text-green-800 hover:bg-green-200',
      indigo: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      orange: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      red: 'bg-red-100 text-red-800 hover:bg-red-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Technical Skills - Horizontal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {skillCategories.map((category, categoryIndex) => {
          if (!category.items || category.items.length === 0) return null;
          
          const Icon = category.icon;
          return (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="glassmorphism p-4 rounded-lg border border-gray-200 h-full"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`h-5 w-5 text-${category.color}-500`} />
                <h4 className="font-semibold text-gray-900 text-sm">{category.title}</h4>
                <Badge variant="outline" className="ml-auto text-xs">
                  {category.items.length}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.items.map((skill, index) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                  >
                    <Badge variant="secondary" className={`${getColorClasses(category.color)} text-xs`}>
                      {skill}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Soft Skills & Certifications - Horizontal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Soft Skills */}
        {skills.soft_skills && skills.soft_skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glassmorphism p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-green-500" />
              <h4 className="font-semibold text-gray-900">Soft Skills</h4>
              <Badge variant="outline" className="ml-auto text-xs">
                {skills.soft_skills.length}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.soft_skills.map((skill, index) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + (index * 0.05) }}
                >
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
                    {skill}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Certifications */}
        {skills.certifications && skills.certifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glassmorphism p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-5 w-5 text-yellow-500" />
              <h4 className="font-semibold text-gray-900">Certifications</h4>
              <Badge variant="outline" className="ml-auto text-xs">
                {skills.certifications.length}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.certifications.map((cert, index) => (
                <motion.div
                  key={cert}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + (index * 0.05) }}
                >
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    {cert}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Missing Critical Skills */}
      {skills.missing_critical_skills && skills.missing_critical_skills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glassmorphism p-6 rounded-lg border border-red-200 bg-red-50"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h4 className="text-lg font-semibold text-red-800">Skills to Develop</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.missing_critical_skills.map((skill, index) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + (index * 0.05) }}
              >
                <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">
                  {skill}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

interface FocusAreasProps {
  focusAreas: string[];
  experienceLevel: string;
}

const FocusAreas: React.FC<FocusAreasProps> = ({ focusAreas, experienceLevel }) => {
  const getExperienceLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'entry': return 'bg-blue-100 text-blue-800';
      case 'mid': return 'bg-yellow-100 text-yellow-800';
      case 'senior': return 'bg-green-100 text-green-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-500" />
          Experience Level
        </h4>
        <Badge className={`${getExperienceLevelColor(experienceLevel)} text-lg px-4 py-2`}>
          {experienceLevel}
        </Badge>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-500" />
          Focus Areas
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {focusAreas.map((area, index) => (
            <motion.div
              key={area}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glassmorphism p-4 rounded-lg border border-purple-200"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="font-medium">{area}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Comprehensive Analysis Components
interface ExperienceAnalysisProps {
  analysis: {
    level: string;
    total_experience_years: string;
    career_progression: string;
    industry_exposure: string[];
    gaps_in_employment: string;
  };
}

const ExperienceAnalysis: React.FC<ExperienceAnalysisProps> = ({ analysis }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="glassmorphism">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Experience Level</span>
            </div>
            <p className="text-lg font-semibold">{analysis.level}</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Total Experience</span>
            </div>
            <p className="text-lg font-semibold">{analysis.total_experience_years}</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Career Progression</span>
            </div>
            <p className="text-sm">{analysis.career_progression}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-indigo-500" />
              Industry Exposure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.industry_exposure.map((industry, index) => (
                <Badge key={index} variant="secondary" className="bg-indigo-100 text-indigo-800">
                  {industry}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Employment Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{analysis.gaps_in_employment}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface ProjectAnalysisProps {
  analysis: {
    project_quality: string;
    technical_complexity: string;
    business_impact: string;
    standout_projects: string[];
    missing_project_types: string[];
  };
}

const ProjectAnalysis: React.FC<ProjectAnalysisProps> = ({ analysis }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glassmorphism">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Project Quality</span>
            </div>
            <p className="text-lg font-semibold">{analysis.project_quality}</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Technical Complexity</span>
            </div>
            <p className="text-lg font-semibold">{analysis.technical_complexity}</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Business Impact</span>
            </div>
            <p className="text-lg font-semibold">{analysis.business_impact}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gold-500" />
              Standout Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.standout_projects.map((project, index) => (
                <div key={index} className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{project}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Missing Project Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.missing_project_types.map((type, index) => (
                <div key={index} className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-orange-700">{type}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface SkillGapAnalysisProps {
  analysis: {
    for_current_level: string[];
    for_next_level: string[];
    trending_technologies: string[];
    learning_priority: {
      high: string[];
      medium: string[];
      low: string[];
    };
  };
}

const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({ analysis }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Current Level Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.for_current_level.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-purple-500" />
              Next Level Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.for_next_level.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Trending Technologies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.trending_technologies.map((tech, index) => (
              <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                <Zap className="h-3 w-3 mr-1" />
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glassmorphism border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.learning_priority.high.map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">{skill}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Clock className="h-5 w-5 text-yellow-500" />
              Medium Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.learning_priority.medium.map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">{skill}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <BookOpen className="h-5 w-5 text-green-500" />
              Low Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.learning_priority.low.map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">{skill}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface MarketCompetitivenessProps {
  analysis: {
    overall_rating: string;
    salary_range_estimate: string;
    target_companies: string[];
    competitive_advantages: string[];
    major_weaknesses: string[];
  };
}

const MarketCompetitiveness: React.FC<MarketCompetitivenessProps> = ({ analysis }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glassmorphism">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Overall Rating</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{analysis.overall_rating}</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <ChartBar className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Salary Range</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{analysis.salary_range_estimate}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-purple-500" />
              Target Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.target_companies.map((company, index) => (
                <div key={index} className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{company}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Trophy className="h-5 w-5 text-green-500" />
              Competitive Advantages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.competitive_advantages.map((advantage, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700">{advantage}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.major_weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">{weakness}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface RecommendationsProps {
  recommendations: Array<{
    category: string;
    recommendation?: string;
    suggestion?: string;
    impact?: 'High' | 'Medium' | 'Low';
    priority?: 'High' | 'Medium' | 'Low';
    timeframe?: string;
    resources?: string[];
  }>;
}

const Recommendations: React.FC<RecommendationsProps> = ({ recommendations }) => {
  const getPriorityColor = (priority: string | undefined) => {
    if (!priority) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Brain className="h-5 w-5 text-indigo-500" />
        AI Recommendations
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec, index) => {
          const priorityValue = rec.priority || rec.impact || 'Medium';
          const suggestionText = rec.recommendation || rec.suggestion || '';
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glassmorphism p-4 rounded-lg border ${getPriorityColor(priorityValue)}`}
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {rec.category}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(priorityValue)}`}>
                    {priorityValue} Priority
                  </Badge>
                  {rec.timeframe && (
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                      {rec.timeframe}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{suggestionText}</p>
                {rec.resources && rec.resources.length > 0 && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Resources: </span>
                    {Array.isArray(rec.resources) ? rec.resources.join(', ') : rec.resources}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

interface ProcessingStatusProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ status, progress = 0 }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          label: 'Pending Analysis',
          description: 'Your resume is queued for processing'
        };
      case 'processing':
        return {
          icon: Loader2,
          color: 'text-blue-500 animate-spin',
          bgColor: 'bg-blue-100',
          label: 'Processing Resume',
          description: 'AI is analyzing your resume...'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          label: 'Analysis Complete',
          description: 'Your resume has been successfully analyzed'
        };
      case 'failed':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          label: 'Analysis Failed',
          description: 'There was an error processing your resume'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} p-6 rounded-lg border`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`h-6 w-6 ${config.color}`} />
        <h3 className="text-lg font-semibold">{config.label}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">{config.description}</p>
      
      {status === 'processing' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
};

const ResumeDashboard: React.FC = () => {
  const { state, uploadResume, removeResume, getAnalysisResult, resetState } = useResumeUpload();
  const { data, loading, error, refetch, hasResume } = useResumeData();
  const [activeTab, setActiveTab] = useState('upload');
  const [analysisStatus, setAnalysisStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');

  // Check analysis status periodically
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (hasResume && data?.analysis_id) {
      interval = setInterval(async () => {
        const result = await getAnalysisResult();
        if (result) {
          setAnalysisStatus(result.processing_status);
          if (result.processing_status === 'completed' || result.processing_status === 'failed') {
            await refetch(); // Refresh dashboard data
          }
        }
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasResume, data?.analysis_id, getAnalysisResult, refetch]);

  const handleFileUpload = async (file: File) => {
    try {
      await uploadResume(file);
      setActiveTab('analysis'); // Switch to analysis tab after upload
      setAnalysisStatus('processing');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleFileRemove = async () => {
    try {
      await removeResume();
      resetState();
      setActiveTab('upload');
      toast.success('Resume removed successfully');
    } catch (error) {
      console.error('Remove failed:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  const isAnalysisComplete = analysisStatus === 'completed';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resume Analysis</h2>
          <p className="text-muted-foreground">Upload and analyze your resume with AI-powered insights</p>
        </div>
        {hasResume && (
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      <Card className="glassmorphism">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Horizontal Tab Navigation */}
            <div className="mb-6">
              <TabsList className="flex justify-start gap-2 h-auto p-1 bg-transparent rounded-lg overflow-x-auto min-w-full">
                <TabsTrigger 
                  value="upload" 
                  className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger 
                  value="analysis" 
                  disabled={!hasResume}
                  className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap disabled:opacity-50"
                >
                  <Brain className="h-4 w-4" />
                  Analysis
                </TabsTrigger>
                <TabsTrigger 
                  value="skills" 
                  disabled={!hasResume || !isAnalysisComplete}
                  className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap disabled:opacity-50"
                >
                  <Code className="h-4 w-4" />
                  Skills
                </TabsTrigger>
                <TabsTrigger 
                  value="experience" 
                  disabled={!hasResume || !isAnalysisComplete}
                  className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap disabled:opacity-50"
                >
                  <Briefcase className="h-4 w-4" />
                  Experience
                </TabsTrigger>
                <TabsTrigger 
                  value="projects" 
                  disabled={!hasResume || !isAnalysisComplete}
                  className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap disabled:opacity-50"
                >
                  <Rocket className="h-4 w-4" />
                  Projects
                </TabsTrigger>
                <TabsTrigger 
                  value="gaps" 
                  disabled={!hasResume || !isAnalysisComplete}
                  className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap disabled:opacity-50"
                >
                  <Target className="h-4 w-4" />
                  Skill Gaps
                </TabsTrigger>
                <TabsTrigger 
                  value="market" 
                  disabled={!hasResume || !isAnalysisComplete}
                  className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap disabled:opacity-50"
                >
                  <TrendingUp className="h-4 w-4" />
                  Market
                </TabsTrigger>
                <TabsTrigger 
                  value="insights" 
                  disabled={!hasResume || !isAnalysisComplete}
                  className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap disabled:opacity-50"
                >
                  <Lightbulb className="h-4 w-4" />
                  Insights
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upload" className="mt-6">
              <ResumeUpload
                onFileUpload={handleFileUpload}
                onFileRemove={handleFileRemove}
                existingFileName={data?.fileName}
                isUploading={state.isUploading}
                uploadProgress={state.uploadProgress}
                error={state.error || undefined}
              />
            </TabsContent>

            <TabsContent value="analysis" className="mt-6">
              <div className="space-y-6">
                {hasResume ? (
                  <>
                    <ProcessingStatus status={analysisStatus} progress={75} />
                    
                    {/* Overall Scores - Horizontal Layout */}
                    {isAnalysisComplete && data && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.overall_score && (
                          <Card className="glassmorphism">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                <span className="text-sm font-medium text-gray-600">Overall Score</span>
                              </div>
                              <p className="text-2xl font-bold text-yellow-600">{data.overall_score}/10</p>
                            </CardContent>
                          </Card>
                        )}
                        
                        {data.ats_score && (
                          <Card className="glassmorphism">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Search className="h-5 w-5 text-blue-500" />
                                <span className="text-sm font-medium text-gray-600">ATS Score</span>
                              </div>
                              <p className="text-2xl font-bold text-blue-600">{data.ats_score}/100</p>
                            </CardContent>
                          </Card>
                        )}
                        
                        {data.competitiveness_rating && (
                          <Card className="glassmorphism">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Trophy className="h-5 w-5 text-green-500" />
                                <span className="text-sm font-medium text-gray-600">Market Rating</span>
                              </div>
                              <p className="text-lg font-bold text-green-600">{data.competitiveness_rating}</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {/* Quick Overview */}
                    {isAnalysisComplete && data?.overall_insights && (
                      <Card className="glassmorphism">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5 text-indigo-500" />
                            Quick Overview
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 leading-relaxed">{data.overall_insights}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Standout Qualities and Red Flags */}
                    {isAnalysisComplete && (data?.standout_qualities || data?.red_flags) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.standout_qualities && data.standout_qualities.length > 0 && (
                          <Card className="glassmorphism border-green-200 bg-green-50">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-green-800">
                                <Trophy className="h-5 w-5 text-green-500" />
                                Standout Qualities
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {data.standout_qualities.map((quality, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-green-700">{quality}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {data.red_flags && data.red_flags.length > 0 && (
                          <Card className="glassmorphism border-red-200 bg-red-50">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-red-800">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Areas of Concern
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {data.red_flags.map((flag, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-sm text-red-700">{flag}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                    
                    {data?.extracted_text && isAnalysisComplete && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Extracted Text Preview
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                            <pre className="text-sm whitespace-pre-wrap text-gray-700">
                              {data.extracted_text?.substring(0, 500) || 'No text extracted'}
                              {data.extracted_text && data.extracted_text.length > 500 && '...'}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resume Uploaded</h3>
                    <p className="text-gray-600 mb-4">Upload your resume to start the analysis process</p>
                    <Button onClick={() => setActiveTab('upload')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Resume
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="skills" className="mt-6">
              {data?.skills && isAnalysisComplete ? (
                <div className="space-y-6">
                  <SkillsVisualization skills={data.skills} />
                  <FocusAreas 
                    focusAreas={data.focus_areas || []} 
                    experienceLevel={data.experience_level || 'Entry'} 
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <Code className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills Analysis Pending</h3>
                  <p className="text-gray-600">Complete the resume analysis to view skills breakdown</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="experience" className="mt-6">
              {data?.experience_analysis && isAnalysisComplete ? (
                <ExperienceAnalysis analysis={data.experience_analysis} />
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Experience Analysis Pending</h3>
                  <p className="text-gray-600">Complete the resume analysis to view experience breakdown</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="projects" className="mt-6">
              {data?.project_analysis && isAnalysisComplete ? (
                <ProjectAnalysis analysis={data.project_analysis} />
              ) : (
                <div className="text-center py-12">
                  <Rocket className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Analysis Pending</h3>
                  <p className="text-gray-600">Complete the resume analysis to view project breakdown</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="gaps" className="mt-6">
              {data?.skill_gap_analysis && isAnalysisComplete ? (
                <SkillGapAnalysis analysis={data.skill_gap_analysis} />
              ) : (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Skill Gap Analysis Pending</h3>
                  <p className="text-gray-600">Complete the resume analysis to view skill gap recommendations</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="market" className="mt-6">
              {data?.market_competitiveness && isAnalysisComplete ? (
                <MarketCompetitiveness analysis={data.market_competitiveness} />
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Analysis Pending</h3>
                  <p className="text-gray-600">Complete the resume analysis to view market competitiveness</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              {(data?.ai_insights || data?.overall_insights) && isAnalysisComplete ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-indigo-500" />
                        AI Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed">
                          {data.overall_insights || data.ai_insights}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {data.recommendations && data.recommendations.length > 0 && (
                    <Recommendations recommendations={data.recommendations} />
                  )}

                  {/* Additional Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.ats_optimization && (
                      <Card className="glassmorphism">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-blue-500" />
                            ATS Optimization
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-600">Current ATS Score:</span>
                              <p className="text-lg font-semibold">{data.ats_optimization?.current_ats_score || 'N/A'}</p>
                            </div>
                            {data.ats_optimization?.missing_keywords && data.ats_optimization.missing_keywords.length > 0 && (
                              <div>
                                <span className="text-sm font-medium text-gray-600">Missing Keywords:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {data.ats_optimization?.missing_keywords?.map((keyword, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {keyword}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {data.interview_preparation && (
                      <Card className="glassmorphism">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-green-500" />
                            Interview Readiness
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-600">Technical Readiness:</span>
                              <p className="text-lg font-semibold">{data.interview_preparation?.technical_readiness || 'Not available'}</p>
                            </div>
                            {data.interview_preparation?.likely_interview_topics && data.interview_preparation.likely_interview_topics.length > 0 && (
                              <div>
                                <span className="text-sm font-medium text-gray-600">Likely Topics:</span>
                                <div className="space-y-1 mt-1">
                                  {data.interview_preparation?.likely_interview_topics?.slice(0, 3).map((topic, index) => (
                                    <div key={index} className="text-sm text-gray-700">• {topic}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {data.career_trajectory && (
                    <Card className="glassmorphism">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Map className="h-5 w-5 text-purple-500" />
                          Career Trajectory
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Next Logical Step:</span>
                            <p className="text-sm text-gray-800">{data.career_trajectory?.next_logical_step || 'Not available'}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">5-Year Potential:</span>
                            <p className="text-sm text-gray-800">{data.career_trajectory?.five_year_potential || 'Not available'}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Pivot Options:</span>
                            <div className="space-y-1 mt-1">
                              {data.career_trajectory?.career_pivot_options?.slice(0, 2).map((option, index) => (
                                <div key={index} className="text-sm text-gray-700">• {option}</div>
                              )) || <div className="text-sm text-gray-500">No pivot options available</div>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lightbulb className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Insights Pending</h3>
                  <p className="text-gray-600">Complete the resume analysis to view AI insights</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeDashboard;