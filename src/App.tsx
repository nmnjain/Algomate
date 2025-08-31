import { useState, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { Router } from "./components/Router";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { DashboardPreview } from "./components/DashboardPreview";
import { AIRecommendations } from "./components/AIRecommendations";
import { HackathonDiscovery } from "./components/HackathonDiscovery";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { DashboardPage } from "./components/DashboardPage";
import { Toaster } from "./components/ui/sonner";

function AppContent() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderPage = () => {
    switch (currentPath) {
      case '/login':
        return <LoginPage />;
      case '/signup':
        return <SignupPage />;
      case '/dashboard':
        return <DashboardPage />;
      default:
        return (
          <div className="dark min-h-screen bg-background text-foreground">
            <Header />
            
            <main>
              <HeroSection />
              
              <section id="features">
                <FeaturesSection />
              </section>
              
              <section id="dashboard">
                <DashboardPreview />
              </section>
              
              <AIRecommendations />
              
              <section id="hackathons">
                <HackathonDiscovery />
              </section>
              
              <TestimonialsSection />
              
              <CTASection />
            </main>
            
            <Footer />
          </div>
        );
    }
  };

  return (
    <>
      {renderPage()}
      <Toaster 
        theme="dark"
        position="top-right"
        richColors
        closeButton
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}