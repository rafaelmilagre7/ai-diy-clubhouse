
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  FileText,
  TrendingUp,
  Settings,
  Lock
} from 'lucide-react';
import { useInviteAudit } from '@/hooks/admin/invites/useInviteAudit';
import { toast } from 'sonner';

export const InviteAuditDashboard = () => {
  const { runAudit, isAuditing, auditReport } = useInviteAudit();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleRunAudit = async () => {
    try {
      await runAudit();
      toast.success('Auditoria concluída com sucesso!');
    } catch (error: any) {
      toast.error(`Erro na auditoria: ${error.message}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Passou</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Falhou</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Atenção</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Integridade de Dados':
        return <FileText className="h-5 w-5" />;
      case 'Performance':
        return <TrendingUp className="h-5 w-5" />;
      case 'Validações':
        return <Settings className="h-5 w-5" />;
      case 'Integrações':
        return <Shield className="h-5 w-5" />;
      case 'Segurança':
        return <Lock className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const categories = auditReport?.results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, typeof auditReport.results>) || {};

  const filteredResults = selectedCategory 
    ? auditReport?.results.filter(r => r.category === selectedCategory) || []
    : auditReport?.results || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Auditoria do Sistema de Convites
          </h2>
          <p className="text-muted-foreground mt-1">
            Verificação completa de integridade, performance e segurança
          </p>
        </div>
        
        <Button 
          onClick={handleRunAudit} 
          disabled={isAuditing}
          className="flex items-center gap-2"
        >
          <Play className={`h-4 w-4 ${isAuditing ? 'animate-spin' : ''}`} />
          {isAuditing ? 'Executando Auditoria...' : 'Executar Auditoria'}
        </Button>
      </div>

      {auditReport && (
        <>
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total de Testes</p>
                    <p className="text-2xl font-bold">{auditReport.summary.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-gray-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Passaram</p>
                    <p className="text-2xl font-bold text-green-600">{auditReport.summary.passed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Atenções</p>
                    <p className="text-2xl font-bold text-yellow-600">{auditReport.summary.warnings}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Falharam</p>
                    <p className="text-2xl font-bold text-red-600">{auditReport.summary.failed}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Filtrar por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  Todas as Categorias
                </Button>
                {Object.keys(categories).map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="flex items-center gap-2"
                  >
                    {getCategoryIcon(category)}
                    {category} ({categories[category].length})
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resultados Detalhados */}
          <Card>
            <CardHeader>
              <CardTitle>
                Resultados da Auditoria
                {selectedCategory && ` - ${selectedCategory}`}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Executado em: {new Date(auditReport.timestamp).toLocaleString('pt-BR')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredResults.map((result, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getStatusIcon(result.status)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{result.test}</h4>
                          {getStatusBadge(result.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{result.message}</p>
                        <p className="text-xs text-muted-foreground">{result.category}</p>
                        
                        {result.details && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <strong>Detalhes:</strong>
                            <pre className="mt-1 whitespace-pre-wrap">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum resultado encontrado para os filtros selecionados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!auditReport && !isAuditing && (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma Auditoria Executada</h3>
            <p className="text-muted-foreground mb-4">
              Execute uma auditoria completa para verificar a integridade do sistema de convites.
            </p>
            <Button onClick={handleRunAudit} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Executar Primeira Auditoria
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
