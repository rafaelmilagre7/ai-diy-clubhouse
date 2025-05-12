
import { EventsTable } from "@/components/admin/events/EventsTable";
import { AdminEventsHeader } from "@/components/admin/events/AdminEventsHeader";

const AdminEvents = () => {
  return (
    <div className="space-y-6">
      <AdminEventsHeader />
      <EventsTable />
    </div>
  );
};

export default AdminEvents;
