
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';

export interface SignUpOptions {
  name?: string;
  invite_token?: string;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isFormacao: boolean;
  isLoading: boolean;
  authError: Error | null;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signUp: (email: string, password: string, options?: SignUpOptions) => Promise<{ error?: Error }>;
  signOut: () => Promise<{ success: boolean; error?: Error | null }>;
  signInAsMember: (email: string, password: string) => Promise<{ error?: Error }>;
  signInAsAdmin: (email: string, password: string) => Promise<{ error?: Error }>;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
