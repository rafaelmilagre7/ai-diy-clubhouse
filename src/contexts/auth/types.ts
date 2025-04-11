
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
