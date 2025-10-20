import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateVideoDurations } from "@/hooks/useUpdateVideoDurations";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Página de teste para verificar e atualizar durações de vídeos
 * Esta página pode ser removida após a verificação estar funcionando
 */
export const TestVideoDurations = () => {
  const updateVideoDurationsMutation = useUpdateVideoDurations();

  // Verificar quantos vídeos não têm duração
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['video-duration-stats'],
    queryFn: async () => {
      const { data: videosWithoutDuration, error: errorWithout } = await supabase
        .from('learning_lesson_videos')
        .select('id')
        .or('duration_seconds.is.null,duration_seconds.eq.0');

      if (errorWithout) throw errorWithout;

      const { data: allVideos, error: errorAll } = await supabase
        .from('learning_lesson_videos')
        .select('id');

      if (errorAll) throw errorAll;

      const { data: videosWithDuration, error: errorWith } = await supabase
        .from('learning_lesson_videos')
        .select('id, duration_seconds')
        .not('duration_seconds', 'is', null)
        .gt('duration_seconds', 0);

      if (errorWith) throw errorWith;

      return {
        total: allVideos?.length || 0,
        withoutDuration: videosWithoutDuration?.length || 0,
        withDuration: videosWithDuration?.length || 0,
        sampleDurations: videosWithDuration?.slice(0, 5).map(v => ({
          id: v.id,
          duration: v.duration_seconds,
          formatted: `${Math.floor(v.duration_seconds / 60)}:${(v.duration_seconds % 60).toString().padStart(2, '0')}`
        })) || []
      };
    }
  });

  const handleUpdateDurations = async () => {
    try {
      await updateVideoDurationsMutation.mutateAsync();
      setTimeout(() => refetch(), 2000); // Refetch stats após atualização
    } catch (error) {
      console.error('Erro ao atualizar durações:', error);
    }
  };

  const handleTestEdgeFunction = async () => {
    try {
      toast.info('Testando edge function...');
      const { data, error } = await supabase.functions.invoke('update-video-durations', {
        body: { test: true }
      });

      if (error) {
        toast.error('Erro na edge function: ' + error.message);
      } else {
        toast.success('Edge function respondeu: ' + JSON.stringify(data));
      }
    } catch (error: any) {
      toast.error('Erro ao testar edge function: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Teste de Durações de Vídeos</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Estatísticas Atuais</CardTitle>
            <CardDescription>
              Status das durações de vídeos no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div>Carregando estatísticas...</div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-status-info">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total de vídeos</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-status-success">{stats.withDuration}</div>
                  <div className="text-sm text-muted-foreground">Com duração</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-status-error">{stats.withoutDuration}</div>
                  <div className="text-sm text-muted-foreground">Sem duração</div>
                </div>
              </div>
            ) : (
              <div>Erro ao carregar estatísticas</div>
            )}

            {stats?.sampleDurations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Exemplos de vídeos com duração:</h4>
                <div className="space-y-1 text-sm">
                  {stats.sampleDurations.map((video) => (
                    <div key={video.id} className="flex justify-between">
                      <span>Vídeo {video.id.slice(0, 8)}...</span>
                      <span className="font-mono">{video.formatted}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
            <CardDescription>
              Ferramentas para atualizar durações de vídeos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={handleUpdateDurations}
                disabled={updateVideoDurationsMutation.isPending}
                className="flex-1"
              >
                {updateVideoDurationsMutation.isPending ? 'Atualizando...' : 'Atualizar Todas as Durações'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleTestEdgeFunction}
                className="flex-1"
              >
                Testar Edge Function
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Recarregando...' : 'Atualizar Stats'}
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p><strong>Nota:</strong> A atualização de durações pode levar alguns minutos para processar todos os vídeos.</p>
              <p>Após a atualização, a página será recarregada automaticamente para mostrar os novos valores.</p>
            </div>

            {stats && stats.withoutDuration === 0 && (
              <div className="p-4 bg-status-success/10 border border-status-success/20 rounded-lg">
                <div className="text-status-success-dark font-medium">✅ Todas as durações estão atualizadas!</div>
                <div className="text-status-success text-sm">
                  Todos os {stats.total} vídeos já possuem durações calculadas.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};