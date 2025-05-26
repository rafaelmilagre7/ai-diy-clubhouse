
import { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isFormacao: boolean;
  signOut: () => Promise<void>;
  setProfile: (profile: Profile | null) => void;
  setIsLoading: (loading: boolean) => void;
}
