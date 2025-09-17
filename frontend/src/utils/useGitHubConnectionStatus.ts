import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ConnectionStatus {
  isConnected: boolean;
  hasValidToken: boolean;
  hasRecentData: boolean;
  lastSyncAt: string | null;
  connectionData: any | null;
  loading: boolean;
}

interface ConnectionData {
  username: string;
  avatar_url: string;
  name: string;
}

export function useGitHubConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    hasValidToken: false,
    hasRecentData: false,
    lastSyncAt: null,
    connectionData: null,
    loading: true,
  });
  
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setStatus({
        isConnected: false,
        hasValidToken: false,
        hasRecentData: false,
        lastSyncAt: null,
        connectionData: null,
        loading: false,
      });
      return;
    }

    const checkConnectionStatus = async () => {
      try {
        // Check 1: Do we have a valid OAuth token?
        const { data: session } = await supabase.auth.getSession();
        const hasToken = !!(
          user?.user_metadata?.provider_token || 
          session?.session?.provider_token ||
          user?.user_metadata?.provider_access_token ||
          session?.session?.user?.user_metadata?.provider_token
        );

        // Check 2: Do we have recent cached data?
        const { data: cachedData } = await supabase
          .from('user_platform_data')
          .select('last_updated')
          .eq('user_id', user.id)
          .eq('platform', 'github')
          .single();

        const hasRecentData = cachedData ? 
          (new Date(cachedData.last_updated) > new Date(Date.now() - 24 * 60 * 60 * 1000)) : // 24 hours
          false;

        // Check 3: Do we have a permanent connection record?
        const { data: connection, error: connectionError } = await supabase
          .from('user_platform_connections')
          .select('*')
          .eq('user_id', user.id)
          .eq('platform', 'github')
          .eq('is_active', true)
          .single();

        // Fallback: If connection table doesn't exist, use cached data as connection indicator
        const isConnected = connection ? true : (cachedData && hasToken);

        setStatus({
          isConnected,
          hasValidToken: hasToken,
          hasRecentData,
          lastSyncAt: connection?.last_sync_at || null,
          connectionData: connection?.connection_data || null,
          loading: false,
        });

      } catch (error) {
        console.error('Error checking GitHub connection status:', error);
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };

    checkConnectionStatus();
  }, [user]);

  return status;
}

// Helper hook for determining what action to show
export function useGitHubActionStatus(githubError?: string | null) {
  const connectionStatus = useGitHubConnectionStatus();
  
  if (connectionStatus.loading) {
    return { action: 'loading', label: 'Checking connection...', disabled: true };
  }
  
  // If not connected at all, show connect button
  if (!connectionStatus.isConnected) {
    return { action: 'connect', label: 'Connect GitHub', disabled: false };
  }
  
  // If connected, always show refresh data (handles token expiration internally)
  return { action: 'refresh', label: 'Refresh Data', disabled: false };
}
