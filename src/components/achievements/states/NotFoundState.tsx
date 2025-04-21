
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotFoundState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-12 text-center">
      <div className="mb-6 flex justify-center">
        <AlertCircle className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium">Página não encontrada</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        A página que você está procurando não existe ou foi removida.
      </p>
      <div className="mt-6">
        <Button onClick={() => navigate('/dashboard')}>
          <Home className="mr-2 h-4 w-4" />
          Voltar para o Dashboard
        </Button>
      </div>
    </div>
  );
};
