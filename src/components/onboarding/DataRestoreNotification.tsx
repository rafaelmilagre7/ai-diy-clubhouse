import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Wifi, WifiOff } from 'lucide-react';

interface DataRestoreNotificationProps {
  dataRestored: boolean;
  isOnline?: boolean;
}

export const DataRestoreNotification: React.FC<DataRestoreNotificationProps> = ({ 
  dataRestored, 
  isOnline = navigator.onLine 
}) => {
  if (!dataRestored) return null;

  return (
    <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          📱 <strong>Dados restaurados!</strong> Suas informações preenchidas foram recuperadas automaticamente.
        </span>
        <div className="flex items-center gap-2 text-sm">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-green-600" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-orange-600" />
              <span className="text-orange-600">Offline</span>
            </>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};