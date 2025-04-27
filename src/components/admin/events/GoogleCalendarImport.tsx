import { useState, useEffect } from 'react';
import { useGoogleCalendarAuth, type GoogleEvent } from '@/hooks/admin/useGoogleCalendarAuth';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, VideoIcon, ExternalLink, RefreshCw, LogOut, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type EventFormData } from './form/EventFormSchema';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSearchParams } from 'react-router-dom';

interface GoogleCalendarImportProps {
  onEventsSelected: (events: EventFormData[]) => void;
}

export const GoogleCalendarImport = ({ onEventsSelected }: GoogleCalendarImportProps) => {
  const [searchParams] = useSearchParams();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  
  const {
    isLoading,
    isAuthenticated,
    userInfo,
    events,
    selectedEvents,
    lastError,
    isAuthInitiating,
    initiateLogin,
    handleAuthCode,
    fetchEvents,
    logout,
    toggleEventSelection,
    convertSelectedEvents
  } = useGoogleCalendarAuth();
  
  useEffect(() => {
    // Capturar parâmetros da URL após o redirecionamento do OAuth
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const authError = searchParams.get('authError');
    
    // Se tivermos um código e estado na URL, processamos a autenticação
    if (code && state) {
      console.log('Código e estado de autenticação detectados, processando...');
      
      handleAuthCode(code, state).then(success => {
        console.log('Resultado da autenticação:', success ? 'sucesso' : 'falha');
        setAuthSuccess(success);
        setAuthFailed(!success);
        if (success) {
          setIsImportDialogOpen(true);
        }
      });
    } 
    else if (authError) {
      console.error('Erro de autenticação retornado:', authError);
      setAuthFailed(true);
      setAuthErrorMessage(authError);
      toast.error(`Falha na autenticação: ${authError}`);
    }
  }, [searchParams, handleAuthCode]);

  useEffect(() => {
    if (isAuthenticated && isImportDialogOpen && events.length === 0) {
      console.log('Usuário autenticado e diálogo aberto, carregando eventos...');
      fetchEvents();
    }
  }, [isAuthenticated, isImportDialogOpen, events.length, fetchEvents]);

  const handleImport = () => {
    if (selectedEvents.size === 0) {
      toast.error('Selecione pelo menos um evento para importar');
      return;
    }
    
    const formattedEvents = convertSelectedEvents();
    onEventsSelected(formattedEvents);
    setIsImportDialogOpen(false);
    toast.success(`${formattedEvents.length} evento(s) importado(s) com sucesso!`);
  };

  const handleImportClick = () => {
    setAuthFailed(false);
    setAuthErrorMessage(null);
    if (!isAuthenticated) {
      initiateLogin();
    } else {
      setIsImportDialogOpen(true);
    }
  };

  const handleRetryAuth = () => {
    setAuthFailed(false);
    setAuthErrorMessage(null);
    initiateLogin();
  };

  const formatDateTime = (dateTimeStr: string | undefined) => {
    if (!dateTimeStr) return '';
    
    try {
      const date = new Date(dateTimeStr);
      return format(date, "dd MMM yyyy 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return dateTimeStr;
    }
  };

  return (
    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-white border-gray-200 hover:bg-gray-100 gap-2"
          onClick={handleImportClick}
          disabled={isAuthInitiating}
        >
          {isAuthInitiating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Calendar className="h-4 w-4" />
          )}
          Importar do Google Calendar
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Importar Eventos do Google Calendar</DialogTitle>
          {userInfo && (
            <div className="flex items-center mt-2">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={userInfo.picture} alt={userInfo.name} />
                <AvatarFallback>{userInfo.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">Conectado como {userInfo.email}</span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2"
                onClick={logout}
                title="Desconectar"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="ml-1"
                onClick={() => fetchEvents()}
                title="Atualizar eventos"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}
        </DialogHeader>
        
        <ScrollArea className="h-[calc(100%-120px)] pr-4">
          {lastError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro: {lastError}
              </AlertDescription>
            </Alert>
          )}

          {authErrorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro de autenticação: {authErrorMessage}
              </AlertDescription>
            </Alert>
          )}

          {authFailed && (
            <div className="text-center py-10">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-4 text-lg font-medium">Falha na conexão com o Google</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                Não foi possível conectar com sua conta do Google Calendar. 
                Verifique se você concedeu as permissões necessárias.
              </p>
              <Button variant="default" className="mt-4" onClick={handleRetryAuth}>
                Tentar novamente
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4 mt-2">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">Nenhum evento encontrado no calendário</p>
              <p className="mt-1 text-sm text-gray-400">Verifique se existem eventos futuros no seu Google Calendar.</p>
              <Button variant="outline" className="mt-4" onClick={() => fetchEvents(50)}>
                Buscar mais eventos (até 50)
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              {events.map((event: GoogleEvent) => (
                <Card key={event.id} className={`transition-all border ${selectedEvents.has(event.id) ? 'border-viverblue bg-viverblue/5' : ''}`}>
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id={`event-${event.id}`}
                        checked={selectedEvents.has(event.id)}
                        onCheckedChange={() => toggleEventSelection(event.id)}
                        className="mt-1"
                      />
                      <div>
                        <CardTitle className="text-base">{event.summary}</CardTitle>
                        {event.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {event.htmlLink && (
                      <a
                        href={event.htmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>
                          {formatDateTime(event.start?.dateTime || event.start?.date)} - {formatDateTime(event.end?.dateTime || event.end?.date)}
                        </span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {(event.hangoutLink || event.conferenceData) && (
                        <div className="flex items-center gap-2 text-sm">
                          <VideoIcon className="h-4 w-4 text-gray-400" />
                          <a 
                            href={event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-viverblue hover:underline"
                          >
                            Link da reunião
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <CardFooter className="border-t pt-4 mt-4 flex justify-between">
          <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={selectedEvents.size === 0 || isLoading}
          >
            Importar {selectedEvents.size} evento(s)
          </Button>
        </CardFooter>
      </DialogContent>
    </Dialog>
  );
};
