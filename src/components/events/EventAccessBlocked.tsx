import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventAccessBlockedProps {
  eventTitle: string;
  allowedRoles: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  onClose: () => void;
  className?: string;
}

export const EventAccessBlocked: React.FC<EventAccessBlockedProps> = ({
  eventTitle,
  allowedRoles,
  onClose,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center min-h-[400px] p-4 ${className}`}>
      <Card className="max-w-md w-full bg-operational/5 border-operational/20 border-2">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 rounded-full bg-operational/5 w-fit mb-4">
            <div className="relative">
              <Calendar className="h-6 w-6 text-operational" />
              <Lock className="h-3 w-3 text-operational absolute -top-1 -right-1 bg-surface-card rounded-full p-0.5" />
            </div>
          </div>
          <CardTitle className="text-xl text-operational">
            Evento Restrito
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-operational/20 bg-operational/5">
            <AlertDescription className="text-center text-text-muted">
              O seu usuário não possui permissão para acessar esse evento
            </AlertDescription>
          </Alert>
          
          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
            >
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};