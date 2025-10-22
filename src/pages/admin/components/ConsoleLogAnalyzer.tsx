import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Search, Trash2, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";

interface LogStats {
  total: number;
  critical: number;
  migrate: number;
  keep: number;
  byCategory: Record<string, number>;
}

interface Recommendation {
  action: string;
  count: number;
  reason: string;
  files?: string[];
  automated?: boolean;
}

export const ConsoleLogAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const analyzeConsoleLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-console-logs', {
        body: {}
      });

      if (error) throw error;

      setStats(data.stats);
      setRecommendations(data.recommendations);

      toast.success("Análise concluída", {
        description: `${data.stats.critical} logs críticos encontrados`
      });
    } catch (error: any) {
      console.error('Erro na análise:', error);
      toast.error("Erro na análise", {
        description: error.message || "Não foi possível analisar os logs"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string): "default" | "destructive" | "secondary" => {
    if (category.includes('crítico')) return 'destructive';
    if (category.includes('desenvolvimento')) return 'default';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Análise de Console.log
          </CardTitle>
          <CardDescription>
            Análise automatizada de todos os console.log no projeto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={analyzeConsoleLogs}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando projeto...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Iniciar Análise
              </>
            )}
          </Button>

          {stats && (
            <>
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center p-4 border rounded-lg border-destructive">
                  <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
                  <div className="text-sm text-muted-foreground">Críticos</div>
                </div>
                <div className="text-center p-4 border rounded-lg border-warning">
                  <div className="text-2xl font-bold text-warning">{stats.migrate}</div>
                  <div className="text-sm text-muted-foreground">Migrar</div>
                </div>
                <div className="text-center p-4 border rounded-lg border-success">
                  <div className="text-2xl font-bold text-success">{stats.keep}</div>
                  <div className="text-sm text-muted-foreground">Manter</div>
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <h4 className="font-semibold">Categorias</h4>
                {Object.entries(stats.byCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm">{category}</span>
                    <Badge variant={getCategoryColor(category)}>
                      {count} logs
                    </Badge>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{rec.action}</h4>
                      <Badge>{rec.count} logs</Badge>
                      {rec.automated && (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Automático
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                  </div>
                  <Button size="sm" variant={rec.action.includes('REMOVER') ? 'destructive' : 'default'}>
                    {rec.action.includes('REMOVER') ? (
                      <>
                        <Trash2 className="mr-2 h-3 w-3" />
                        Remover
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-3 w-3" />
                        Migrar
                      </>
                    )}
                  </Button>
                </div>

                {rec.files && rec.files.length > 0 && (
                  <div className="space-y-1 mt-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Arquivos principais:
                    </p>
                    <div className="space-y-1">
                      {rec.files.slice(0, 3).map((file) => (
                        <div key={file} className="text-xs font-mono bg-muted p-2 rounded">
                          {file}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};