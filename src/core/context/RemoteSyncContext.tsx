import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../../shared/lib/supabase';
import { useRemoteAuth } from './RemoteAuthContext';

interface RemoteSyncContextType {
  isOnline: boolean;
  lastSyncTime: string | null;
  hasSyncedThisSession: boolean;
}

const RemoteSyncContext = createContext<RemoteSyncContextType | undefined>(undefined);

export const RemoteSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useRemoteAuth();
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' && navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [hasSyncedThisSession, setHasSyncedThisSession] = useState(false);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Debounced profile sync on user activity
  useEffect(() => {
    if (!user || !isSupabaseConfigured || !supabase || !isOnline) {
      return;
    }

    let timeout: ReturnType<typeof setTimeout> | null = null;

    const syncUserProfile = async () => {
      try {
        const username = user.email?.split('@')[0]?.toLowerCase() ?? user.id;

        const { error } = await supabase.from('profiles').upsert(
          {
            id: user.id,
            username,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

        if (!error) {
          setLastSyncTime(new Date().toISOString());
          setHasSyncedThisSession(true);
        }
      } catch (err) {
        console.error('Failed to sync user profile:', err);
      }
    };

    timeout = setTimeout(syncUserProfile, 45000);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [user, isOnline]);

  const value = useMemo<RemoteSyncContextType>(
    () => ({
      isOnline,
      lastSyncTime,
      hasSyncedThisSession,
    }),
    [isOnline, lastSyncTime, hasSyncedThisSession]
  );

  return <RemoteSyncContext.Provider value={value}>{children}</RemoteSyncContext.Provider>;
};

export const useRemoteSync = () => {
  const context = useContext(RemoteSyncContext);
  if (!context) {
    throw new Error('useRemoteSync must be used within a RemoteSyncProvider');
  }
  return context;
};
