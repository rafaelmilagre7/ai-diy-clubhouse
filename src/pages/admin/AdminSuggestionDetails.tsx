
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { useSuggestionDetails } from '@/hooks/suggestions/useSuggestionDetails';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';
import { SuggestionDetailsHeader } from '@/components/suggestions/details/SuggestionDetailsHeader';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';

const AdminSuggestionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useSimpleAuth();
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  
  const { suggestion, isLoading, handleVote, voteLoading } = useSuggestionDetails();
  const { updateSuggestionStatus, deleteSuggestion } = useAdminSuggestions();

  const handleUpdateStatus = async (status: string) => {
    if (!suggestion) return;
    
    setAdminActionLoading(true);
    try {
      await updateSuggestionStatus(suggestion.id, status);
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!suggestion) return;
    
    setAdminActionLoading(true);
    try {
      await deleteSuggestion(suggestion.id);
      navigate('/admin/suggestions');
    } finally {
      setAdminActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'in_review': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'implemented': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Nova';
      case 'in_review': return 'Em Análise';
      case 'approved': return 'Aprovada';
      case 'rejected': return 'Rejeitada';
      case 'implemented': return 'Implementada';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/suggestions')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
          </div>
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/suggestions')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Sugestão não encontrada</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sugestão não encontrada</h3>
            <p className="text-muted-foreground">
              A sugestão que você está procurando não foi encontrada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/admin/suggestions')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detalhes da Sugestão</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie esta sugestão da comunidade
          </p>
        </div>
      </div>

      <SuggestionDetailsHeader
        isAdmin={isAdmin}
        adminActionLoading={adminActionLoading}
        suggestionStatus={suggestion.status}
        onUpdateStatus={handleUpdateStatus}
        onOpenDeleteDialog={handleDelete}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{suggestion.title}</CardTitle>
              <CardDescription className="mt-2">
                Criada em {new Date(suggestion.created_at).toLocaleDateString('pt-BR')}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(suggestion.status)}>
              {getStatusText(suggestion.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-6">
            <p className="text-muted-foreground whitespace-pre-wrap">
              {suggestion.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVote('upvote')}
                  disabled={voteLoading}
                  className="flex items-center gap-1"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {suggestion.upvotes || 0}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVote('downvote')}
                  disabled={voteLoading}
                  className="flex items-center gap-1"
                >
                  <ThumbsDown className="h-4 w-4" />
                  {suggestion.downvotes || 0}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSuggestionDetails;
