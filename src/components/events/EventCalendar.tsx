
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useEvents } from '@/hooks/useEvents';
import { EventModal } from './EventModal';
import { Event } from '@/types/events';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EventDay } from './EventDay';
import { EventsListModal } from './EventsListModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EventCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
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

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-border/60 shadow-xl bg-gradient-to-br from-card via-card to-muted/30 w-full max-w-6xl mx-auto overflow-hidden">
        {/* Cabeçalho do Calendário */}
        <div className="bg-gradient-to-r from-aurora-primary/10 via-aurora-primary/5 to-transparent border-b-2 border-border/60 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold text-foreground">
                {format(currentMonth, 'MMMM', { locale: ptBR }).charAt(0).toUpperCase() + format(currentMonth, 'MMMM', { locale: ptBR }).slice(1)}
              </h2>
              <span className="text-2xl font-semibold text-muted-foreground">
                {format(currentMonth, 'yyyy')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="font-medium hover:bg-aurora-primary/10 hover:text-aurora-primary hover:border-aurora-primary/50 transition-colors"
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousMonth}
                className="hover:bg-aurora-primary/10 hover:text-aurora-primary hover:border-aurora-primary/50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
                className="hover:bg-aurora-primary/10 hover:text-aurora-primary hover:border-aurora-primary/50 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Calendário */}
        <Calendar
          month={currentMonth}
          onMonthChange={setCurrentMonth}
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
            event: 'bg-aurora-primary/15 font-semibold text-aurora-primary hover:bg-aurora-primary/25 ring-2 ring-aurora-primary/30 transition-all duration-200'
          }}
          className="w-full min-h-calendar p-8"
          classNames={{
            months: "w-full grid grid-cols-1",
            month: "space-y-6 w-full",
            caption: "hidden", // Ocultar caption padrão, já temos nosso cabeçalho customizado
            caption_label: "hidden",
            nav: "hidden", // Ocultar navegação padrão
            table: "w-full border-collapse h-full",
            head_row: "grid grid-cols-7 gap-2 mb-3",
            head_cell: "text-muted-foreground/80 rounded-lg font-semibold text-sm h-12 flex items-center justify-center uppercase tracking-wider",
            row: "grid grid-cols-7 gap-2 h-event-row mb-2",
            cell: "relative p-0 text-center focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-xl last:[&:has([aria-selected])]:rounded-r-xl",
            day: "h-full w-full p-3 font-medium hover:bg-muted/60 hover:shadow-md rounded-xl transition-all duration-200 flex flex-col items-center justify-start border-2 border-transparent hover:border-aurora-primary/20",
            day_today: "bg-aurora-primary/10 border-aurora-primary/40 ring-2 ring-aurora-primary/20 font-bold",
            day_selected: "bg-aurora-primary/25 text-aurora-primary hover:bg-aurora-primary/35 border-aurora-primary/50 shadow-lg",
            day_outside: "opacity-40 text-muted-foreground/50",
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
