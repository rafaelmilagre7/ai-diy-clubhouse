import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Key, Webhook, Database, Globe, Cpu } from 'lucide-react';

interface IntegrationNode {
  id: string;
  label: string;
  type: 'orchestrator' | 'ai_service' | 'database' | 'api' | 'frontend';
  status: 'configured' | 'pending' | 'optional';
}

interface IntegrationEdge {
  source: string;
  target: string;
  connection_type: 'webhook' | 'rest_api' | 'websocket' | 'graphql';
  auth: 'bearer_token' | 'api_key' | 'oauth2' | 'basic_auth';
  endpoint: string;
  docs_url?: string;
}

interface APIIntegrationGraphProps {
  data: {
    nodes: IntegrationNode[];
    edges: IntegrationEdge[];
  };
}

export const APIIntegrationGraph = ({ data }: APIIntegrationGraphProps) => {
  const { nodes, edges } = data;

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'orchestrator':
        return <Cpu className="h-5 w-5" />;
      case 'ai_service':
        return <Cpu className="h-5 w-5" />;
      case 'database':
        return <Database className="h-5 w-5" />;
      case 'api':
        return <Globe className="h-5 w-5" />;
      case 'frontend':
        return <Globe className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'orchestrator':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-600';
      case 'ai_service':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-600';
      case 'database':
        return 'bg-green-500/10 border-green-500/30 text-green-600';
      case 'api':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-600';
      case 'frontend':
        return 'bg-pink-500/10 border-pink-500/30 text-pink-600';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'configured':
        return <Badge className="bg-green-600">✓ Configurado</Badge>;
      case 'pending':
        return <Badge variant="secondary">○ Pendente</Badge>;
      case 'optional':
        return <Badge variant="outline">⊘ Opcional</Badge>;
      default:
        return null;
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'webhook':
        return <Webhook className="h-4 w-4" />;
      case 'rest_api':
        return <Globe className="h-4 w-4" />;
      case 'websocket':
        return <Webhook className="h-4 w-4" />;
      case 'graphql':
        return <Database className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getAuthBadge = (auth: string) => {
    const authLabels: Record<string, string> = {
      bearer_token: 'Bearer Token',
      api_key: 'API Key',
      oauth2: 'OAuth 2.0',
      basic_auth: 'Basic Auth'
    };
    return authLabels[auth] || auth;
  };

  // Agrupar edges por source node
  const edgesBySource = edges.reduce((acc, edge) => {
    if (!acc[edge.source]) {
      acc[edge.source] = [];
    }
    acc[edge.source].push(edge);
    return acc;
  }, {} as Record<string, IntegrationEdge[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-2xl font-bold">Mapa de Integração API</h3>
        <p className="text-muted-foreground">
          Conexões e autenticações entre ferramentas
        </p>
      </div>

      {/* Nodes (ferramentas) */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h4 className="text-lg font-semibold">Ferramentas</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map((node) => (
              <Card 
                key={node.id}
                className={`${getNodeColor(node.type)} border-2`}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {getNodeIcon(node.type)}
                    <div className="flex-1">
                      <p className="font-semibold">{node.label}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {node.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(node.status)}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Connections */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Integrações</h4>
          
          {Object.entries(edgesBySource).map(([sourceId, sourceEdges]) => {
            const sourceNode = nodes.find((n) => n.id === sourceId);
            if (!sourceNode) return null;

            return (
              <Card key={sourceId} className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    {getNodeIcon(sourceNode.type)}
                    {sourceNode.label}
                    <Badge variant="outline" className="ml-auto">
                      {sourceEdges.length} {sourceEdges.length === 1 ? 'conexão' : 'conexões'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sourceEdges.map((edge, index) => {
                    const targetNode = nodes.find((n) => n.id === edge.target);
                    if (!targetNode) return null;

                    return (
                      <div 
                        key={index}
                        className="p-4 bg-muted/50 rounded-lg space-y-3 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="gap-1">
                            {getConnectionIcon(edge.connection_type)}
                            {edge.connection_type.toUpperCase().replace('_', ' ')}
                          </Badge>
                          <span className="text-sm font-medium">→</span>
                          <span className="font-semibold">{targetNode.label}</span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Autenticação:</span>
                            <Badge variant="outline">{getAuthBadge(edge.auth)}</Badge>
                          </div>

                          <div className="space-y-1">
                            <span className="text-muted-foreground">Endpoint:</span>
                            <code className="block px-3 py-2 bg-background rounded border border-border text-xs break-all">
                              {edge.endpoint}
                            </code>
                          </div>

                          {edge.docs_url && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              asChild
                              className="w-full"
                            >
                              <a 
                                href={edge.docs_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver documentação
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
