import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from '../App';
import {LoginPage} from './LoginPage';
import {SignupPage} from './SignupPage';
import {DashboardPage} from './DashboardPage';
import { UnifiedDashboard } from './UnifiedDashboard';
import { OverviewDashboard } from './OverviewDashboard';
import GitHubPage from './GitHubPage';
import { LeetCodePage } from './LeetCodePage';
import { GFGPage } from './GFGPage';
import { ResumePage } from './ResumePage';
import AuthCallback from './AuthCallback';
import { useAuth } from '../contexts/AuthContext';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { DashboardPreview } from './DashboardPreview';
import { AIRecommendations } from './AIRecommendations';
// import { HackathonDiscovery } from './HackathonDiscovery';
import { TestimonialsSection } from './TestimonialsSection';
import { CTASection } from './CTASection';
import { HackathonsRoutePage } from './HackathonsRoutePage';

export function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <div className="glassmorphism p-8 rounded-2xl">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-center mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={
            <>
              <HeroSection />
              <FeaturesSection />
              <DashboardPreview />
              <AIRecommendations />
              
              <TestimonialsSection />
              <CTASection />
            </>
          } />
          <Route path="login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="signup" element={!user ? <SignupPage /> : <Navigate to="/dashboard" />} />
          <Route path="dashboard/*" element={user ? <UnifiedDashboard /> : <Navigate to="/login" />}>
            <Route index element={<OverviewDashboard />} />
            <Route path="github" element={<GitHubPage />} />
            <Route path="leetcode" element={<LeetCodePage />} />
            <Route path="gfg" element={<GFGPage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="hackathons" element={<HackathonsRoutePage />} />
          </Route>
          <Route path="auth/callback" element={<AuthCallback />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
