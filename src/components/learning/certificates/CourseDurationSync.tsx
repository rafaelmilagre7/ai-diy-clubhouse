import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Timer, RefreshCw, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const CourseDurationSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  const handleSyncAll = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      toast.info("🔄 Iniciando sincronização de durações dos cursos...");
      
      const { data, error } = await supabase.functions.invoke('calculate-course-durations', {
        body: { syncAll: true }
      });

      if (error) {
        throw error;
      }

      // Invalidar caches relacionados
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['course-durations'] }),
        queryClient.invalidateQueries({ queryKey: ['unified-certificates'] }),
        queryClient.invalidateQueries({ queryKey: ['course-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['learning-courses'] })
      ]);

      toast.success(
        `✅ Sincronização concluída! ${data.successCount} cursos atualizados`,
        {
          description: data.failedCount > 0 
            ? `${data.failedCount} cursos falharam - verifique os logs`
            : "Todas as durações foram atualizadas com sucesso"
        }
      );
      
    } catch (error: any) {
      console.error('❌ Erro na sincronização:', error);
      toast.error("Erro na sincronização", {
        description: error.message || "Não foi possível sincronizar as durações"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSyncAll}
      disabled={isSyncing}
      variant="outline"
      className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-300 font-medium shadow-sm hover:shadow-md group"
      title="Sincronizar durações de todos os cursos para certificados mais precisos"
    >
      {isSyncing ? (
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Timer className="h-4 w-4 mr-2 group-hover:animate-pulse" />
      )}
      {isSyncing ? "Sincronizando..." : "⏱️ Sincronizar Durações"}
    </Button>
  );
};