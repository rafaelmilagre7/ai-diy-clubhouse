
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isFormacao: boolean;
  isLoading: boolean;
  authError: Error | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  signOut: () => Promise<{ success: boolean; error?: any }>;
  signInAsMember: () => Promise<{ success: boolean; data?: any; error?: any }>;
  signInAsAdmin: () => Promise<{ success: boolean; data?: any; error?: any }>;
  signInAsTestMember: () => Promise<{ success: boolean; data?: any; error?: any }>;
  signInAsTestFormacao: () => Promise<{ success: boolean; data?: any; error?: any }>;
  signInAsClubTest: () => Promise<{ success: boolean; data?: any; error?: any }>;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
