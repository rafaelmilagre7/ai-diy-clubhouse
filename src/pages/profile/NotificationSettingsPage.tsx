
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const NotificationSettingsPage = () => {
  return (
    <>
      <Helmet>
        <title>Configurações de Notificação | Viver de IA</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Configurações de Notificação</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie como você deseja receber notificações e comunicados
          </p>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações por email</Label>
                  <div className="text-sm text-muted-foreground">
                    Receber notificações sobre atualizações e novidades
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações de equipe</Label>
                  <div className="text-sm text-muted-foreground">
                    Receber notificações sobre atividades da sua equipe
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações de sistema</Label>
                  <div className="text-sm text-muted-foreground">
                    Notificações importantes sobre o sistema
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default NotificationSettingsPage;
