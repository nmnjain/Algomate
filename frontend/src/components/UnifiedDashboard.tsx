import { motion } from "motion/react";
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { 
  Github, 
  Code2, 
  Target, 
  FileText, 
  Trophy, 
  Mail,
  Calendar,
  BarChart3,
  Settings
} from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { useGitHubData } from '../utils/useGitHubData';
import { useLeetCodeData } from '../utils/useLeetCodeData';
import { useGFGData } from '../utils/useGFGData';
import { useResumeData } from '../utils/useResumeData';
import { useHackathonData } from '../utils/useHackathonData';

const navigationItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: BarChart3,
    path: '/dashboard',
    description: 'Complete overview'
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: Github,
    path: '/dashboard/github',
    description: 'Repositories & Activity'
  },
  {
    id: 'leetcode',
    label: 'LeetCode',
    icon: Code2,
    path: '/dashboard/leetcode',
    description: 'Problem Solving'
  },
  {
    id: 'gfg',
    label: 'GeeksForGeeks',
    icon: Target,
    path: '/dashboard/gfg',
    description: 'Coding Practice'
  },
  {
    id: 'resume',
    label: 'Resume',
    icon: FileText,
    path: '/dashboard/resume',
    description: 'AI Analysis'
  },
  {
    id: 'hackathons',
    label: 'Hackathons',
    icon: Trophy,
    path: '/dashboard/hackathons',
    description: 'Discover Events'
  }
];

export function UnifiedDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  
  
  // Get platform data for status indicators
  const { data: githubData, loading: githubLoading } = useGitHubData();
  const { data: leetcodeData, loading: leetcodeLoading } = useLeetCodeData();
  const { data: gfgData, loading: gfgLoading } = useGFGData();
  const { data: resumeData, loading: resumeLoading } = useResumeData();
  const { recommendedHackathons, loading: hackathonLoading } = useHackathonData();

  const getConnectionStatus = (platform: string) => {
    switch (platform) {
      case 'github':
        return githubData ? 'connected' : 'disconnected';
      case 'leetcode':
        return leetcodeData ? 'connected' : 'disconnected';
      case 'gfg':
        return gfgData ? 'connected' : 'disconnected';
      case 'resume':
        return resumeData ? 'uploaded' : 'not-uploaded';
      case 'hackathons':
        return recommendedHackathons ? 'active' : 'inactive';
      default:
        return 'disconnected';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'uploaded':
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-2 py-0.5">Connected</Badge>;
      case 'disconnected':
      case 'not-uploaded':
      case 'inactive':
        return <Badge variant="outline" className="border-orange-500/30 text-orange-400 text-xs px-2 py-0.5">Not Connected</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-500/30 text-gray-400 text-xs px-2 py-0.5">Unknown</Badge>;
    }
  };

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    if (path !== '/dashboard' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  const isConnected = (platform: string) => {
    const status = getConnectionStatus(platform);
    return ['connected', 'uploaded', 'active'].includes(status);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main container with proper spacing from header */}
      <div className="pt-16 flex min-h-screen">
        {/* Left Sidebar */}
        <div className="w-72 bg-gradient-to-b from-background via-background/95 to-background border-r border-gray-700/30 flex flex-col backdrop-blur-xl shadow-2xl">
          {/* Profile Section */}
          <div className="p-6 border-b border-gray-700/30">
            <div className="relative">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-transparent rounded-2xl blur-xl"></div>
              
              <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <Avatar className="h-14 w-14 ring-2 ring-cyan-400/30 ring-offset-2 ring-offset-gray-800">
                      <AvatarImage 
                        src={user?.user_metadata?.avatar_url || '/placeholder-avatar.png'} 
                        alt={user?.user_metadata?.full_name || 'User'} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-lg font-bold">
                        {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'N'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg truncate">
                      {user?.user_metadata?.full_name || 'Naman Jain'}
                    </h3>
                    <p className="text-sm text-cyan-400 font-medium">
                      @{user?.user_metadata?.user_name || 'nmnjain'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-gray-700/50 flex items-center justify-center">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span className="truncate font-medium">{user?.email || 'jainnaman2774@gmail.com'}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <div className="h-8 w-8 rounded-lg bg-gray-700/50 flex items-center justify-center">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Joined 9/13/2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-400 mb-4 px-2 tracking-widest uppercase flex items-center">
                <div className="h-px bg-gradient-to-r from-gray-600 to-transparent flex-1 mr-3"></div>
                PLATFORMS
                <div className="h-px bg-gradient-to-l from-gray-600 to-transparent flex-1 ml-3"></div>
              </h4>
            </div>
            
            <div className="space-y-2">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path);
                const platformConnected = item.id === 'overview' ? true : isConnected(item.id);
                
                return (
                  <motion.div 
                    key={item.id} 
                    whileHover={{ x: 6, scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="relative group">
                      {/* Active indicator line */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-all duration-300 ${
                        isActive ? "bg-gradient-to-b from-cyan-400 to-blue-500" : "bg-transparent"
                      }`} />
                      
                      {/* Hover glow effect */}
                      <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? "bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-transparent" 
                          : "group-hover:bg-gradient-to-r group-hover:from-gray-700/30 group-hover:to-transparent"
                      }`} />
                      
                      <Button
                        variant="ghost"
                        className={`relative w-full h-auto p-4 text-left border transition-all duration-300 ${
                          isActive 
                            ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/5 text-cyan-300 border-cyan-500/30 shadow-lg shadow-cyan-500/10" 
                            : "text-gray-300 hover:text-white border-transparent hover:border-gray-700/50 hover:bg-gray-800/50"
                        }`}
                        onClick={() => {
                          
                          navigate(item.path);
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-4">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              isActive 
                                ? "bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg" 
                                : "bg-gray-700/50 group-hover:bg-gray-600/50"
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className={`font-semibold text-sm transition-colors ${
                                isActive ? "text-white" : "group-hover:text-white"
                              }`}>
                                {item.label}
                              </div>
                              <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                                {item.description}
                              </div>
                            </div>
                          </div>
                          
                          {item.id !== 'overview' && (
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                {getStatusBadge(getConnectionStatus(item.id))}
                              </div>
                              <div className={`h-3 w-3 rounded-full flex-shrink-0 ring-2 ring-gray-800 transition-all duration-300 ${
                                platformConnected 
                                  ? "bg-green-400 shadow-lg shadow-green-400/30" 
                                  : "bg-gray-500"
                              }`} />
                            </div>
                          )}
                        </div>
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Settings at bottom */}
          <div className="p-6 border-t border-gray-700/30">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
              
              <Button 
                variant="ghost" 
                className="relative w-full h-auto p-4 text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent hover:border-gray-700/50 transition-all duration-300" 
                onClick={() => navigate('/dashboard/settings')}
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-xl bg-gray-700/50 group-hover:bg-gray-600/50 flex items-center justify-center transition-all duration-300">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">Settings</div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                      Preferences & Config
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area - Right side */}
        <div className="flex-1 bg-background overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}