
import React from 'react';
import { NotificationPreferences } from '@/components/profile/NotificationPreferences';

const NotificationSettingsPage = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Configurações de Notificação</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie como você recebe notificações da plataforma
        </p>
      </div>
      
      <NotificationPreferences />
    </div>
  );
};

export default NotificationSettingsPage;
