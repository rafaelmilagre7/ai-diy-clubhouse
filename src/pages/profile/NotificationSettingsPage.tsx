
import React from 'react';
import { NotificationPreferences } from '@/components/profile/NotificationPreferences';

const NotificationSettingsPage = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configurações de Notificação</h1>
        <p className="text-muted-foreground">
          Gerencie como você deseja receber notificações e comunicados
        </p>
      </div>
      
      <NotificationPreferences />
    </div>
  );
};

export default NotificationSettingsPage;
