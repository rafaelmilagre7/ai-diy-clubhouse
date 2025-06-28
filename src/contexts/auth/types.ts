
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/userProfile';

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isFormacao: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: Error }>;
  signOut: () => Promise<{ success: boolean; error?: Error | null }>;
  signInAsMember: (email: string, password: string) => Promise<{ error?: Error }>;
  signInAsAdmin: (email: string, password: string) => Promise<{ error?: Error }>;
  refreshProfile: () => Promise<void>;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isSigningIn: boolean;
}
