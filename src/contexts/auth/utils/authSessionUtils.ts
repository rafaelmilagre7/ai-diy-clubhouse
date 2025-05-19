
import { supabase } from "@/lib/supabase";
import { processUserProfile } from "@/hooks/auth/utils/authSessionUtils";

/**
 * Re-exportação das funções de processamento de sessão para serem usadas no contexto de autenticação
 */
export { processUserProfile };

/**
 * Funções adicionais específicas para o contexto de autenticação podem ser implementadas aqui
 */
