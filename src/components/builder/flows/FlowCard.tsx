import React from 'react';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { MermaidFlowRenderer } from './MermaidFlowRenderer';
import { Clock, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FlowCardProps {
  flow: {
    id: string;
    title: string;
    description: string;
    mermaid_code: string;
    estimated_time?: string;
    complexity?: 'low' | 'medium' | 'high';
  };
}

const complexityConfig = {
  low: { label: 'Simples', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  medium: { label: 'Médio', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  high: { label: 'Complexo', color: 'bg-red-500/10 text-red-500 border-red-500/20' }
};

export const FlowCard = ({ flow }: FlowCardProps) => {
  return (
    <LiquidGlassCard className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">{flow.title}</h3>
        <p className="text-muted-foreground">{flow.description}</p>
        
        <div className="flex gap-2 flex-wrap">
          {flow.estimated_time && (
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {flow.estimated_time}
            </Badge>
          )}
          {flow.complexity && (
            <Badge variant="outline" className={complexityConfig[flow.complexity].color}>
              <Zap className="h-3 w-3" />
              {complexityConfig[flow.complexity].label}
            </Badge>
          )}
        </div>
      </div>

      <MermaidFlowRenderer 
        mermaidCode={flow.mermaid_code} 
        flowId={flow.id}
      />
    </LiquidGlassCard>
  );
};
