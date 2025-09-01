import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";

/**
 * Hook específico para debug de admin - busca aulas com privilégios elevados
 * Usado apenas para diagnóstico quando o hook principal falha
 */
export const useAdminLessonDebug = (moduleId: string) => {
  const { isAdmin, user } = useAuth();
  
  return useQuery({
    queryKey: ["admin-lesson-debug", moduleId],
    queryFn: async () => {
      if (!isAdmin || !moduleId) {
        return { error: "Apenas admins podem usar este hook de debug" };
      }

      console.log(`[ADMIN_DEBUG] 🔧 Iniciando debug de admin para módulo ${moduleId}`);
      
      try {
        // 1. Testar conexão básica
        const { data: connectionTest } = await supabase
          .from("learning_lessons")
          .select("count")
          .limit(1);
          
        console.log(`[ADMIN_DEBUG] ✅ Conexão com Supabase OK`);

        // 2. Testar sessão de usuário
        const { data: session } = await supabase.auth.getSession();
        console.log(`[ADMIN_DEBUG] 👤 Sessão:`, {
          hasSession: !!session?.session,
          userId: session?.session?.user?.id?.substring(0, 8) + '***',
          role: session?.session?.user?.user_metadata?.role
        });

        // 3. Testar RLS bypass (só admin)
        const { data: rpcTest, error: rpcError } = await supabase
          .rpc('get_user_role_secure', { target_user_id: user!.id });
        
        console.log(`[ADMIN_DEBUG] 🔐 RPC Test:`, {
          hasRpcError: !!rpcError,
          userRole: rpcTest
        });

        // 4. Query direta das aulas
        const { data: rawLessons, error: rawError } = await supabase
          .from("learning_lessons")
          .select("*")
          .eq("module_id", moduleId);

        console.log(`[ADMIN_DEBUG] 📊 Query direta:`, {
          hasError: !!rawError,
          lessonsFound: rawLessons?.length || 0,
          errorDetails: rawError
        });

        // 5. Verificar módulo existe
        const { data: moduleExists } = await supabase
          .from("learning_modules")
          .select("id, title, course_id")
          .eq("id", moduleId)
          .single();

        console.log(`[ADMIN_DEBUG] 📁 Módulo:`, {
          exists: !!moduleExists,
          title: moduleExists?.title,
          courseId: moduleExists?.course_id
        });

        return {
          moduleId,
          connectionOK: true,
          sessionValid: !!session?.session,
          userRole: rpcTest,
          rawLessonsCount: rawLessons?.length || 0,
          moduleExists: !!moduleExists,
          rawError: rawError?.message,
          timestamp: new Date().toISOString()
        };

      } catch (err) {
        console.error(`[ADMIN_DEBUG] ❌ Erro no debug:`, err);
        return {
          error: err instanceof Error ? err.message : String(err),
          moduleId,
          timestamp: new Date().toISOString()
        };
      }
    },
    enabled: isAdmin && !!moduleId,
    staleTime: 0,
    refetchOnWindowFocus: false
  });
};