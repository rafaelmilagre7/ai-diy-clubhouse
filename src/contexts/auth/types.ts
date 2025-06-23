
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  company_name?: string;
  industry?: string;
  role_id?: string;
  role?: {
    name: string;
    permissions: string[];
  };
  user_roles?: {
    id: string;
    name: string;
    description?: string;
  };
  onboarding_completed?: boolean;
  onboarding_completed_at?: string;
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
  signUp: (email: string, password: string, metadata?: any) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<{ success: boolean; error?: any }>;
  signInAsMember: () => Promise<{ user: User | null; error: any }>;
  signInAsAdmin: () => Promise<{ user: User | null; error: any }>;
  registerWithInvite: (params: RegisterParams) => Promise<RegisterResult>;
  setIsLoading: (loading: boolean) => void;
  setProfile: (profile: UserProfile | null) => void;
}
