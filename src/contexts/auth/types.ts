
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isFormacao: boolean;
  isLoading: boolean;
  authError: Error | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ success: boolean; error: any }>;
  signInAsMember: (email: string, password: string) => Promise<{ error: any }>;
  signInAsAdmin: (email: string, password: string) => Promise<{ error: any }>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
