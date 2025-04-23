
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export const NotFoundContent = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-lg mx-auto p-8 text-center flex flex-col items-center">
      <AlertTriangle size={48} className="text-yellow-500 mb-4" />
      <h1 className="text-2xl font-bold mb-3">Erro ao carregar implementação</h1>
      <p className="text-muted-foreground mb-6">
        Não foi possível carregar os dados para esta implementação. 
        O recurso pode não existir ou pode ter sido removido.
      </p>
      <div className="flex space-x-4">
        <Button onClick={() => navigate(-1)} variant="outline">
          Voltar
        </Button>
        <Button onClick={() => navigate("/dashboard")}>
          Ir para Dashboard
        </Button>
      </div>
    </div>
  );
};
