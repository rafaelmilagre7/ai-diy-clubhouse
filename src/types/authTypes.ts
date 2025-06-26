
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isFormacao: boolean;
  onboardingRequired: boolean;
  hasInviteToken: boolean;
  inviteDetails: any | null;
}

export interface AuthManagerEvents {
  stateChanged: (state: AuthState) => void;
  error: (error: Error) => void;
  timeout: () => void;
  // Index signature para compatibilidade com BrowserEventEmitter
  [event: string]: (...args: any[]) => void;
}

export type AuthEventType = keyof AuthManagerEvents;
export type AuthEventHandler<T extends AuthEventType> = AuthManagerEvents[T];
