
import { EventCalendar } from '@/components/events/EventCalendar';

const Events = () => {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Calendário de Eventos</h1>
      <EventCalendar />
    </div>
  );
};

export default Events;
