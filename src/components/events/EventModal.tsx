
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
import { Calendar as CalendarIcon, Clock, MapPin, ExternalLink } from 'lucide-react';
import { useEventPermissions } from '@/hooks/useEventPermissions';
import { EventAccessBlocked } from './EventAccessBlocked';
import { useState, useEffect } from 'react';

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

export const EventModal = ({ event, onClose }: EventModalProps) => {
  const { checkEventAccess, getEventRoleInfo, debugEventAccess, forceRefreshPermissions } = useEventPermissions();
  
  // FASE 2: Estado inicial como false (BLOQUEADO) até verificação ser concluída
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [allowedRoles, setAllowedRoles] = useState<Array<{ id: string; name: string; description?: string }>>([]);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [verificationCount, setVerificationCount] = useState(0);
  const [showDebugMode, setShowDebugMode] = useState(false);

  // FASE 3: Função para debug manual
  const handleDebugAccess = async () => {
    console.log('🔍 [DEBUG] Iniciando diagnóstico manual...');
    const result = await debugEventAccess(event.id);
    console.log('🔍 [DEBUG] Resultado:', result);
    
    // Mostrar no console de forma destacada
    console.group('📋 RELATÓRIO DE DIAGNÓSTICO');
    console.log('✅ Diagnóstico concluído - verifique os logs acima');
    console.log('📊 Resultado:', result.hasAccess ? 'ACESSO LIBERADO' : 'ACESSO NEGADO');
    console.log('📝 Motivo:', result.reason);
    if (result.details) {
      console.log('🔍 Detalhes:', result.details);
    }
    console.groupEnd();
  };

  // FASE 4: Função para forçar nova verificação
  const handleForceRefresh = async () => {
    console.log('🔄 [DEBUG] Forçando nova verificação...');
    setIsVerifying(true);
    
    try {
      const result = await forceRefreshPermissions(event.id);
      setHasAccess(result);
      console.log('✅ [DEBUG] Nova verificação concluída:', result);
    } catch (error) {
      console.error('❌ [DEBUG] Erro na nova verificação:', error);
      setHasAccess(false);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const verifyAccess = async () => {
      console.log('🔍 [EventModal] Iniciando verificação para evento:', event.id);
      
      setIsVerifying(true);
      
      try {
        // CORREÇÃO: Aguardar profile estar completamente carregado
        let retryCount = 0;
        const maxRetries = 5;
        
        while (retryCount < maxRetries && isMounted) {
          const access = await checkEventAccess(event.id);
          
          if (access || retryCount === maxRetries - 1) {
            if (isMounted) {
              console.log('✅ [EventModal] Verificação concluída:', { access, retryCount });
              setHasAccess(access);
              
              if (!access) {
                const roles = await getEventRoleInfo(event.id);
                setAllowedRoles(roles);
              }
            }
            break;
          }
          
          // Se foi negado, aguardar um pouco e tentar novamente
          console.log(`⏳ [EventModal] Tentativa ${retryCount + 1} negada, tentando novamente...`);
          await new Promise(resolve => setTimeout(resolve, 500));
          retryCount++;
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

    verifyAccess();
    
    return () => {
      isMounted = false;
    };
  }, [event.id, checkEventAccess, getEventRoleInfo]);

  const generateGoogleCalendarLink = () => {
    const start = new Date(event.start_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(event.end_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location_link || '')}`;
  };

  const formattedDate = format(new Date(event.start_time), "EEEE, d 'de' MMMM", { locale: ptBR });
  const startTime = format(new Date(event.start_time), "HH:mm", { locale: ptBR });
  const endTime = format(new Date(event.end_time), "HH:mm", { locale: ptBR });

  // FASE 3: Verificação Síncrona - Se ainda está verificando OU não tem acesso, bloquear
  console.log('[DEBUG] EventModal: Renderizando - isVerifying:', isVerifying, 'hasAccess:', hasAccess);
  
  if (isVerifying || !hasAccess) {
    console.log('[DEBUG] EventModal: Bloqueando acesso - verificando:', isVerifying, 'tem acesso:', hasAccess);
    
    return (
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent className="max-w-2xl surface-modal border-border/50 shadow-aurora-strong p-0 overflow-hidden">
          {isVerifying ? (
            <div className="p-8 text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto mb-4"></div>
              <p className="text-body text-text-muted">Verificando permissões...</p>
              
              {/* FASE 3: Botões de Debug durante verificação */}
              <div className="flex justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDebugAccess}
                  className="text-xs"
                >
                  🔍 Debug Console
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleForceRefresh}
                  className="text-xs"
                >
                  🔄 Tentar Novamente
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <EventAccessBlocked
                eventTitle={event.title}
                allowedRoles={allowedRoles}
                onClose={onClose}
              />
              
              {/* FASE 3: Botões de Debug quando bloqueado */}
              <div className="p-4 border-t border-border/50 bg-surface-elevated/50">
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDebugAccess}
                    className="text-xs"
                  >
                    🔍 Diagnóstico Completo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleForceRefresh}
                    className="text-xs"
                  >
                    🔄 Atualizar Permissões
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDebugMode(!showDebugMode)}
                    className="text-xs"
                  >
                    {showDebugMode ? '👁️ Ocultar Info' : '👁️ Mostrar Info'}
                  </Button>
                </div>
                
                {/* FASE 3: Informações de Debug */}
                {showDebugMode && (
                  <div className="mt-4 p-3 bg-surface-elevated rounded-lg text-xs">
                    <div className="space-y-2">
                      <div><strong>Event ID:</strong> {event.id}</div>
                      <div><strong>Verificações:</strong> {verificationCount}</div>
                      <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Se chegou aqui, usuário tem acesso confirmado
  console.log('[DEBUG] EventModal: Usuário autenticado com acesso, renderizando evento completo');

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl surface-modal border-border/50 shadow-aurora-strong p-0 overflow-hidden">
        {event.cover_image_url && (
          <div className="relative h-48 w-full">
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-6 right-6">
              <h1 className="text-heading-1 text-white font-bold">{event.title}</h1>
            </div>
          </div>
        )}

        <div className="p-6">
          {!event.cover_image_url && (
            <DialogHeader className="pb-4 border-b border-border/50">
              <DialogTitle className="text-heading-2 text-text-primary">{event.title}</DialogTitle>
            </DialogHeader>
          )}

          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 surface-elevated rounded-lg">
                <div className="p-2 rounded-lg bg-viverblue/10 border border-viverblue/20">
                  <CalendarIcon className="h-4 w-4 text-viverblue" />
                </div>
                <div>
                  <div className="text-caption text-text-muted">Data</div>
                  <div className="text-body font-medium capitalize">{formattedDate}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 surface-elevated rounded-lg">
                <div className="p-2 rounded-lg bg-operational/10 border border-operational/20">
                  <Clock className="h-4 w-4 text-operational" />
                </div>
                <div>
                  <div className="text-caption text-text-muted">Horário</div>
                  <div className="text-body font-medium">{startTime} - {endTime}</div>
                </div>
              </div>
            </div>
            
            {(event.location_link || event.physical_location) && (
              <div className="space-y-3">
                {event.physical_location && (
                  <div className="flex items-start gap-3 p-3 surface-elevated rounded-lg">
                    <div className="p-2 rounded-lg bg-strategy/10 border border-strategy/20">
                      <MapPin className="h-4 w-4 text-strategy" />
                    </div>
                    <div>
                      <div className="text-caption text-text-muted">Local Presencial</div>
                      <div className="text-body">{event.physical_location}</div>
                    </div>
                  </div>
                )}
                
                {event.location_link && (
                  <div className="flex items-start gap-3 p-3 surface-elevated rounded-lg">
                    <div className="p-2 rounded-lg bg-revenue/10 border border-revenue/20">
                      <ExternalLink className="h-4 w-4 text-revenue" />
                    </div>
                    <div className="flex-1">
                      <div className="text-caption text-text-muted">Reunião Online</div>
                      <a
                        href={event.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body text-viverblue hover:text-viverblue/80 hover:underline flex items-center gap-1 transition-colors"
                      >
                        Acessar reunião
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {event.description && (
              <div className="space-y-3">
                <h3 className="text-label">Descrição do Evento</h3>
                <div className="p-4 surface-elevated rounded-lg">
                  <p className="text-body text-text-secondary whitespace-pre-line leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button 
                variant="outline"
                onClick={onClose}
                className="border-border/50"
              >
                Fechar
              </Button>
              <Button 
                asChild 
                className="bg-viverblue hover:bg-viverblue/90 text-white shadow-aurora"
              >
                <a
                  href={generateGoogleCalendarLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Adicionar ao Calendário
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
