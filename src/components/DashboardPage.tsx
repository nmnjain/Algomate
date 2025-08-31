import { motion } from "motion/react"
import { Button } from "./ui/button"
import { Code2, LogOut, Github, Mail, FileText, Trophy, Activity, Star } from "lucide-react"
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from './Router'
import { toast } from "sonner@2.0.3"

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const { navigate } = useRouter()

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

  const stats = [
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
            <Github size={48} className="text-gray-400 mb-6 group-hover:text-white transition-colors" />
            <h3 className="text-xl font-semibold mb-4 text-foreground">Connect GitHub</h3>
            <p className="text-muted-foreground mb-6">
              Sync your repositories and showcase your coding projects automatically.
            </p>
            <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white">
              Connect GitHub
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
          className="glassmorphism p-8 rounded-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Recent Activity</h2>
          <div className="text-center py-12">
            <Activity size={48} className="mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No activity yet. Start by connecting your GitHub or uploading your resume!</p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}