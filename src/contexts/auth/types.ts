
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email?: string, password?: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  signInAsMember: () => Promise<void>;
  signInAsAdmin: () => Promise<void>;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsLoading: (isLoading: boolean) => void;
};
