
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useEvents } from '@/hooks/useEvents';
import { EventModal } from './EventModal';
import { Event } from '@/types/events';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EventDay } from './EventDay';
import { EventsListModal } from './EventsListModal';

export const EventCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventsForDay, setEventsForDay] = useState<Event[]>([]);
  const [showEventsListModal, setShowEventsListModal] = useState(false);
  const { data: events = [], isLoading } = useEvents();
  
  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    
    const eventsOnSelectedDay = events.filter(event => 
      isSameDay(new Date(event.start_time), day)
    );
    
    if (eventsOnSelectedDay.length === 1) {
      setSelectedEvent(eventsOnSelectedDay[0]);
    } else if (eventsOnSelectedDay.length > 1) {
      // Quando há múltiplos eventos, mostrar o modal de lista
      setEventsForDay(eventsOnSelectedDay);
      setShowEventsListModal(true);
    }
    setSelectedDate(day);
  };

  const handleCloseEventModal = () => {
    setSelectedEvent(null);
    setSelectedDate(undefined);
  };

  const handleCloseEventsListModal = () => {
    setShowEventsListModal(false);
    setSelectedDate(undefined);
  };

  const handleSelectEvent = (event: Event) => {
    setShowEventsListModal(false);
    setSelectedEvent(event);
  };

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border shadow-lg bg-card w-full max-w-6xl mx-auto">
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
            event: 'bg-aurora-primary/10 font-medium text-aurora-primary hover:bg-aurora-primary/20 transition-colors'
          }}
          className="w-full min-h-calendar p-6"
          classNames={{
            months: "w-full grid grid-cols-1",
            month: "space-y-4 w-full",
            caption: "flex justify-center pt-1 relative items-center mb-4",
            caption_label: "text-lg font-medium",
            table: "w-full border-collapse h-full",
            head_row: "grid grid-cols-7 gap-1",
            head_cell: "text-muted-foreground rounded-md font-normal text-calendar h-10 flex items-center justify-center",
            row: "grid grid-cols-7 gap-1 h-event-row",
            cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
            day: "h-full w-full p-2 font-normal hover:bg-accent/50 rounded-md transition-colors flex flex-col items-center justify-start",
            day_today: "bg-accent/30",
            day_selected: "bg-aurora-primary/20 text-aurora-primary hover:bg-aurora-primary/30",
            day_outside: "opacity-50",
          }}
          components={{
            DayContent: (props) => {
              const dayEvents = events.filter(event => 
                isSameDay(new Date(event.start_time), props.date)
              );
              return (
                <div className="w-full h-full flex flex-col items-center">
                  <span className="text-sm mb-1">{props.date.getDate()}</span>
                  <EventDay events={dayEvents} />
                </div>
              );
            }
          }}
        />
      </div>
      
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={handleCloseEventModal}
        />
      )}
      
      {showEventsListModal && selectedDate && (
        <EventsListModal
          date={selectedDate}
          events={eventsForDay}
          onSelectEvent={handleSelectEvent}
          onClose={handleCloseEventsListModal}
        />
      )}
    </div>
  );
};
