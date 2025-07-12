
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Eye, Monitor, Settings, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SimpleOnboardingWizard } from '@/components/onboarding/SimpleOnboardingWizard';

const OnboardingPreview = () => {
  const [key, setKey] = useState(0);

  const resetPreview = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Admin Controls - Overlay fixo */}
      <div className="fixed top-4 left-4 right-4 z-50 bg-background/95 backdrop-blur border rounded-lg shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Admin
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Preview do Onboarding</h1>
              <Badge variant="outline">Experiência Real</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={resetPreview} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
          </div>
        </div>
        
        <div className="px-4 pb-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Monitor className="h-4 w-4" />
              Modo Preview
            </div>
            <div className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Componente: SimpleOnboardingWizard
            </div>
            <div className="text-green-600">
              ● Experiência idêntica ao usuário final
            </div>
          </div>
        </div>
      </div>

      {/* Espaçador para os controles do admin */}
      <div className="h-32"></div>

      {/* Preview do Onboarding Real */}
      <div key={key} className="relative">
        <SimpleOnboardingWizard />
      </div>

      {/* Instruções de uso - Overlay inferior */}
      <div className="fixed bottom-4 left-4 right-4 z-40">
        <Card className="bg-background/95 backdrop-blur border-yellow-200 bg-yellow-50/80 dark:border-yellow-800 dark:bg-yellow-950/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
              <div className="space-y-1">
                <h3 className="font-medium text-sm">Como usar este preview:</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Este é o onboarding real que os usuários veem</li>
                  <li>• Use "Reiniciar" para voltar ao primeiro passo</li>
                  <li>• Todos os dados são salvos localmente (não afeta banco de dados)</li>
                  <li>• Teste cada etapa para garantir qualidade da experiência</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPreview;
