import { useEffect, useState } from 'react';
import { useRemoteAuth } from '../../../core/context/RemoteAuthContext';
import { supabase } from '../../../shared/lib/supabase';
import { ProfileRecord } from '../../../shared/types';

type LeaderboardMode = 'all-time' | 'today';

export function LeaderboardPage() {
  const { user } = useRemoteAuth();
  const [mode, setMode] = useState<LeaderboardMode>('all-time');
  const [entries, setEntries] = useState<ProfileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const field = mode === 'today' ? 'today_study_minutes' : 'total_study_minutes';

        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .order(field, { ascending: false })
          .limit(100);

        if (fetchError) throw fetchError;

        if (!cancelled) {
          setEntries(data ?? []);
        }
      } catch (err: any) {
        console.error('Failed to load leaderboard:', err);
        if (!cancelled) {
          setError(err.message || 'Failed to load leaderboard.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchLeaderboard();
    return () => {
      cancelled = true;
    };
  }, [user, mode]);

  if (!user) {
    return (
      <div className="card" style={{ maxWidth: 700, margin: '32px auto', padding: '24px' }}>
        <h2>Leaderboard</h2>
        <p>Sign in to view the public leaderboard.</p>
        <button
          className="primary-btn"
          onClick={() => window.location.reload()}
          style={{ marginTop: 12 }}
        >
          Sign in
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ maxWidth: 700, margin: '32px auto', padding: '24px' }}>
        <h2>Leaderboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 900, margin: '32px auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2>Leaderboard</h2>

        <div className="seg" role="tablist" aria-label="Leaderboard mode">
          <button
            type="button"
            className={mode === 'all-time' ? 'on' : ''}
            onClick={() => setMode('all-time')}
          >
            All Time
          </button>
          <button
            type="button"
            className={mode === 'today' ? 'on' : ''}
            onClick={() => setMode('today')}
          >
            Today
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '20px 0', color: 'var(--m)' }}>Loading...</div>
      ) : entries.length === 0 ? (
        <div style={{ padding: '24px 0', color: 'var(--m)' }}>
          No one has studied yet. Be the first!
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {entries.map((entry, index) => {
            const isCurrentUser = entry.id === user.id;
            const value = mode === 'today' ? entry.today_study_minutes : entry.total_study_minutes;
            const hours = (value / 60).toFixed(1);

            return (
              <div
                key={entry.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr 140px 160px',
                  gap: 12,
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: isCurrentUser ? '2px solid var(--a)' : '1px solid var(--b)',
                  background: isCurrentUser ? 'rgba(14, 165, 233, 0.12)' : 'var(--c2)',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--a)' }}>#{index + 1}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{entry.username}</div>
                  <div style={{ fontSize: 12, color: 'var(--m)' }}>
                    {entry.last_seen ? new Date(entry.last_seen).toLocaleString() : 'Last seen just now'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 700 }}>
                  {hours} hrs
                </div>
                <div style={{ textAlign: 'right', color: 'var(--m)' }}>
                  {entry.last_seen ? 'Last seen' : 'Never'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
