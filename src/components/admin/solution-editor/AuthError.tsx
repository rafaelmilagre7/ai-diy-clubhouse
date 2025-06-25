
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const AuthError = () => {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Acesso Restrito</span>
        </div>
        <p className="text-red-600 text-sm mt-1">
          Você precisa estar logado como administrador para editar soluções.
        </p>
      </CardContent>
    </Card>
  );
};

export default AuthError;
