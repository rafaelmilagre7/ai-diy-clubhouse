
import { Session, User } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/supabase/types';

// Definindo o tipo para o contexto de autenticação
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

// Se necessário, adicione aqui outras interfaces relacionadas à autenticação
