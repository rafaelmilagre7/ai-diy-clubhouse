
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  signInAsMember: () => Promise<void>;
  signInAsAdmin: () => Promise<void>;
  // Added setState functions for the AuthSession component
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

// Test users configuration
export const TEST_MEMBER = {
  email: "membro@viverdeia.ai",
  password: "membro-teste-2024"
};

export const TEST_ADMIN = {
  email: "admin@viverdeia.ai",
  password: "admin-teste-2024"
};
