
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Eye, RefreshCw, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SimpleOnboardingWizard } from '@/components/onboarding/SimpleOnboardingWizard';

const OnboardingPreview = () => {
  const [key, setKey] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const resetPreview = () => {
    setKey(prev => prev + 1);
  };

  const togglePreviewMode = () => {
    setShowControls(!showControls);
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        togglePreviewMode();
      } else if (e.key === 'r' || e.key === 'R') {
        if (e.ctrlKey || e.metaKey) return; // Evitar conflito com refresh do browser
        resetPreview();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Modo fullscreen (sem controles admin)
  if (!showControls) {
    return (
      <div className="relative min-h-screen">
        {/* Botão flutuante para voltar aos controles */}
        <button
          onClick={togglePreviewMode}
          className="fixed top-4 right-4 z-50 w-10 h-10 bg-background/90 backdrop-blur border rounded-full shadow-lg hover:bg-muted/50 transition-colors flex items-center justify-center"
          title="Mostrar controles admin (ESC)"
        >
          <Eye className="h-4 w-4" />
        </button>
        
        {/* Preview sem interferências */}
        <div key={key}>
          <SimpleOnboardingWizard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Controles Admin - Overlay discreto */}
      <div className="fixed top-4 left-4 right-4 z-50">
        <Card className="bg-background/95 backdrop-blur shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/admin">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="font-medium">Preview Onboarding</span>
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button onClick={resetPreview} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reiniciar
                </Button>
                <Button onClick={togglePreviewMode} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Modo Usuário
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Espaçador para controles admin */}
      <div className="h-20"></div>

      {/* Preview do Onboarding */}
      <div key={key} className="relative">
        <SimpleOnboardingWizard />
      </div>

      {/* Dica de atalhos - Overlay inferior discreto */}
      <div className="fixed bottom-4 right-4 z-40">
        <Card className="bg-background/90 backdrop-blur border-muted">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>ESC: Alternar modo • R: Reiniciar</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPreview;
