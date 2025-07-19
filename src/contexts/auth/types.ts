
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
  refetchProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}
