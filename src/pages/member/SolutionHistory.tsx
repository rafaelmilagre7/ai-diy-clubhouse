import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAISolutionHistory } from '@/hooks/builder/useAISolutionHistory';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Trash2, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Layout
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SolutionHistory() {
  const navigate = useNavigate();
  const { solutions, isLoading, refetch } = useAISolutionHistory();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('ai_generated_solutions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Solução deletada com sucesso');
      refetch();
    } catch (error) {
      console.error('Erro ao deletar solução:', error);
      toast.error('Erro ao deletar solução');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Concluído',
          icon: CheckCircle2,
          variant: 'default' as const,
          color: 'text-success'
        };
      case 'in_progress':
        return {
          label: 'Em andamento',
          icon: Loader2,
          variant: 'secondary' as const,
          color: 'text-primary'
        };
      case 'pending':
      default:
        return {
          label: 'Pendente',
          icon: Clock,
          variant: 'outline' as const,
          color: 'text-muted-foreground'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Layout className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Histórico de Soluções Builder</h1>
        </div>
        <p className="text-muted-foreground">
          Todas as suas soluções geradas pela inteligência artificial
        </p>
      </div>

      {/* Empty State */}
      {solutions.length === 0 && (
        <LiquidGlassCard className="p-12 text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhuma solução encontrada</h3>
          <p className="text-muted-foreground mb-6">
            Você ainda não gerou nenhuma solução com o Builder
          </p>
          <Button onClick={() => navigate('/ferramentas/builder')}>
            <Layout className="h-4 w-4 mr-2" />
            Gerar Primeira Solução
          </Button>
        </LiquidGlassCard>
      )}

      {/* Solutions List */}
      <div className="space-y-4">
        {solutions.map((solution) => {
          const statusInfo = getStatusInfo(solution.implementation_status || 'pending');
          const StatusIcon = statusInfo.icon;

          return (
            <LiquidGlassCard key={solution.id} className="p-6 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Ideia Original */}
                  <h3 className="text-lg font-bold mb-2 line-clamp-2">
                    {solution.original_idea}
                  </h3>

                  {/* Short Description */}
                  {solution.short_description && (
                    <p className="text-sm text-foreground/70 mb-3 line-clamp-2">
                      {solution.short_description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(solution.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <Badge variant={statusInfo.variant} className="gap-1">
                      <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/ferramentas/builder/solution/${solution.id}`)}
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={deletingId === solution.id}
                        title="Deletar solução"
                      >
                        {deletingId === solution.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deletar solução?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. A solução será permanentemente removida do seu histórico.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(solution.id)}>
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </LiquidGlassCard>
          );
        })}
      </div>
    </div>
  );
}