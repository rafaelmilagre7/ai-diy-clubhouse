
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { RefreshCw, Loader2, FileText, AlertTriangle } from "lucide-react";

interface LogEntry {
  timestamp: string;
  event_message: string;
  level: string;
  function_id?: string;
}

const LogsSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'whatsapp'>('whatsapp');

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      console.log("📋 Carregando logs das Edge Functions...");

      // Query para buscar logs do WhatsApp
      const { data, error } = await supabase
        .from('edge_logs')
        .select('timestamp, event_message, level, function_id')
        .or('event_message.ilike.%whatsapp%,function_id.ilike.%whatsapp%')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error("Erro ao carregar logs:", error);
        toast.error("Erro ao carregar logs");
        return;
      }

      setLogs(data || []);
      console.log("Logs carregados:", data?.length);

    } catch (err: any) {
      console.error("Erro ao carregar logs:", err);
      toast.error("Erro ao carregar logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'error') return log.level === 'error';
    if (filter === 'whatsapp') return log.event_message.toLowerCase().includes('whatsapp');
    return true;
  });

  const getLevelBadge = (level: string) => {
    const variant = level === 'error' ? 'destructive' : 
                   level === 'warn' ? 'secondary' : 'default';
    return <Badge variant={variant}>{level.toUpperCase()}</Badge>;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const getErrorExplanation = (message: string) => {
    if (message.includes('Template name does not exist')) {
      return "❌ O template 'convite_acesso' não existe ou não está aprovado em pt_BR";
    }
    if (message.includes('132001')) {
      return "❌ Erro de template - verifique se está criado e aprovado no Meta Business";
    }
    if (message.includes('permission')) {
      return "❌ Problema de permissões - verifique as configurações do token";
    }
    if (message.includes('phone')) {
      return "📱 Problema com o número de telefone ou Phone Number ID";
    }
    return "";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Logs Recentes</h3>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={filter === 'whatsapp' ? 'default' : 'outline'}
              onClick={() => setFilter('whatsapp')}
            >
              WhatsApp
            </Button>
            <Button
              size="sm"
              variant={filter === 'error' ? 'default' : 'outline'}
              onClick={() => setFilter('error')}
            >
              Erros
            </Button>
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              Todos
            </Button>
          </div>
        </div>
        <Button 
          onClick={loadLogs} 
          disabled={isLoading}
          size="sm"
          className="flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Atualizar
        </Button>
      </div>

      <div className="space-y-3">
        {filteredLogs.map((log, index) => (
          <Card key={index} className={log.level === 'error' ? 'border-red-200 bg-red-50' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {formatTimestamp(log.timestamp)}
                  </span>
                </div>
                {getLevelBadge(log.level)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <pre className="text-xs bg-white p-2 rounded border overflow-auto whitespace-pre-wrap">
                  {log.event_message}
                </pre>
                {log.level === 'error' && getErrorExplanation(log.event_message) && (
                  <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      {getErrorExplanation(log.event_message)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredLogs.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                Nenhum log encontrado para o filtro selecionado
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base text-blue-800">Principais Erros WhatsApp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-blue-700">
            <p><strong>132001:</strong> Template não existe ou não aprovado</p>
            <p><strong>131026:</strong> Número de telefone inválido</p>
            <p><strong>131005:</strong> Phone Number ID incorreto</p>
            <p><strong>100:</strong> Token de acesso inválido ou expirado</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsSection;
