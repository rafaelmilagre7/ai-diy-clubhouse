
import { useState, useEffect } from 'react';
import { useGoogleCalendarAuth, type GoogleEvent } from '@/hooks/admin/useGoogleCalendarAuth';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, VideoIcon, ExternalLink, RefreshCw, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type EventFormData } from './form/EventFormSchema';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface GoogleCalendarImportProps {
  onEventsSelected: (events: EventFormData[]) => void;
}

export const GoogleCalendarImport = ({ onEventsSelected }: GoogleCalendarImportProps) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  
  const {
    isLoading,
    isAuthenticated,
    userInfo,
    events,
    selectedEvents,
    initiateLogin,
    fetchEvents,
    logout,
    toggleEventSelection,
    convertSelectedEvents
  } = useGoogleCalendarAuth();
  
  // Verificar parâmetros de URL para código de autenticação
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (code && state) {
      // Limpar parâmetros da URL por segurança
      window.history.replaceState({}, document.title, window.location.pathname);
      // Processar o código de autenticação
      const handleAuth = async () => {
        await handleAuthCode(code, state);
        fetchEvents();
      };
      handleAuth();
    }
  }, []);

  // Carregar eventos quando autenticado
  useEffect(() => {
    if (isAuthenticated && events.length === 0) {
      fetchEvents();
    }
  }, [isAuthenticated]);

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
          onClick={() => {
            if (!isAuthenticated) {
              initiateLogin();
            } else {
              setIsImportDialogOpen(true);
            }
          }}
        >
          <Calendar className="h-4 w-4" />
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
              <Button variant="outline" className="mt-4" onClick={() => fetchEvents()}>
                Atualizar eventos
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
