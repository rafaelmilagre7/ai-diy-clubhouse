
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMockOnboarding } from './MockOnboardingWizardContainer';
import { 
  RotateCcw, 
  Play, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  ChevronLeft,
  Database,
  Clock,
  User,
  CheckCircle
} from 'lucide-react';

export const OnboardingDebugPanel: React.FC = () => {
  const {
    currentStep,
    data,
    totalSteps,
    isSubmitting,
    hasUnsavedChanges,
    lastSaved,
    isCurrentStepValid,
    resetData,
    setCurrentStep,
    simulateLoading,
    simulateError
  } = useMockOnboarding();

  const [showData, setShowData] = useState(false);

  const stepNames = [
    'Info Pessoal',
    'Empresa',
    'IA',
    'Objetivos',
    'Preferências',
    'Finalização'
  ];

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'pending';
  };

  const getCompletionPercentage = () => {
    const requiredFields = [
      'name', 'email', 'phone', 'state', 'city',
      'companyName', 'businessSector', 'companySize', 'position',
      'hasImplementedAI', 'aiKnowledgeLevel',
      'mainObjective', 'weeklyLearningTime', 'wantsNetworking'
    ];
    
    const completedFields = requiredFields.filter(field => data[field as keyof typeof data]);
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4" />
            Status do Fluxo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Etapa Atual:</span>
            <Badge variant="outline">
              {currentStep}/{totalSteps}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Progresso:</span>
            <span className="text-sm font-medium">{getCompletionPercentage()}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Válido:</span>
            {isCurrentStepValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          
          {lastSaved && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Último Save:</span>
              <span className="text-xs text-muted-foreground">
                {lastSaved.toLocaleTimeString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            Navegação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <Button
                key={step}
                variant={step === currentStep ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentStep(step)}
                className="h-8 text-xs"
              >
                {step}
              </Button>
            ))}
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
              disabled={currentStep === totalSteps}
            >
              Próximo
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Play className="h-4 w-4" />
            Controles de Teste
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => simulateLoading(3000)}
            className="w-full justify-start"
          >
            <Clock className="h-3 w-3 mr-2" />
            Simular Loading
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={simulateError}
            className="w-full justify-start"
          >
            <AlertTriangle className="h-3 w-3 mr-2" />
            Toggle Erro
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={resetData}
            className="w-full justify-start"
          >
            <RotateCcw className="h-3 w-3 mr-2" />
            Reset Dados
          </Button>
        </CardContent>
      </Card>

      {/* Steps Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Etapas</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {stepNames.map((name, index) => {
                const step = index + 1;
                const status = getStepStatus(step);
                return (
                  <div key={step} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${
                      status === 'completed' ? 'bg-green-500' :
                      status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    <span className={status === 'current' ? 'font-medium' : ''}>
                      {step}. {name}
                    </span>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Data Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Dados
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowData(!showData)}
            >
              {showData ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </CardTitle>
        </CardHeader>
        {showData && (
          <CardContent>
            <ScrollArea className="h-48">
              <pre className="text-xs bg-muted p-2 rounded">
                {JSON.stringify(data, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
