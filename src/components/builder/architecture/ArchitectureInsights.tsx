import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { 
  Database, 
  BrainCircuit, 
  Plug, 
  DollarSign, 
  Server, 
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface ArchitectureInsightsProps {
  insights: {
    needs_rag?: boolean;
    rag_strategy?: string;
    rag_cost_estimate?: string;
    needs_crm?: boolean;
    crm_integration?: string;
    external_apis?: Array<{
      name: string;
      purpose: string;
      cost: string;
    }>;
    data_storage?: {
      primary: string;
      reason: string;
      cost: string;
    };
    ai_models?: Array<{
      model: string;
      use_case: string;
      when_to_use: string;
      cost_per_1m_tokens: string;
      alternative?: string;
    }>;
    total_monthly_cost_estimate?: {
      min: string;
      max: string;
      breakdown: Record<string, string>;
    };
    recommended_stack?: string[];
  };
}

export const ArchitectureInsights: React.FC<ArchitectureInsightsProps> = ({ insights }) => {
  return (
    <div className="space-y-6">
      {/* RAG Strategy */}
      {insights.needs_rag && (
        <LiquidGlassCard className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BrainCircuit className="h-5 w-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-high-contrast mb-1">
                RAG (Retrieval Augmented Generation)
              </h3>
              <Badge variant="outline" className="text-xs">Necessário</Badge>
            </div>
          </div>
          <p className="text-sm text-medium-contrast mb-3">
            {insights.rag_strategy}
          </p>
          {insights.rag_cost_estimate && (
            <div className="flex items-center gap-2 text-xs text-medium-contrast">
              <DollarSign className="h-3 w-3" />
              <span>Custo estimado: {insights.rag_cost_estimate}</span>
            </div>
          )}
        </LiquidGlassCard>
      )}

      {/* CRM Integration */}
      {insights.needs_crm && (
        <LiquidGlassCard className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Database className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-high-contrast mb-1">
                Integração com CRM
              </h3>
              <Badge variant="outline" className="text-xs">Recomendado</Badge>
            </div>
          </div>
          <p className="text-sm text-medium-contrast">
            {insights.crm_integration}
          </p>
        </LiquidGlassCard>
      )}

      {/* External APIs */}
      {insights.external_apis && insights.external_apis.length > 0 && (
        <LiquidGlassCard className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Plug className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-high-contrast">
              APIs Externas Necessárias
            </h3>
          </div>
          <div className="space-y-3">
            {insights.external_apis.map((api, index) => (
              <div key={index} className="p-3 bg-surface-elevated rounded-lg border border-border">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-sm text-high-contrast">{api.name}</p>
                  <Badge variant="secondary" className="text-xs">{api.cost}</Badge>
                </div>
                <p className="text-xs text-medium-contrast">{api.purpose}</p>
              </div>
            ))}
          </div>
        </LiquidGlassCard>
      )}

      {/* Data Storage */}
      {insights.data_storage && (
        <LiquidGlassCard className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Server className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-high-contrast mb-1">
                Armazenamento de Dados
              </h3>
              <Badge variant="secondary" className="text-xs">{insights.data_storage.cost}</Badge>
            </div>
          </div>
          <p className="font-medium text-sm text-high-contrast mb-2">
            Recomendado: {insights.data_storage.primary}
          </p>
          <p className="text-xs text-medium-contrast">
            {insights.data_storage.reason}
          </p>
        </LiquidGlassCard>
      )}

      {/* AI Models */}
      {insights.ai_models && insights.ai_models.length > 0 && (
        <LiquidGlassCard className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <BrainCircuit className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="font-semibold text-high-contrast">
              Modelos de IA Recomendados
            </h3>
          </div>
          <div className="space-y-4">
            {insights.ai_models.map((model, index) => (
              <div key={index} className="p-4 bg-surface-elevated rounded-lg border border-border space-y-2">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-sm text-high-contrast">{model.model}</p>
                  <Badge variant="outline" className="text-xs">{model.cost_per_1m_tokens}/1M tokens</Badge>
                </div>
                <p className="text-xs text-medium-contrast">
                  <strong>Uso:</strong> {model.use_case}
                </p>
                <p className="text-xs text-medium-contrast">
                  <strong>Quando usar:</strong> {model.when_to_use}
                </p>
                {model.alternative && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-medium-contrast">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      <strong>Alternativa:</strong> {model.alternative}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </LiquidGlassCard>
      )}

      {/* Cost Estimate */}
      {insights.total_monthly_cost_estimate && (
        <LiquidGlassCard className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-high-contrast mb-1">
                Estimativa de Custo Mensal
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">
                  {insights.total_monthly_cost_estimate.min}
                </span>
                <span className="text-medium-contrast">até</span>
                <span className="text-2xl font-bold text-primary">
                  {insights.total_monthly_cost_estimate.max}
                </span>
              </div>
            </div>
          </div>

          {insights.total_monthly_cost_estimate.breakdown && (
            <div className="space-y-2 pt-3 border-t border-border">
              <p className="text-xs font-semibold text-high-contrast mb-2">Breakdown:</p>
              {Object.entries(insights.total_monthly_cost_estimate.breakdown).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-medium-contrast capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-medium text-high-contrast">{value}</span>
                </div>
              ))}
            </div>
          )}
        </LiquidGlassCard>
      )}

      {/* Recommended Stack */}
      {insights.recommended_stack && insights.recommended_stack.length > 0 && (
        <LiquidGlassCard className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="font-semibold text-high-contrast">
              Stack Recomendada
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.recommended_stack.map((tool, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tool}
              </Badge>
            ))}
          </div>
        </LiquidGlassCard>
      )}
    </div>
  );
};
