
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';

export interface AuthContextType {
  // Estados principais
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  
  // Estados derivados
  isAdmin: boolean;
  isFormacao: boolean;
  
  // Métodos
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  setProfile: (profile: UserProfile | null) => void;
  refetchProfile?: () => Promise<void>; // ✅ NOVO: método para forçar re-fetch do profile
}
