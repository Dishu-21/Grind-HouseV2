import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../../shared/lib/supabase';
import { formatAuthError, isValidUsername, normalizeUsername, toSupabaseEmail } from '../../shared/utils/auth';

interface RemoteAuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  isPromptDismissed: boolean;
  isPasswordRecovery: boolean;
  unconfirmedEmail: string | null;
  setPendingUnconfirmedEmail: (email: string | null) => void;
  dismissPrompt: () => void;
  resetPrompt: () => void;
  signUpWithEmail: (
    username: string,
    password: string,
    displayName?: string
  ) => Promise<{ error: string | null; confirmationRequired: boolean }>;
  signInWithPassword: (username: string, password: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
}

const SYNC_PROMPT_DISMISSED_KEY = 'ojeet-sync-prompt-dismissed';
const PENDING_UNCONFIRMED_EMAIL_KEY = 'ojeet-pending-unconfirmed-email';
const REMOTE_SYNC_META_PREFIX = 'ojeet-remote-sync-';

const readPromptDismissed = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SYNC_PROMPT_DISMISSED_KEY) === '1';
};

const readPendingUnconfirmedEmail = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PENDING_UNCONFIRMED_EMAIL_KEY) || null;
};

const writePendingUnconfirmedEmail = (email: string | null) => {
  if (typeof window === 'undefined') return;
  if (email && email.trim()) {
    localStorage.setItem(PENDING_UNCONFIRMED_EMAIL_KEY, email.trim());
  } else {
    localStorage.removeItem(PENDING_UNCONFIRMED_EMAIL_KEY);
  }
};

const clearRemoteSyncMetadata = () => {
  if (typeof window === 'undefined') return;
  const keysToRemove: string[] = [PENDING_UNCONFIRMED_EMAIL_KEY];

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(REMOTE_SYNC_META_PREFIX) || key === 'jee-community-friends-cache')) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
};

const RemoteAuthContext = createContext<RemoteAuthContextType | undefined>(undefined);

export const RemoteAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);
  const [isPromptDismissed, setIsPromptDismissed] = useState<boolean>(readPromptDismissed);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(false);
  const [pendingUnconfirmedEmail, setPendingUnconfirmedEmailState] = useState<string | null>(
    readPendingUnconfirmedEmail
  );

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to get session:', err);
        if (!isMounted) return;
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const unconfirmedEmail = useMemo(() => {
    if (user) return null;
    return pendingUnconfirmedEmail;
  }, [user, pendingUnconfirmedEmail]);

  const setPendingUnconfirmedEmail = useCallback((email: string | null) => {
    const trimmed = email && email.trim() ? email.trim() : null;
    setPendingUnconfirmedEmailState(trimmed);
    writePendingUnconfirmedEmail(trimmed);
  }, []);

  const dismissPrompt = useCallback(() => {
    setIsPromptDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SYNC_PROMPT_DISMISSED_KEY, '1');
    }
  }, []);

  const resetPrompt = useCallback(() => {
    setIsPromptDismissed(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SYNC_PROMPT_DISMISSED_KEY);
    }
  }, []);

  const signUpWithEmail = useCallback(
    async (username: string, password: string, displayName?: string) => {
      if (!isSupabaseConfigured || !supabase) {
        return {
          error: 'Cloud sync is not configured yet.',
          confirmationRequired: false,
        };
      }

      const normalizedUsername = normalizeUsername(username);
      if (!isValidUsername(normalizedUsername)) {
        return {
          error: 'Username must be 3–20 characters using letters, numbers, or underscores.',
          confirmationRequired: false,
        };
      }

      const fakeEmail = toSupabaseEmail(normalizedUsername);

      try {
        const { data, error } = await supabase.auth.signUp({
          email: fakeEmail,
          password,
          options: {
            data: displayName ? { full_name: displayName, name: displayName } : undefined,
          },
        });

        if (error) {
          return {
            error: error.message,
            confirmationRequired: false,
          };
        }

        const alreadyExists = await supabase
          .from('profiles')
          .select('id')
          .eq('username', normalizedUsername)
          .maybeSingle();

        if (alreadyExists.error) {
          console.warn('Duplicate username check failed:', alreadyExists.error);
        }

        if (alreadyExists.data) {
          return {
            error: 'This username is already taken.',
            confirmationRequired: false,
          };
        }

        if (data.user) {
          const { error: insertError } = await supabase
            .from('profiles')
            .upsert(
              {
                id: data.user.id,
                username: normalizedUsername,
                total_study_minutes: 0,
                today_study_minutes: 0,
                syllabus_completion_percent: 0,
                last_seen: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'id' }
            );

          if (insertError) {
            return {
              error: insertError.message || 'Failed to create profile.',
              confirmationRequired: false,
            };
          }
        }

        return { error: null, confirmationRequired: false };
      } catch (err: any) {
        return {
          error: err?.message || 'Something went wrong while creating your account.',
          confirmationRequired: false,
        };
      }
    },
    []
  );

  const signInWithPassword = useCallback(
    async (username: string, password: string) => {
      if (!isSupabaseConfigured || !supabase) {
        return { error: 'Cloud sync is not configured yet.' };
      }

      const normalizedUsername = normalizeUsername(username);
      if (!isValidUsername(normalizedUsername)) {
        return { error: 'Username must be 3–20 characters using letters, numbers, or underscores.' };
      }

      const fakeEmail = toSupabaseEmail(normalizedUsername);

      const { error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password,
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      return { error: null };
    },
    []
  );

  const updatePassword = useCallback(
    async (newPassword: string) => {
      if (!isSupabaseConfigured || !supabase) {
        return { error: 'Cloud sync is not configured yet.' };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      return { error: error?.message ?? null };
    },
    []
  );

  const signOut = useCallback(async () => {
    setPendingUnconfirmedEmailState(null);
    writePendingUnconfirmedEmail(null);
    clearRemoteSyncMetadata();

    if (!isSupabaseConfigured || !supabase) {
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    return { error: error?.message ?? null };
  }, []);

  const value = useMemo<RemoteAuthContextType>(
    () => ({
      user,
      session,
      isLoading,
      isConfigured: isSupabaseConfigured,
      isPromptDismissed,
      isPasswordRecovery,
      unconfirmedEmail,
      setPendingUnconfirmedEmail,
      dismissPrompt,
      resetPrompt,
      signUpWithEmail,
      signInWithPassword,
      updatePassword,
      signOut,
    }),
    [user, session, isLoading, isPromptDismissed, isPasswordRecovery, unconfirmedEmail]
  );

  return <RemoteAuthContext.Provider value={value}>{children}</RemoteAuthContext.Provider>;
};

export const useRemoteAuth = () => {
  const context = useContext(RemoteAuthContext);
  if (!context) {
    throw new Error('useRemoteAuth must be used within a RemoteAuthProvider');
  }
  return context;
};
