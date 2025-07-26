
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

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

export const EventModal = ({ event, onClose }: EventModalProps) => {
  const generateGoogleCalendarLink = () => {
    const start = new Date(event.start_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(event.end_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location_link || '')}`;
  };

  const formattedDate = format(new Date(event.start_time), "EEEE, d 'de' MMMM", { locale: ptBR });
  const startTime = format(new Date(event.start_time), "HH:mm", { locale: ptBR });
  const endTime = format(new Date(event.end_time), "HH:mm", { locale: ptBR });

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
