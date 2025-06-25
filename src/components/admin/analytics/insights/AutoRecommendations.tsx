
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Target, 
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAutoRecommendations } from '@/hooks/analytics/insights/useAutoRecommendations';
import LoadingScreen from '@/components/common/LoadingScreen';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AutoRecommendationsProps {
  timeRange: string;
}

export const AutoRecommendations: React.FC<AutoRecommendationsProps> = ({
  timeRange
}) => {
  const {
    data: recommendations,
    isLoading: loading,
    error
  } = useAutoRecommendations(timeRange);

  const handleImplementRecommendation = (id: string) => {
    console.log(`Implementando recomendação: ${id}`);
    // Aqui implementaria a lógica real
  };

  const handleDismissRecommendation = (id: string) => {
    console.log(`Ignorando recomendação: ${id}`);
    // Aqui implementaria a lógica real de dismissal
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'engagement':
        return <Users className="h-5 w-5 text-green-600" />;
      case 'user_experience':
        return <Target className="h-5 w-5 text-purple-600" />;
      case 'content':
        return <CheckCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 8) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
          ALTA
        </Badge>
      );
    } else if (priority >= 5) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
          MÉDIA
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
          BAIXA
        </Badge>
      );
    }
  };

  if (loading) {
    return <LoadingScreen variant="modern" type="stats" fullScreen={false} />;
  }

  if (error) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            Erro ao Carregar Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{typeof error === 'string' ? error : 'Erro ao carregar recomendações'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          Recomendações Automáticas
        </CardTitle>
        <p className="text-sm text-gray-600">
          Insights personalizados para otimizar sua plataforma ({timeRange})
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations && recommendations.length > 0 ? (
          recommendations.map(rec => (
            <div key={rec.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getTypeIcon(rec.type)}
                  <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                </div>
                {getPriorityBadge(rec.priority)}
              </div>
              
              <p className="mb-3 text-gray-600">{rec.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    Gerado automaticamente
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleImplementRecommendation(rec.id)}
                  >
                    Implementar <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDismissRecommendation(rec.id)}
                  >
                    Ignorar
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma recomendação disponível no momento</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
