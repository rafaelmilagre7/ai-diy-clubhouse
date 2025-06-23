
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role_id?: string;
  role?: {
    name: string;
    permissions: string[];
  };
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  name: string;
  inviteToken?: string;
}

export interface RegisterResult {
  user?: any;
  error?: any;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isFormacao: boolean;
  isLoading: boolean;
  authError: Error | null;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<void>;
  signInAsMember: () => Promise<{ user: User | null; error: any }>;
  signInAsAdmin: () => Promise<{ user: User | null; error: any }>;
  registerWithInvite: (params: RegisterParams) => Promise<RegisterResult>;
  setIsLoading: (loading: boolean) => void;
}
