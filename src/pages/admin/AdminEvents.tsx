
import { useHandleGoogleCalendarAuth } from "@/hooks/admin/useHandleGoogleCalendarAuth";
import { AdminEventsHeader } from "@/components/admin/events/AdminEventsHeader";
import { EventsTable } from "@/components/admin/events/EventsTable";

const AdminEvents = () => {
  const { isAuthenticated } = useHandleGoogleCalendarAuth();
  
  return (
    <div className="space-y-6">
      <AdminEventsHeader isCalendarAuthenticated={isAuthenticated} />
      <EventsTable />
    </div>
  );
};

export default AdminEvents;
