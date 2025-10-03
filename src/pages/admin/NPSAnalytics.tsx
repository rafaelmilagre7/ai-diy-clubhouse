import React, { useState } from 'react';
import { useLMSAnalytics } from '@/hooks/analytics/lms/useLMSAnalytics';
import { useNPSEvolution } from '@/hooks/analytics/lms/useNPSEvolution';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, TrendingUp, Users, Star, MessageSquare, Filter, Download, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ActionPlanAssistant } from '@/components/admin/nps/ActionPlanAssistant';
import { NPSEvolutionOverview } from '@/components/admin/analytics/lms/NPSEvolutionOverview';
import { NPSEvolutionChart } from '@/components/admin/analytics/lms/NPSEvolutionChart';
import { NPSByCourseChart } from '@/components/admin/analytics/lms/NPSByCourseChart';
import { NPSEvolutionByCourseChart } from '@/components/admin/analytics/lms/NPSEvolutionByCourseChart';

interface NPSResponse {
  id: string;
  lesson_id: string;
  user_id: string;
  score: number;
  feedback: string | null;
  created_at: string;
  updated_at: string;
  lesson?: {
    title: string;
    module?: {
      title: string;
      course?: {
        title: string;
      };
    };
  };
  user?: {
    name: string;
    email: string;
  };
}

interface NPSAnalytics {
  total_responses: number;
  average_score: number;
  nps_score: number;
  promoters: number;
  passives: number;
  detractors: number;
  response_rate: number;
  recent_responses: NPSResponse[];
}

const NPSAnalytics: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('all');

  // Calcular range de datas de forma estável
  const dateRange = React.useMemo(() => {
    const now = new Date();
    if (timeRange === 'all') {
      return { from: new Date(2020, 0, 1), to: now };
    }
    const daysAgo = parseInt(timeRange);
    return { from: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000), to: now };
  }, [timeRange]);

  // Usar o hook otimizado
  const { data: analyticsData, isLoading: analyticsLoading, error, isError } = useLMSAnalytics(dateRange);
  
  // Hook para dados de evolução
  const { data: evolutionData, isLoading: evolutionLoading } = useNPSEvolution({ dateRange });

  // Log de depuração
  console.log('NPSAnalytics - Estado:', { analyticsLoading, isError, error, analyticsData });

  if (error) {
    console.error('Erro no NPSAnalytics:', error);
  }

  // Mapear dados para interface anterior (compatibilidade)
  const analytics = analyticsData ? {
    total_responses: analyticsData.feedbackData.length,
    average_score: analyticsData.feedbackData.length > 0 
      ? analyticsData.feedbackData.reduce((sum, r) => sum + r.score, 0) / analyticsData.feedbackData.length 
      : 0,
    nps_score: analyticsData.npsData.overall,
    promoters: Math.round((analyticsData.npsData.distribution.promoters / 100) * analyticsData.feedbackData.length),
    passives: Math.round((analyticsData.npsData.distribution.neutrals / 100) * analyticsData.feedbackData.length),
    detractors: Math.round((analyticsData.npsData.distribution.detractors / 100) * analyticsData.feedbackData.length),
    response_rate: 85,
    recent_responses: analyticsData.feedbackData.map(f => ({
      id: f.id,
      lesson_id: f.lessonId,
      user_id: '',
      score: f.score,
      feedback: f.feedback,
      created_at: f.createdAt,
      updated_at: f.createdAt,
      lesson: { title: f.lessonTitle },
      user: { name: f.userName, email: f.userEmail }
    }))
  } : null;

  // Usar dados já carregados pelo hook otimizado
  const allResponses = analytics?.recent_responses || [];
  const responsesLoading = false;

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Promotor';
    if (score >= 7) return 'Neutro';
    return 'Detrator';
  };

  const getNPSColor = (npsScore: number) => {
    if (npsScore >= 50) return 'text-green-600';
    if (npsScore >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportData = () => {
    if (!allResponses) return;
    
    const csvData = allResponses.map(response => {
      // Buscar dados completos do feedbackData
      const feedbackItem = analyticsData?.feedbackData.find(f => f.id === response.id);
      
      return {
        'ID': response.id,
        'Data': format(new Date(response.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        'Nota': response.score,
        'Tipo': getScoreLabel(response.score),
        'Usuário': response.user?.name || 'N/A',
        'Email': response.user?.email || 'N/A',
        'Curso': feedbackItem?.courseTitle || 'N/A',
        'Módulo': feedbackItem?.moduleTitle || 'N/A',
        'Aula': response.lesson?.title || 'N/A',
        'Feedback': response.feedback || 'Sem feedback'
      };
    });

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nps-avaliacoes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const filteredResponses = allResponses?.filter(response => {
    const feedbackItem = analyticsData?.feedbackData.find(f => f.id === response.id);
    
    const matchesSearch = !searchTerm || 
      response.lesson?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedbackItem?.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedbackItem?.moduleTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    
    return matchesSearch;
  });

  if (analyticsLoading || responsesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics de NPS</h1>
          <p className="text-muted-foreground">Análise das avaliações de satisfação das aulas</p>
        </div>
        <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Dados
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="all">Todos os tempos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Avaliação</label>
              <Select value={filterScore} onValueChange={setFilterScore}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="promoters">Promotores (9-10)</SelectItem>
                  <SelectItem value="passives">Neutros (7-8)</SelectItem>
                  <SelectItem value="detractors">Detratores (0-6)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Usuário, aula, curso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getNPSColor(analytics?.nps_score || 0)}`}>
              {analytics?.nps_score?.toFixed(1) || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {(analytics?.nps_score || 0) >= 50 ? 'Excelente' : 
               (analytics?.nps_score || 0) >= 0 ? 'Bom' : 'Precisa melhorar'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {analytics?.average_score?.toFixed(1) || '0'}/10
            </div>
            <p className="text-xs text-muted-foreground">
              De {analytics?.total_responses || 0} avaliações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {analytics?.total_responses || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Taxa de resposta: {analytics?.response_rate || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distribuição</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-green-600">Promotores:</span>
                <span className="font-medium">{analytics?.promoters || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-yellow-600">Neutros:</span>
                <span className="font-medium">{analytics?.passives || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-red-600">Detratores:</span>
                <span className="font-medium">{analytics?.detractors || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes visualizações */}
      <Tabs defaultValue="recent" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recent">Avaliações Recentes</TabsTrigger>
          <TabsTrigger value="feedback">Feedbacks</TabsTrigger>
          <TabsTrigger value="evolution">Evolução</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="action-plan">Plano de Ação</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Avaliações Recentes</CardTitle>
              <CardDescription>
                {filteredResponses?.length || 0} avaliações encontradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredResponses?.slice(0, 20).map((response) => {
                  const feedbackItem = analyticsData?.feedbackData.find(f => f.id === response.id);
                  
                  return (
                    <div key={response.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={getScoreColor(response.score)}>
                            {response.score}/10 - {getScoreLabel(response.score)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(response.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Usuário:</strong> {response.user?.name || 'N/A'}
                          <br />
                          <span className="text-muted-foreground">{response.user?.email}</span>
                        </div>
                        <div>
                          <strong>Curso:</strong> {feedbackItem?.courseTitle || 'N/A'}
                          <br />
                          <strong>Módulo:</strong> {feedbackItem?.moduleTitle || 'N/A'}
                          <br />
                          <strong>Aula:</strong> {response.lesson?.title || 'N/A'}
                        </div>
                      </div>

                      {response.feedback && (
                        <div className="bg-muted p-3 rounded-md">
                          <strong className="text-sm">Feedback:</strong>
                          <p className="text-sm mt-1">{response.feedback}</p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {(!filteredResponses || filteredResponses.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma avaliação encontrada para os filtros aplicados.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedbacks Detalhados</CardTitle>
              <CardDescription>
                Comentários e sugestões dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredResponses?.filter(r => r.feedback?.trim()).map((response) => {
                  const feedbackItem = analyticsData?.feedbackData.find(f => f.id === response.id);
                  
                  return (
                    <div key={response.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getScoreColor(response.score)}>
                          {response.score}/10
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(response.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <strong>Curso:</strong> {feedbackItem?.courseTitle || 'N/A'}
                        <br />
                        <strong>Módulo:</strong> {feedbackItem?.moduleTitle || 'N/A'}
                        <br />
                        <strong>Aula:</strong> {response.lesson?.title || 'N/A'}
                        <br />
                        <strong>Usuário:</strong> {response.user?.name || 'N/A'}
                      </div>

                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm">{response.feedback}</p>
                      </div>
                    </div>
                  );
                })}

                {!filteredResponses?.some(r => r.feedback?.trim()) && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum feedback textual encontrado para os filtros aplicados.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolution" className="space-y-6">
          {/* Cards de Overview */}
          <NPSEvolutionOverview 
            currentData={evolutionData?.monthlyEvolution?.[evolutionData.monthlyEvolution.length - 1] || null}
            previousData={evolutionData?.monthlyEvolution?.[evolutionData.monthlyEvolution.length - 2] || null}
            isLoading={evolutionLoading}
          />

          {/* Gráfico de Evolução Mensal Geral */}
          <NPSEvolutionChart 
            data={evolutionData?.monthlyEvolution || []}
            isLoading={evolutionLoading}
          />

          {/* Gráficos empilhados verticalmente */}
          <div className="space-y-6">
            {/* NPS por Curso */}
            <NPSByCourseChart 
              data={evolutionData?.coursesNPS || []}
              isLoading={evolutionLoading}
            />

            {/* Evolução por Curso */}
            <NPSEvolutionByCourseChart 
              data={evolutionData?.courseEvolution || []}
              isLoading={evolutionLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="action-plan" className="space-y-4">
          <ActionPlanAssistant 
            npsData={analyticsData?.npsData || { overall: 0, distribution: { promoters: 0, neutrals: 0, detractors: 0 } }}
            feedbackData={analyticsData?.feedbackData || []}
            timeRange={timeRange}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Tendências</CardTitle>
              <CardDescription>
                Insights sobre a evolução das avaliações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Distribuição por Nota</h4>
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(score => {
                    const count = filteredResponses?.filter(r => r.score === score).length || 0;
                    const percentage = filteredResponses?.length ? (count / filteredResponses.length) * 100 : 0;
                    
                    return (
                      <div key={score} className="flex items-center gap-2">
                        <span className="w-8 text-sm font-medium">{score}</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-primary" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-12 text-sm text-muted-foreground">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Resumo Executivo</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Recomendação Principal:</strong> {' '}
                      {(analytics?.nps_score || 0) >= 50 
                        ? 'Manter o excelente trabalho! Os usuários estão muito satisfeitos.'
                        : (analytics?.nps_score || 0) >= 0 
                          ? 'Há oportunidades de melhoria para aumentar a satisfação.'
                          : 'Ação urgente necessária para melhorar a experiência dos usuários.'
                      }
                    </p>
                    
                    <p>
                      <strong>Pontos de Atenção:</strong> {' '}
                      {(analytics?.detractors || 0) > (analytics?.promoters || 0)
                        ? 'Número alto de detratores. Revisar conteúdo e metodologia.'
                        : 'Boa distribuição de promotores vs detratores.'
                      }
                    </p>

                    <p>
                      <strong>Próximos Passos:</strong> {' '}
                      Analisar feedbacks detalhados dos detratores para identificar padrões e oportunidades de melhoria.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NPSAnalytics;