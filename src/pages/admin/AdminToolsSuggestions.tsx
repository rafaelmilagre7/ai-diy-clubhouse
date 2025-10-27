import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ToolSuggestion {
  id: string;
  suggested_name: string;
  category: string;
  reason: string;
  setup_complexity: string;
  occurrences: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  solution_ids: string[];
}

export default function AdminToolsSuggestions() {
  const queryClient = useQueryClient();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ToolSuggestion | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Buscar sugestões pendentes
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['tools-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools_suggestions')
        .select('*')
        .order('occurrences', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ToolSuggestion[];
    }
  });

  // Aprovar sugestão e adicionar ao catálogo
  const approveMutation = useMutation({
    mutationFn: async (suggestion: ToolSuggestion) => {
      // 1. Adicionar ferramenta ao catálogo tools
      const { data: newTool, error: insertError } = await supabase
        .from('tools')
        .insert({
          name: suggestion.suggested_name,
          category: suggestion.category || 'integration',
          setup_complexity: suggestion.setup_complexity || 'medium',
          logo_url: `https://via.placeholder.com/100?text=${encodeURIComponent(suggestion.suggested_name)}`,
          official_url: `https://www.google.com/search?q=${encodeURIComponent(suggestion.suggested_name)}`,
          description: suggestion.reason || `Ferramenta adicionada via sugestão da IA`,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Atualizar status da sugestão
      const { error: updateError } = await supabase
        .from('tools_suggestions')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', suggestion.id);

      if (updateError) throw updateError;

      return newTool;
    },
    onSuccess: () => {
      toast.success('Ferramenta aprovada e adicionada ao catálogo!');
      queryClient.invalidateQueries({ queryKey: ['tools-suggestions'] });
    },
    onError: (error) => {
      toast.error('Erro ao aprovar ferramenta', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Rejeitar sugestão
  const rejectMutation = useMutation({
    mutationFn: async ({ suggestion, reason }: { suggestion: ToolSuggestion; reason: string }) => {
      const { error } = await supabase
        .from('tools_suggestions')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejected_by: (await supabase.auth.getUser()).data.user?.id,
          rejection_reason: reason
        })
        .eq('id', suggestion.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Sugestão rejeitada');
      queryClient.invalidateQueries({ queryKey: ['tools-suggestions'] });
      setRejectDialogOpen(false);
      setRejectionReason('');
    },
    onError: (error) => {
      toast.error('Erro ao rejeitar sugestão', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  const handleApprove = (suggestion: ToolSuggestion) => {
    if (confirm(`Aprovar "${suggestion.suggested_name}" e adicionar ao catálogo?`)) {
      approveMutation.mutate(suggestion);
    }
  };

  const handleReject = (suggestion: ToolSuggestion) => {
    setSelectedSuggestion(suggestion);
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (!selectedSuggestion) return;
    if (!rejectionReason.trim()) {
      toast.error('Por favor, informe o motivo da rejeição');
      return;
    }
    rejectMutation.mutate({ suggestion: selectedSuggestion, reason: rejectionReason });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pendente</Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" /> Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejeitado</Badge>;
      default:
        return null;
    }
  };

  const pendingSuggestions = suggestions?.filter(s => s.status === 'pending') || [];
  const approvedSuggestions = suggestions?.filter(s => s.status === 'approved') || [];
  const rejectedSuggestions = suggestions?.filter(s => s.status === 'rejected') || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sugestões de Ferramentas</h1>
          <p className="text-muted-foreground">
            Ferramentas sugeridas pela IA mas não encontradas no catálogo
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-sm">
            <AlertCircle className="h-3 w-3 mr-1" />
            {pendingSuggestions.length} pendentes
          </Badge>
          <Badge variant="default" className="text-sm bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            {approvedSuggestions.length} aprovadas
          </Badge>
        </div>
      </div>

      {/* Sugestões Pendentes */}
      {pendingSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Aguardando Revisão ({pendingSuggestions.length})
            </CardTitle>
            <CardDescription>
              Ferramentas mais sugeridas aparecem primeiro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{suggestion.suggested_name}</h3>
                    <Badge variant="outline" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {suggestion.occurrences}x sugerido
                    </Badge>
                    <Badge variant="secondary">{suggestion.category}</Badge>
                  </div>
                  {suggestion.reason && (
                    <p className="text-sm text-muted-foreground mb-2">{suggestion.reason}</p>
                  )}
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>Complexidade: {suggestion.setup_complexity}</span>
                    <span>•</span>
                    <span>{suggestion.solution_ids?.length || 0} soluções usam</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApprove(suggestion)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(suggestion)}
                    disabled={rejectMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Histórico de Aprovadas e Rejeitadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aprovadas */}
        {approvedSuggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Aprovadas ({approvedSuggestions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {approvedSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="p-3 border rounded text-sm">
                  <div className="font-medium">{suggestion.suggested_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {suggestion.occurrences}x sugerido • {suggestion.category}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Rejeitadas */}
        {rejectedSuggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Rejeitadas ({rejectedSuggestions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rejectedSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="p-3 border rounded text-sm">
                  <div className="font-medium">{suggestion.suggested_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {suggestion.occurrences}x sugerido
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de Rejeição */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Sugestão</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo da rejeição de "{selectedSuggestion?.suggested_name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo da Rejeição</Label>
              <Textarea
                id="reason"
                placeholder="Ex: Ferramenta descontinuada, nome incorreto, duplicada, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={rejectMutation.isPending}>
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
