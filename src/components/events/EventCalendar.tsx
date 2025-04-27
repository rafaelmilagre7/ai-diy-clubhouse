import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useEvents } from '@/hooks/useEvents';
import { EventModal } from './EventModal';
import { EventsListModal } from './EventsListModal';
import { Event } from '@/types/events';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { EventDay } from './EventDay';

export const EventCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { data: events = [], isLoading } = useEvents();
  
  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    
    setSelectedDate(day);
    
    const eventsOnSelectedDay = events.filter(event => 
      isSameDay(new Date(event.start_time), day)
    );
    
    if (eventsOnSelectedDay.length === 1) {
      setSelectedEvent(eventsOnSelectedDay[0]);
    }
  };

  const getEventsForDay = (day: Date): Event[] => {
    return events.filter(event => isSameDay(new Date(event.start_time), day));
  };

  const renderDay = (day: Date, events: Event[]) => {
    if (events.length === 0) return null;
    
    return <EventDay events={events} />;
  };

  const handleCloseEventModal = () => {
    setSelectedEvent(null);
  };

  const eventsOnSelectedDate = selectedDate 
    ? events.filter(event => isSameDay(new Date(event.start_time), selectedDate))
    : [];

  return (
    <div className="space-y-4">
      <div className="rounded-md border shadow bg-card">
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
            event: 'bg-viverblue/20 font-bold text-viverblue hover:bg-viverblue/30 relative'
          }}
          components={{
            DayContent: (props) => {
              const dayEvents = getEventsForDay(props.date);
              return (
                <div className="relative w-full h-full flex flex-col items-center">
                  <div>{props.date.getDate()}</div>
                  {renderDay(props.date, dayEvents)}
                </div>
              );
            }
          }}
          className="p-0"
        />
      </div>
      
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={handleCloseEventModal}
        />
      )}
      
      {selectedDate && !selectedEvent && eventsOnSelectedDate.length > 0 && (
        <EventsListModal 
          date={selectedDate} 
          events={eventsOnSelectedDate} 
          onSelectEvent={setSelectedEvent}
          onClose={() => setSelectedDate(undefined)}
        />
      )}
    </div>
  );
};
