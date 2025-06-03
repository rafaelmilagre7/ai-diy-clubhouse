
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSuggestionDetails } from '@/hooks/suggestions/useSuggestionDetails';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';
import { useAuth } from '@/contexts/auth';
import { SuggestionDetailsHeader } from '@/components/suggestions/details/SuggestionDetailsHeader';
import { AdminSuggestionView } from '@/components/suggestions/admin/AdminSuggestionView';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const AdminSuggestionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { 
    suggestion, 
    isLoading, 
    error, 
    refetch 
  } = useSuggestionDetails();

  const { 
    loading: adminActionLoading, 
    removeSuggestion, 
    updateSuggestionStatus 
  } = useAdminSuggestions();

  const isAdmin = profile?.role === 'admin';

  const handleUpdateStatus = async (status: string) => {
    if (!suggestion) return;
    
    console.log('Admin atualizando status para:', status);
    const success = await updateSuggestionStatus(suggestion.id, status);
    if (success) {
      toast.success('Status atualizado com sucesso!');
      refetch();
    }
  };

  const handleDeleteSuggestion = async () => {
    if (!suggestion) return;
    
    const success = await removeSuggestion(suggestion.id);
    if (success) {
      toast.success('Sugestão removida com sucesso');
      navigate('/admin/suggestions');
    }
    setDeleteDialogOpen(false);
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando detalhes da sugestão..." />;
  }

  if (error || !suggestion) {
    return (
      <div className="pl-8 pr-6 py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar sugestão</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os detalhes da sugestão. Verifique se o ID está correto.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="pl-8 pr-6 py-6 space-y-6">
      <SuggestionDetailsHeader
        isAdmin={isAdmin}
        adminActionLoading={adminActionLoading}
        suggestionStatus={suggestion.status}
        suggestionTitle={suggestion.title}
        onUpdateStatus={handleUpdateStatus}
        onOpenDeleteDialog={() => setDeleteDialogOpen(true)}
      />

      <AdminSuggestionView suggestion={suggestion} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta sugestão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSuggestion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSuggestionDetails;
