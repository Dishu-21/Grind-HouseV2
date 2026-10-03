export type NavView =
  | 'dashboard'
  | 'planner'
  | 'studyclock'
  | 'reports'
  | 'mockscores'
  | 'support'
  | 'leaderboard'
  | Subject;

export interface ProfileRecord {
  id: string;
  username: string;
  total_study_minutes: number;
  today_study_minutes: number;
  syllabus_completion_percent: number;
  last_seen: string | null;
  updated_at: string | null;
  created_at: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  total_study_minutes: number;
  today_study_minutes: number;
  syllabus_completion_percent: number;
  last_seen: string | null;
  isCurrentUser: boolean;
}
