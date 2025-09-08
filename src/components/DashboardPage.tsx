import { motion } from "motion/react"
import { Button } from "./ui/button"
import { Code2, LogOut, Github, Mail, FileText, Trophy, Activity, Star, GitBranch, Users } from "lucide-react"
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from "sonner";
import { useGitHubData } from '../utils/useGitHubData';
import { useGitHubConnectionStatus, useGitHubActionStatus } from '../utils/useGitHubConnectionStatus'

export function DashboardPage() {
  const { user, signOut, signInWithGitHub } = useAuth()
  const navigate = useNavigate()
  const { data: githubData, loading: githubLoading, backgroundRefreshing, error: githubError, cacheInfo, refetch, fetchInitial } = useGitHubData()
  const connectionStatus = useGitHubConnectionStatus()
  const actionStatus = useGitHubActionStatus()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      navigate('/')
    } catch (error) {
      toast.error('Error signing out')
      console.error('Sign out error:', error)
    }
  }

  const handleGitHubAction = async () => {
    try {
      switch (actionStatus.action) {
        case 'connect':
        case 'reconnect':
          const { error } = await signInWithGitHub();
          if (error) {
            toast.error(`GitHub connection failed: ${error.message}`);
          } else {
            toast.success('GitHub account connected successfully!');
            // Fetch fresh data after successful connection
            setTimeout(() => {
              fetchInitial();
            }, 2000);
          }
          break;
          
        case 'sync':
          toast.info('Loading GitHub data...');
          await fetchInitial();
          toast.success('GitHub data loaded successfully!');
          break;
          
        case 'refresh':
          toast.info('Refreshing GitHub data...');
          await refetch();
          toast.success('GitHub data refreshed successfully!');
          break;
      }
    } catch (error) {
      toast.error('Failed to perform GitHub action');
      console.error('GitHub action error:', error);
    }
  };

  // Determine if user has GitHub data to display
  const hasGitHubData = githubData && !githubError;

  const stats = hasGitHubData ? [
    { icon: GitBranch, label: "Repositories", value: githubData.stats.totalRepos.toString(), color: "text-primary" },
    { icon: Star, label: "Total Stars", value: githubData.stats.totalStars.toString(), color: "text-secondary" },
    { icon: Activity, label: "Commits", value: githubData.stats.totalCommits.toString(), color: "text-accent" },
    { icon: Users, label: "Followers", value: githubData.profile.followers.toString(), color: "text-green-400" }
  ] : [
    { icon: Activity, label: "Coding Streak", value: "0 days", color: "text-primary" },
    { icon: Star, label: "Total Points", value: "0", color: "text-secondary" },
    { icon: Trophy, label: "Hackathons", value: "0", color: "text-accent" },
    { icon: FileText, label: "Projects", value: "0", color: "text-green-400" }
  ]

  return (
    <div className="dark min-h-screen bg-background text-foreground gradient-mesh">
      {/* Header */}
      <header className="glassmorphism border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="p-2 glassmorphism rounded-lg glow-cyan">
              <Code2 size={24} className="text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Algomate
            </span>
            {backgroundRefreshing && (
              <div className="ml-3 flex items-center gap-1 text-xs text-primary">
                <div className="animate-spin w-3 h-3 border border-primary border-t-transparent rounded-full"></div>
                <span>Syncing...</span>
              </div>
            )}
          </motion.div>

          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.user_metadata?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="border-border hover:bg-red-500/10 hover:border-red-500 hover:text-red-400"
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
            Welcome to Your Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your developer journey starts here. Track your progress, discover opportunities, and showcase your skills.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="glassmorphism p-6 rounded-xl text-center group hover:scale-105 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <motion.div
                className={`${stat.color} mb-3 mx-auto`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <stat.icon size={32} />
              </motion.div>
              <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Connect GitHub */}
          <motion.div
            className="glassmorphism p-8 rounded-2xl group hover:scale-105 transition-all duration-300"
            whileHover={{ y: -10 }}
          >
            <Github size={48} className={`mb-6 group-hover:scale-110 transition-transform ${
              hasGitHubData ? 'text-green-400' : 
              connectionStatus.isConnected ? 'text-blue-400' : 
              'text-gray-400 group-hover:text-white'
            }`} />
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              {actionStatus.action === 'loading' ? 'Checking Connection' : 
               hasGitHubData ? 'GitHub Connected' : 
               connectionStatus.isConnected ? 'GitHub Connected' : 'Connect GitHub'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {hasGitHubData 
                ? `Connected as ${githubData.profile.login}. Your repositories and stats are displayed above.`
                : connectionStatus.isConnected
                ? 'GitHub account connected. Click below to load your repository data.'
                : 'Sync your repositories and showcase your coding projects automatically.'
              }
            </p>
            
            {/* Connection Status Info */}
            {connectionStatus.isConnected && connectionStatus.lastSyncAt && (
              <div className="text-xs text-muted-foreground mb-4 p-2 bg-muted/20 rounded flex items-center justify-between">
                <span>Last synced: {new Date(connectionStatus.lastSyncAt).toLocaleString()}</span>
                {backgroundRefreshing && (
                  <div className="flex items-center gap-1">
                    <div className="animate-spin w-3 h-3 border border-primary border-t-transparent rounded-full"></div>
                    <span className="text-primary">Updating...</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Cache Info */}
            {cacheInfo.exists && (
              <div className="text-xs text-muted-foreground mb-4 p-2 bg-muted/10 rounded border border-muted/30">
                <div className="flex items-center justify-between">
                  <span>
                    Data age: {cacheInfo.ageInHours ? `${cacheInfo.ageInHours.toFixed(1)} hours` : 'Unknown'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    cacheInfo.isStale 
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {cacheInfo.isStale ? 'Refreshing' : 'Fresh'}
                  </span>
                </div>
              </div>
            )}
            <Button 
              className={`w-full ${
                hasGitHubData ? 'bg-green-600 hover:bg-green-700' :
                connectionStatus.isConnected ? 'bg-blue-600 hover:bg-blue-700' :
                'bg-gray-800 hover:bg-gray-700'
              } text-white`}
              onClick={handleGitHubAction}
              disabled={actionStatus.disabled || githubLoading}
            >
              {githubLoading ? 'Loading...' : actionStatus.label}
            </Button>
          </motion.div>

          {/* Upload Resume */}
          <motion.div
            className="glassmorphism p-8 rounded-2xl group hover:scale-105 transition-all duration-300"
            whileHover={{ y: -10 }}
          >
            <FileText size={48} className="text-primary mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-4 text-foreground">Update Resume</h3>
            <p className="text-muted-foreground mb-6">
              Upload or update your resume to enhance your developer profile.
            </p>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Upload Resume
            </Button>
          </motion.div>

          {/* Find Hackathons */}
          <motion.div
            className="glassmorphism p-8 rounded-2xl group hover:scale-105 transition-all duration-300"
            whileHover={{ y: -10 }}
          >
            <Trophy size={48} className="text-accent mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-4 text-foreground">Find Hackathons</h3>
            <p className="text-muted-foreground mb-6">
              Discover hackathons that match your skills and interests.
            </p>
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              Browse Hackathons
            </Button>
          </motion.div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Recent Repositories */}
          <div className="glassmorphism p-8 rounded-2xl">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Recent Repositories</h2>
            {hasGitHubData ? (
              <div className="space-y-4">
                {githubData.recentRepos.map((repo, index) => (
                  <motion.div
                    key={repo.name}
                    className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground hover:text-primary">
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                            {repo.name}
                          </a>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {repo.description || "No description available"}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star size={12} />
                            {repo.stars}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitBranch size={12} />
                            {repo.forks}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Github size={48} className="mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {githubLoading ? "Loading repositories..." : "Connect GitHub to see your repositories"}
                </p>
              </div>
            )}
          </div>

          {/* Top Languages */}
          <div className="glassmorphism p-8 rounded-2xl">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Top Languages</h2>
            {hasGitHubData && githubData.stats.topLanguages.length > 0 ? (
              <div className="space-y-4">
                {githubData.stats.topLanguages.map(([language, count], index) => (
                  <motion.div
                    key={language}
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary"></div>
                      <span className="font-medium text-foreground">{language}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{count} repos</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Code2 size={48} className="mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {githubLoading ? "Loading languages..." : "Connect GitHub to see your top languages"}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}