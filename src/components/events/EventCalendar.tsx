
import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { useEvents } from '@/hooks/useEvents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, CalendarIcon, MapPin, Link as LinkIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Event } from '@/types/events';

export function EventCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { data: events = [], isLoading } = useEvents();
  
  // Filtrar eventos para o dia selecionado
  const eventsOnSelectedDay = selectedDate 
    ? events.filter(event => {
        const eventDate = new Date(event.start_time);
        return eventDate.getDate() === selectedDate.getDate() && 
               eventDate.getMonth() === selectedDate.getMonth() && 
               eventDate.getFullYear() === selectedDate.getFullYear();
      })
    : [];

  // Função para determinar os dias com eventos
  const isDayWithEvent = (date: Date) => {
    return events.some(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.getDate() === date.getDate() && 
             eventDate.getMonth() === date.getMonth() && 
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-viverblue" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-6">
      <div>
        <Card>
          <CardContent className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              locale={ptBR}
              modifiers={{
                event: (date) => isDayWithEvent(date),
              }}
              modifiersClassNames={{
                event: "bg-viverblue/10 font-bold text-viverblue",
              }}
            />
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, "PPPP", { locale: ptBR }) : "Selecione uma data"}
            </CardTitle>
            <CardDescription>
              {eventsOnSelectedDay.length === 0 
                ? "Sem eventos para esta data" 
                : `${eventsOnSelectedDay.length} evento${eventsOnSelectedDay.length > 1 ? 's' : ''}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventsOnSelectedDay.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-[300px] text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mb-4 opacity-30" />
                <p>Nenhum evento agendado para esta data.</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {eventsOnSelectedDay.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  return (
    <Card className="overflow-hidden">
      {event.cover_image_url && (
        <div className="w-full h-40 bg-cover bg-center"
          style={{ backgroundImage: `url(${event.cover_image_url})` }} />
      )}
      <CardHeader className={cn(event.cover_image_url ? "pt-4" : "")}>
        <CardTitle className="text-xl">{event.title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {format(new Date(event.start_time), "HH:mm", { locale: ptBR })} - 
            {format(new Date(event.end_time), "HH:mm", { locale: ptBR })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-muted-foreground">{event.description}</p>
        )}
        
        <div className="space-y-2">
          {event.physical_location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.physical_location}</span>
            </div>
          )}
          
          {event.location_link && (
            <div className="flex">
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <a href={event.location_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  <span>Acessar evento online</span>
                </a>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
