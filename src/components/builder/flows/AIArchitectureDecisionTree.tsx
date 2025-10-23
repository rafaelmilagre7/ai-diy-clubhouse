import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, GitBranch, Zap, DollarSign } from 'lucide-react';

interface DecisionOption {
  label: string;
  next_node?: string;
  ai_model: string;
  reason: string;
}

interface DecisionNode {
  id: string;
  question: string;
  type: 'decision' | 'action' | 'end';
  options?: DecisionOption[];
  benchmark?: {
    latency: string;
    cost_per_1k: string;
  };
}

interface AIArchitectureDecisionTreeProps {
  data: {
    decision_nodes: DecisionNode[];
    estimated_monthly_cost: string;
  };
}

export const AIArchitectureDecisionTree = ({ data }: AIArchitectureDecisionTreeProps) => {
  const { decision_nodes, estimated_monthly_cost } = data;

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'decision':
        return <GitBranch className="h-5 w-5" />;
      case 'action':
        return <Brain className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'decision':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-600';
      case 'action':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-600';
      default:
        return 'bg-green-500/10 border-green-500/30 text-green-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">Arquitetura da Stack IA</h3>
          <p className="text-muted-foreground">
            Árvore de decisão para escolha de modelos de IA
          </p>
        </div>
        <Badge variant="outline" className="px-4 py-2 text-base">
          <DollarSign className="h-4 w-4 mr-2" />
          {estimated_monthly_cost}/mês
        </Badge>
      </div>

      {/* Árvore de decisão */}
      <div className="space-y-6">
        {decision_nodes.map((node, index) => (
          <Card 
            key={node.id}
            className={`relative ${getNodeColor(node.type)} border-2`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {getNodeIcon(node.type)}
                <span className="text-lg">{node.question}</span>
                <Badge variant="outline" className="ml-auto">
                  {node.type === 'decision' ? 'Decisão' : node.type === 'action' ? 'Ação' : 'Final'}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Benchmark (se disponível) */}
              {node.benchmark && (
                <div className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">
                      Latência: {node.benchmark.latency}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">
                      Custo: {node.benchmark.cost_per_1k}/1k
                    </span>
                  </div>
                </div>
              )}

              {/* Opções de decisão */}
              {node.options && node.options.length > 0 && (
                <div className="space-y-3">
                  {node.options.map((option, optIndex) => (
                    <div 
                      key={optIndex}
                      className="p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {optIndex + 1}
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">{option.label}</p>
                            <Badge variant="secondary">
                              {option.ai_model}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {option.reason}
                          </p>
                          {option.next_node && (
                            <p className="text-xs text-muted-foreground">
                              → Próximo: {option.next_node}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            {/* Linha conectora para próximo nó */}
            {index < decision_nodes.length - 1 && (
              <div className="flex justify-center py-2">
                <div className="h-8 w-0.5 bg-border" />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
