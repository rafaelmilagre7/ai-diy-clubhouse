
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, LogIn } from 'lucide-react';

const Auth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bem-vindo
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Faça login ou cadastre-se para continuar
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Autenticação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" size="lg">
              <LogIn className="h-4 w-4 mr-2" />
              Fazer Login
            </Button>
            
            <Button variant="outline" className="w-full" size="lg">
              <UserPlus className="h-4 w-4 mr-2" />
              Criar Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
