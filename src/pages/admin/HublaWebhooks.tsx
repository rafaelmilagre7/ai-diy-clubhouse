import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Copy, ExternalLink, Webhook, AlertCircle, CheckCircle2, Clock, Filter } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HublaWebhook {
  id: string;
  event_type: string;
  payload: any;
  headers: any;
  received_at: string;
  processed: boolean;
  processing_notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function HublaWebhooks() {
  const [selectedWebhook, setSelectedWebhook] = useState<HublaWebhook | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");

  // Buscar webhooks da Hubla
  const { data: webhooks = [], isLoading, error, refetch } = useQuery({
    queryKey: ['hubla-webhooks', eventTypeFilter],
    queryFn: async () => {
      let query = supabase
        .from('hubla_webhooks')
        .select('*')
        .order('received_at', { ascending: false });

      if (eventTypeFilter !== "all") {
        query = query.eq('event_type', eventTypeFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as HublaWebhook[];
    }
  });

  // Buscar tipos de eventos únicos para o filtro
  const { data: eventTypes = [] } = useQuery({
    queryKey: ['hubla-webhook-event-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hubla_webhooks')
        .select('event_type')
        .order('event_type');
      
      if (error) throw error;
      
      const uniqueTypes = [...new Set(data?.map(item => item.event_type) || [])];
      return uniqueTypes;
    }
  });

  const copyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin.replace(/^https?:\/\//, 'https://zotzvtepvpnkcoobdubt.supabase.co')}/functions/v1/hubla-webhook`;
    navigator.clipboard.writeText(webhookUrl);
    toast.success("URL do webhook copiada para a área de transferência!");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para a área de transferência!`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (processed: boolean) => {
    if (processed) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Processado</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
  };

  const getEventTypeBadge = (eventType: string) => {
    const colors = {
      'payment.approved': 'bg-green-100 text-green-800',
      'payment.completed': 'bg-green-100 text-green-800',
      'payment.failed': 'bg-red-100 text-red-800',
      'payment.declined': 'bg-red-100 text-red-800',
      'subscription.created': 'bg-blue-100 text-blue-800',
      'subscription.cancelled': 'bg-orange-100 text-orange-800',
      'unknown': 'bg-gray-100 text-gray-800'
    };
    
    const colorClass = colors[eventType as keyof typeof colors] || colors.unknown;
    
    return <Badge className={colorClass}>{eventType}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Webhook className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Webhooks da Hubla</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Webhook className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Webhooks da Hubla</h1>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar webhooks</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Webhook className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Webhooks da Hubla</h1>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Atualizar
        </Button>
      </div>

      {/* URL do Webhook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            URL do Webhook
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm">
              https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/hubla-webhook
            </code>
            <Button onClick={copyWebhookUrl} size="sm" variant="outline">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Use esta URL para configurar os webhooks na Hubla. Todos os eventos serão capturados e armazenados para análise.
          </p>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtrar por tipo:</span>
        </div>
        <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {eventTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Webhooks */}
        <Card>
          <CardHeader>
            <CardTitle>Webhooks Recebidos ({webhooks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {webhooks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Webhook className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum webhook recebido ainda</p>
                  <p className="text-sm">Configure a URL acima na Hubla para começar a receber webhooks</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {webhooks.map((webhook) => (
                    <Card 
                      key={webhook.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedWebhook?.id === webhook.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedWebhook(webhook)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          {getEventTypeBadge(webhook.event_type)}
                          {getStatusBadge(webhook.processed)}
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">ID: {webhook.id.slice(0, 8)}...</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(webhook.received_at)}
                          </div>
                          {webhook.processing_notes && (
                            <div className="text-xs text-muted-foreground italic">
                              {webhook.processing_notes.slice(0, 50)}...
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detalhes do Webhook Selecionado */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Webhook</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedWebhook ? (
              <Tabs defaultValue="payload" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="payload">Payload</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="info">Informações</TabsTrigger>
                </TabsList>
                
                <TabsContent value="payload" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Dados do Webhook</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(JSON.stringify(selectedWebhook.payload, null, 2), "Payload")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <ScrollArea className="h-[400px]">
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                        {JSON.stringify(selectedWebhook.payload, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                </TabsContent>
                
                <TabsContent value="headers" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Headers HTTP</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(JSON.stringify(selectedWebhook.headers, null, 2), "Headers")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <ScrollArea className="h-[400px]">
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                        {JSON.stringify(selectedWebhook.headers, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                </TabsContent>
                
                <TabsContent value="info" className="space-y-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">ID</label>
                        <p className="text-sm">{selectedWebhook.id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tipo de Evento</label>
                        <p className="text-sm">{selectedWebhook.event_type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Recebido em</label>
                        <p className="text-sm">{formatDate(selectedWebhook.received_at)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <p className="text-sm">{selectedWebhook.processed ? 'Processado' : 'Pendente'}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Notas de Processamento</label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded">
                        {selectedWebhook.processing_notes || 'Nenhuma nota disponível'}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um webhook para ver os detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações sobre implementação */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Implementação dos Webhooks</AlertTitle>
        <AlertDescription>
          Os webhooks estão sendo capturados e armazenados automaticamente. Para implementar a lógica de processamento específica para cada tipo de evento, 
          edite a edge function <code>hubla-webhook</code>. Atualmente, os seguintes tipos de eventos são reconhecidos:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><code>payment.approved</code> / <code>payment.completed</code> - Pagamentos aprovados</li>
            <li><code>payment.failed</code> / <code>payment.declined</code> - Pagamentos falharam</li>
            <li><code>subscription.created</code> - Novas assinaturas</li>
            <li><code>subscription.cancelled</code> - Assinaturas canceladas</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}