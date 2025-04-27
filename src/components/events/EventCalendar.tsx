
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useEvents } from '@/hooks/useEvents';
import { EventModal } from './EventModal';
import { Event } from '@/types/events';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EventDay } from './EventDay';

export const EventCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { data: events = [], isLoading } = useEvents();
  
  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    
    const eventsOnSelectedDay = events.filter(event => 
      isSameDay(new Date(event.start_time), day)
    );
    
    if (eventsOnSelectedDay.length === 1) {
      setSelectedEvent(eventsOnSelectedDay[0]);
    } else if (eventsOnSelectedDay.length > 1) {
      setSelectedDate(day);
      // Seleciona automaticamente o primeiro evento do dia
      setSelectedEvent(eventsOnSelectedDay[0]);
    }
  };

  const handleCloseEventModal = () => {
    setSelectedEvent(null);
    setSelectedDate(undefined); // Reseta também a data selecionada
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border shadow-lg bg-card min-h-[600px] w-full max-w-5xl mx-auto">
        <Calendar
          mode="single"
          locale={ptBR}
          onDayClick={handleDayClick}
          selected={selectedDate}
          modifiers={{
            event: (date) => events.some(event => 
              isSameDay(new Date(event.start_time), date)
            )
          }}
          modifiersClassNames={{
            event: 'bg-viverblue/10 font-medium text-viverblue hover:bg-viverblue/20 transition-colors relative'
          }}
          components={{
            DayContent: (props) => {
              const dayEvents = events.filter(event => 
                isSameDay(new Date(event.start_time), props.date)
              );
              return (
                <div className="relative w-full h-full flex flex-col items-center p-1">
                  <div className="text-sm mb-1">{props.date.getDate()}</div>
                  <EventDay events={dayEvents} />
                </div>
              );
            }
          }}
          className="p-4"
        />
      </div>
      
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={handleCloseEventModal}
        />
      )}
    </div>
  );
};
