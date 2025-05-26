
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTopicDetails } from '@/hooks/community/useTopicDetails';
import { TopicDetailView } from '@/components/community/TopicDetailView';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TopicDetailPage = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  
  const { data: topic, isLoading, error } = useTopicDetails(topicId!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-lg">Carregando tópico...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <Alert variant="destructive">
            <AlertDescription>
              Erro ao carregar o tópico. Tente novamente mais tarde.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate('/comunidade')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a comunidade
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="container max-w-4xl mx-auto py-4 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/comunidade')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a comunidade
          </Button>
        </div>
      </div>
      
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <TopicDetailView topic={topic} />
      </div>
    </div>
  );
};

export default TopicDetailPage;
