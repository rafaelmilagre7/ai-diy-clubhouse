
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Users, Shield, Bell } from 'lucide-react';

const FormacaoConfiguracoes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
        <p className="text-muted-foreground">
          Configure parâmetros e preferências da área de formação
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Configurações de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Gerencie permissões e acessos dos usuários do sistema de formação.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança e Privacidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Configure políticas de segurança e privacidade dos dados.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Configure alertas e notificações do sistema.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Configurações gerais da plataforma de formação.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormacaoConfiguracoes;
