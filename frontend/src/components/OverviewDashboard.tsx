import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  Activity, 
  Star, 
  GitBranch, 
  Code, 
  Target, 
  Trophy,
  TrendingUp,
  Calendar,
  RefreshCw,
  Mail,
  MapPin,
  User
} from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { useGitHubData } from '../utils/useGitHubData';
import { useLeetCodeData } from '../utils/useLeetCodeData';
import { useGFGData } from '../utils/useGFGData';
import { useResumeData } from '../utils/useResumeData';
import { useHackathonData } from '../utils/useHackathonData';
import { useUnifiedHeatmapData } from '../utils/useUnifiedHeatmapData';
import { UnifiedHeatmap } from './UnifiedHeatmap';

export function OverviewDashboard() {
  const { user } = useAuth();
  
  
  const { data: githubData, loading: githubLoading, refetch: refetchGitHub } = useGitHubData();
  const { data: leetcodeData, loading: leetcodeLoading, refetch: refetchLeetCode } = useLeetCodeData();
  const { data: gfgData, loading: gfgLoading, refetch: refetchGFG } = useGFGData();
  const { data: resumeData, loading: resumeLoading } = useResumeData();
  const { recommendedHackathons, loading: hackathonLoading } = useHackathonData();
  const { data: unifiedHeatmapData, loading: unifiedHeatmapLoading } = useUnifiedHeatmapData();

  const refreshAllData = async () => {
    await Promise.all([
      refetchGitHub(),
      refetchLeetCode(),
      refetchGFG()
    ]);
  };

  const stats = [
    {
      title: "GitHub Repositories",
      value: githubData?.stats?.totalRepos || 0,
      icon: GitBranch,
      color: "text-green-500",
      loading: githubLoading
    },
    {
      title: "GitHub Stars",
      value: githubData?.stats?.totalStars || 0,
      icon: Star,
      color: "text-yellow-500",
      loading: githubLoading
    },
    {
      title: "LeetCode Solved",
      value: leetcodeData?.stats?.totalSolved || 0,
      icon: Code,
      color: "text-orange-500",
      loading: leetcodeLoading
    },
    {
      title: "GFG Problems",
      value: gfgData?.stats?.totalProblemsSolved || 0,
      icon: Target,
      color: "text-green-600",
      loading: gfgLoading
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your progress across all platforms
            </p>
          </div>
          <Button onClick={refreshAllData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glassmorphism border-primary/20 hover:border-primary/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold">
                          {stat.loading ? (
                            <span className="animate-pulse">---</span>
                          ) : (
                            stat.value.toLocaleString()
                          )}
                        </p>
                      </div>
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Activity Heatmap */}
        <Card className="glassmorphism border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Activity Overview
            </CardTitle>
            <CardDescription>
              Combined activity from all connected platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            {unifiedHeatmapLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <UnifiedHeatmap data={unifiedHeatmapData} />
            )}
          </CardContent>
        </Card>

        {/* Platform Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* GitHub Status */}
          <Card className="glassmorphism border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <GitBranch className="h-5 w-5 mr-2 text-green-500" />
                GitHub
              </CardTitle>
            </CardHeader>
            <CardContent>
              {githubLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                </div>
              ) : githubData ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Commits</span>
                    <span className="font-medium">{githubData?.stats?.totalCommits || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Languages</span>
                    <span className="font-medium">{githubData?.stats?.topLanguages?.length || 0}</span>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500/30">
                    Connected
                  </Badge>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Not connected</p>
                  <Badge variant="outline" className="text-orange-500 border-orange-500/30">
                    Disconnected
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* LeetCode Status */}
          <Card className="glassmorphism border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Code className="h-5 w-5 mr-2 text-orange-500" />
                LeetCode
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leetcodeLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                </div>
              ) : leetcodeData ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ranking</span>
                    <span className="font-medium">{leetcodeData?.stats?.ranking?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Questions</span>
                    <span className="font-medium">{leetcodeData?.stats?.totalQuestions || 'N/A'}</span>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500/30">
                    Connected
                  </Badge>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Not connected</p>
                  <Badge variant="outline" className="text-orange-500 border-orange-500/30">
                    Disconnected
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resume Status */}
          <Card className="glassmorphism border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                Resume Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resumeLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                </div>
              ) : resumeData ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Overall Score</span>
                    <span className="font-medium">{resumeData.overall_score || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">ATS Score</span>
                    <span className="font-medium">{resumeData.ats_score || 'N/A'}</span>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500/30">
                    Analyzed
                  </Badge>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">No resume uploaded</p>
                  <Badge variant="outline" className="text-orange-500 border-orange-500/30">
                    Not Uploaded
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glassmorphism border-primary/20">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col">
                <RefreshCw className="h-5 w-5 mb-1" />
                <span className="text-xs">Sync Data</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Trophy className="h-5 w-5 mb-1" />
                <span className="text-xs">Find Hackathons</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <TrendingUp className="h-5 w-5 mb-1" />
                <span className="text-xs">View Analytics</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Calendar className="h-5 w-5 mb-1" />
                <span className="text-xs">Schedule</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}