
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  RotateCcw, 
  Play, 
  Pause, 
  SkipForward, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Eye,
  Bug
} from 'lucide-react';

interface OnboardingDebugPanelProps {
  currentStep: number;
  totalSteps: number;
  data: any;
  onReset: () => void;
  onSkipToStep: (step: number) => void;
  onSimulateError: () => void;
  onToggleLoading: () => void;
  isLoading: boolean;
  hasError: boolean;
}

export const OnboardingDebugPanel: React.FC<OnboardingDebugPanelProps> = ({
  currentStep,
  totalSteps,
  data,
  onReset,
  onSkipToStep,
  onSimulateError,
  onToggleLoading,
  isLoading,
  hasError
}) => {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bug className="h-5 w-5 text-purple-500" />
          Debug Panel
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Status Atual
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Etapa:</span>
              <Badge variant="outline">{currentStep}/{totalSteps}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Estado:</span>
              {isLoading ? (
                <Badge variant="secondary">Loading</Badge>
              ) : hasError ? (
                <Badge variant="destructive">Error</Badge>
              ) : (
                <Badge variant="default">Normal</Badge>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Controles */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Controles
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="w-full"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Pause className="h-3 w-3 mr-1" />
                  Stop Loading
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Simulate Loading
                </>
              )}
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onSimulateError}
            className="w-full"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Simular Erro
          </Button>
        </div>

        <Separator />

        {/* Navegação */}
        <div className="space-y-3">
          <h4 className="font-medium">Pular para Etapa</h4>
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <Button
                key={step}
                variant={currentStep === step ? "default" : "outline"}
                size="sm"
                onClick={() => onSkipToStep(step)}
                className="text-xs"
              >
                {step}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Preview dos Dados */}
        <div className="space-y-2">
          <h4 className="font-medium">Dados Atuais</h4>
          <div className="bg-muted/50 p-2 rounded text-xs max-h-32 overflow-y-auto">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground p-2 bg-blue-500/10 rounded border border-blue-500/20">
          <CheckCircle className="h-3 w-3 inline mr-1" />
          Ambiente de teste - dados não são salvos no backend
        </div>
      </CardContent>
    </Card>
  );
};
