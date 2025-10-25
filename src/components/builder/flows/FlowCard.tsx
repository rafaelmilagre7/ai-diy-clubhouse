import React, { useState } from 'react';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { MermaidFlowRenderer } from './MermaidFlowRenderer';
import { Clock, Zap, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  low: { label: 'Simples', color: 'bg-difficulty-beginner/10 text-difficulty-beginner border-difficulty-beginner/20' },
  medium: { label: 'Médio', color: 'bg-difficulty-intermediate/10 text-difficulty-intermediate border-difficulty-intermediate/20' },
  high: { label: 'Complexo', color: 'bg-difficulty-advanced/10 text-difficulty-advanced border-difficulty-advanced/20' }
};

export const FlowCard = ({ flow }: FlowCardProps) => {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  return (
    <LiquidGlassCard className="p-6 space-y-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{flow.title}</h3>
            <p className="text-muted-foreground mt-1">{flow.description}</p>
          </div>
          
          {/* Controles de zoom */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="h-8 w-8 p-0"
              title="Diminuir zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetZoom}
              className="h-8 px-2 text-xs font-medium"
              title="Resetar zoom"
            >
              {zoom}%
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="h-8 w-8 p-0"
              title="Aumentar zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <div className="w-px h-4 bg-border mx-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 p-0"
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
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

      <div 
        className={`transition-all duration-slow ${
          isFullscreen 
            ? 'fixed inset-4 z-50 bg-background/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl overflow-auto' 
            : 'relative'
        }`}
      >
        {isFullscreen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-10"
          >
            <Minimize2 className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        )}
        
        <div 
          style={{ 
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
            width: `${10000 / zoom}%`
          }}
        >
          <MermaidFlowRenderer 
            mermaidCode={flow.mermaid_code} 
            flowId={flow.id}
          />
        </div>
      </div>
    </LiquidGlassCard>
  );
};
