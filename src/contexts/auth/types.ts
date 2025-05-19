
import { Session, User } from '@supabase/supabase-js';
import { createContext } from 'react';
import { UserProfile } from '@/lib/supabase/types';

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isFormacao: boolean;
  isLoading: boolean;
  authError: Error | null;
  signIn: (email?: string, password?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInAsMember: () => Promise<void>;
  signInAsAdmin: () => Promise<void>;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContextType = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  isFormacao: false,
  isLoading: true,
  authError: null,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  signInAsMember: async () => {},
  signInAsAdmin: async () => {},
  setSession: () => {},
  setUser: () => {},
  setProfile: () => {},
  setIsLoading: () => {},
});
