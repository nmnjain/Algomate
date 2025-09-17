import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Supabase's onAuthStateChange listener in AuthContext will handle the session.
      // This component's job is to wait for that to complete and then navigate.
      
      // We give the listener a moment to process the session from the URL.
      const sessionPromise = new Promise((resolve) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              subscription.unsubscribe();
              resolve(session);
            }
          }
        );
        // Timeout to prevent waiting forever
        setTimeout(() => {
            subscription.unsubscribe();
            resolve(null);
        }, 5000);
      });

      toast.promise(sessionPromise, {
        loading: 'Finalizing connection, please wait...',
        success: () => {
          navigate('/dashboard');
          return 'Successfully connected to GitHub!';
        },
        error: () => {
          navigate('/login');
          return 'Authentication failed. Please try again.';
        },
      });
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center">
      <div className="glassmorphism p-8 rounded-2xl text-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Processing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;

