import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Event } from '@/types/events';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { useEventPermissions } from '@/hooks/useEventPermissions';
import { EventAccessBlocked } from './EventAccessBlocked';
import { useAuth } from '@/contexts/auth';

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

export const EventModal = ({ event, onClose }: EventModalProps) => {
  const { checkEventAccess, getEventRoleInfo } = useEventPermissions();
  const { profile, isLoading: authLoading } = useAuth();
  
  // Estados para controle de acesso
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [allowedRoles, setAllowedRoles] = useState<Array<{ id: string; name: string; description?: string }>>([]);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);


  useEffect(() => {
    let isMounted = true;
    
    const verifyAccess = async () => {
      // CORREÇÃO DE TIMING - Aguardar profile estar completamente carregado
      if (authLoading) {
        console.log('🟡 [EVENT MODAL] Auth still loading, waiting...');
        return;
      }
      if (!profile) {
        console.log('🟡 [EVENT MODAL] Profile not available, waiting...');
        return;
      }
      
      const timestamp = Date.now();
      console.log('🚀 [EVENT MODAL] Starting permission check with loaded profile:', { 
        eventId: event.id, 
        timestamp,
        profile: profile?.email
      });
      
      setIsVerifying(true);
      
      try {
        // Verificar acesso
        const access = await checkEventAccess(event.id);
        
        if (isMounted) {
          console.log('✅ [EventModal] Verificação concluída:', { 
            access, 
            eventId: event.id,
            timestamp: Date.now()
          });
          setHasAccess(access);
          
          if (!access) {
            const roles = await getEventRoleInfo(event.id);
            setAllowedRoles(roles);
          }
        }
      } catch (error) {
        console.error('❌ [EventModal] Erro na verificação:', error);
        if (isMounted) {
          setHasAccess(false);
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    // AGUARDAR PROFILE CARREGADO COMPLETAMENTE
    if (event?.id && !authLoading && profile) {
      verifyAccess();
    } else {
      console.log('🟡 [EVENT MODAL] Waiting for dependencies:', {
        hasEventId: !!event?.id,
        authLoading,
        hasProfile: !!profile
      });
    }

    return () => {
      isMounted = false;
    };
  }, [event.id, checkEventAccess, getEventRoleInfo, authLoading, profile]);


  const formatDateTime = (dateTime: string) => {
    try {
      return format(new Date(dateTime), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateTime;
    }
  };

  const formatTime = (dateTime: string) => {
    try {
      return format(new Date(dateTime), 'HH:mm', { locale: ptBR });
    } catch {
      return dateTime;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mostrar loading enquanto auth/profile carrega ou verifica permissões */}
          {(authLoading || isVerifying || hasAccess === null) ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  {authLoading ? 'Carregando perfil...' : 
                   isVerifying ? 'Verificando permissões...' : 
                   'Verificando acesso...'}
                </span>
              </div>
            </div>
          ) : hasAccess === false ? (
            <EventAccessBlocked 
              allowedRoles={allowedRoles} 
              eventTitle={event.title}
              onClose={onClose}
            />
          ) : (
            <>
              {/* Descrição do evento */}
              {event.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Descrição</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Informações do evento */}
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Data e Hora de Início</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(event.start_time)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Horário de Término</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(event.end_time)}
                    </p>
                  </div>
                </div>

                {event.physical_location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Local Físico</p>
                      <p className="text-sm text-muted-foreground">
                        {event.physical_location}
                      </p>
                    </div>
                  </div>
                )}

                {event.location_link && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Link do Evento</p>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-sm text-primary hover:text-primary/80"
                        onClick={() => window.open(event.location_link, '_blank')}
                      >
                        Acessar evento online
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Badges de recorrência */}
              {event.is_recurring && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Tipo de evento:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Evento Recorrente
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};