import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { 
  Code2, 
  Trophy, 
  Target, 
  TrendingUp, 
  CheckCircle,
  Circle,
  RefreshCw,
  Award
} from "lucide-react";
import { useLeetCodeData } from '../utils/useLeetCodeData';
import LeetCodeHeatmap from './LeetCodeHeatmap';

export function LeetCodePage() {
  const { data: leetcodeData, loading, error, refetch } = useLeetCodeData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-orange-400" />
          <p className="text-gray-400">Loading LeetCode data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Code2 className="h-16 w-16 mx-auto text-gray-600" />
          <h2 className="text-xl font-bold text-white">LeetCode Not Connected</h2>
          <p className="text-gray-400 max-w-md">
            Connect your LeetCode account to view your problem-solving progress and statistics.
          </p>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Code2 className="h-4 w-4 mr-2" />
            Connect LeetCode
          </Button>
        </div>
      </div>
    );
  }

  const stats = leetcodeData?.stats;
  const profile = leetcodeData?.profile;

  return (
    <div className="min-h-screen bg-gray-900 p-6 space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <Code2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">LeetCode Dashboard</h1>
            <p className="text-gray-400">Track your problem-solving journey</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            Connected
          </Badge>
          <Button 
            onClick={() => refetch()} 
            className="bg-gray-800 hover:bg-gray-700 border border-gray-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Solved</p>
                <p className="text-2xl font-bold text-white">{stats?.totalSolved || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Problems</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Current Ranking</p>
                <p className="text-2xl font-bold text-white">{stats?.ranking || profile?.ranking || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">Global Rank</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Contest Rating</p>
                <p className="text-2xl font-bold text-white">{leetcodeData?.contestRanking?.rating || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">Current Rating</p>
              </div>
              <Award className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.totalSolved && stats?.totalQuestions 
                    ? Math.round((stats.totalSolved / stats.totalQuestions) * 100) 
                    : 'N/A'}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Completion</p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Difficulty Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle>Problem Difficulty Breakdown</CardTitle>
            <CardDescription>Your progress across different difficulty levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Easy Problems */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <span className="text-white font-medium">Easy</span>
                  </span>
                  <span className="text-gray-400 text-sm">{stats?.easySolved || 0}</span>
                </div>
                <Progress 
                  value={stats?.easySolved ? 75 : 0} 
                  className="h-2 bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Solved: {stats?.easySolved || 0}</span>
                  <span>75%</span>
                </div>
              </div>

              {/* Medium Problems */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-white font-medium">Medium</span>
                  </span>
                  <span className="text-gray-400 text-sm">{stats?.mediumSolved || 0}</span>
                </div>
                <Progress 
                  value={stats?.mediumSolved ? 50 : 0} 
                  className="h-2 bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Solved: {stats?.mediumSolved || 0}</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Hard Problems */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                    <span className="text-white font-medium">Hard</span>
                  </span>
                  <span className="text-gray-400 text-sm">{stats?.hardSolved || 0}</span>
                </div>
                <Progress 
                  value={stats?.hardSolved ? 25 : 0} 
                  className="h-2 bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Solved: {stats?.hardSolved || 0}</span>
                  <span>25%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800/50 border-gray-700/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">Overview</TabsTrigger>
            <TabsTrigger value="submissions" className="data-[state=active]:bg-gray-700">Recent Submissions</TabsTrigger>
            <TabsTrigger value="heatmap" className="data-[state=active]:bg-gray-700">Activity Heatmap</TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-gray-700">Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Info */}
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle>Profile Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={profile.avatar} 
                          alt="LeetCode Avatar" 
                          className="h-16 w-16 rounded-xl ring-2 ring-gray-600"
                        />
                        <div>
                          <h3 className="text-lg font-bold text-white">{profile.name || profile.username}</h3>
                          <p className="text-gray-400">@{profile.username}</p>
                          <p className="text-sm text-gray-500">Ranking: {profile.ranking}</p>
                        </div>
                      </div>
                      {profile.about && (
                        <p className="text-gray-300">{profile.about}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Submissions */}
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle>Recent Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leetcodeData?.recentSubmissions?.slice(0, 5).map((submission, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700/30">
                        {submission.statusDisplay === 'Accepted' ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <Circle className="h-5 w-5 text-red-400" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">{submission.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-400">{submission.statusDisplay}</span>
                            <span className="text-xs text-gray-500">{submission.lang}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(submission.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    )) || (
                      <p className="text-gray-400 text-center py-8">No recent submissions available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle>All Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leetcodeData?.recentSubmissions?.map((submission, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        {submission.statusDisplay === 'Accepted' ? (
                          <CheckCircle className="h-6 w-6 text-green-400" />
                        ) : (
                          <Circle className="h-6 w-6 text-red-400" />
                        )}
                        <div>
                          <h3 className="font-medium text-white">{submission.title}</h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-sm text-gray-400">{submission.statusDisplay}</span>
                            <span className="text-sm text-gray-400">{submission.lang}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm text-gray-400">
                          {new Date(submission.timestamp).toLocaleDateString()}
                        </p>
                        {submission.runtime && (
                          <p className="text-xs text-gray-500">Runtime: {submission.runtime}</p>
                        )}
                      </div>
                    </motion.div>
                  )) || (
                    <div className="text-center py-12">
                      <Code2 className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                      <p className="text-gray-400">No submissions data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle>Submission Heatmap</CardTitle>
                <CardDescription>Your coding activity over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-6">
                  <LeetCodeHeatmap />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle>Top Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leetcodeData?.skillStats?.slice(0, 8).map((skill, index) => (
                      <div key={skill.tagName} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white">{skill.tagName}</span>
                          <span className="text-xs text-gray-400">{skill.problemsSolved} problems</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              index === 0 ? 'bg-orange-400 w-full' :
                              index === 1 ? 'bg-blue-400 w-5/6' :
                              index === 2 ? 'bg-green-400 w-4/6' :
                              index === 3 ? 'bg-purple-400 w-3/6' : 
                              index === 4 ? 'bg-pink-400 w-2/6' :
                              'bg-gray-400 w-1/6'
                            }`}
                          />
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-400 text-center py-8">No skill data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle>Languages Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leetcodeData?.languageStats?.slice(0, 6).map((lang, index) => (
                      <div key={lang.languageName} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white">{lang.languageName}</span>
                          <span className="text-xs text-gray-400">{lang.problemsSolved} problems</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              index === 0 ? 'bg-yellow-400 w-full' :
                              index === 1 ? 'bg-blue-400 w-4/5' :
                              index === 2 ? 'bg-green-400 w-3/5' :
                              index === 3 ? 'bg-red-400 w-2/5' :
                              index === 4 ? 'bg-purple-400 w-1/5' :
                              'bg-gray-400 w-1/6'
                            }`}
                          />
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-400 text-center py-8">No language data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}