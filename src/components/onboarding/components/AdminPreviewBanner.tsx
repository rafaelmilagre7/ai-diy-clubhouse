
import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const AdminPreviewBanner = () => {
  const navigate = useNavigate();

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-600 border-b border-orange-700">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <Alert className="border-orange-700 bg-orange-600/90 text-white">
          <AlertTriangle className="h-4 w-4 text-white" />
          <AlertDescription className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                Modo Visualização Admin - Os dados não serão salvos
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToAdmin}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Voltar ao Admin
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
