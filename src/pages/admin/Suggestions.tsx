
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { useSuggestions } from '@/hooks/suggestions/useSuggestions';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';
import { getStatusLabel, getStatusColor } from '@/utils/suggestionUtils';
import { MoreVertical, Trash2, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AdminSuggestionsPage = () => {
  const { suggestions, refetch } = useSuggestions();
  const { removeSuggestion, updateSuggestionStatus, loading } = useAdminSuggestions();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const handleRemoveSuggestion = async () => {
    if (selectedSuggestion) {
      const success = await removeSuggestion(selectedSuggestion);
      if (success) {
        refetch();
        setDeleteDialogOpen(false);
      }
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (selectedSuggestion) {
      const success = await updateSuggestionStatus(selectedSuggestion, status);
      if (success) {
        refetch();
      }
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Sugestões</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Votos</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suggestions.map((suggestion) => (
            <TableRow key={suggestion.id}>
              <TableCell>{suggestion.title}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(suggestion.status)}>
                  {getStatusLabel(suggestion.status)}
                </Badge>
              </TableCell>
              <TableCell>
                {suggestion.upvotes - suggestion.downvotes}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedSuggestion(suggestion.id);
                        handleUpdateStatus('in_development');
                      }}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Marcar como Em Desenvolvimento
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedSuggestion(suggestion.id);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover Sugestão
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Sugestão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta sugestão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveSuggestion} className="bg-destructive text-destructive-foreground">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSuggestionsPage;
