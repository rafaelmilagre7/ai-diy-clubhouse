
import { AdminEventsHeader } from "@/components/admin/events/AdminEventsHeader";
import { EventsTable } from "@/components/admin/events/EventsTable";

const AdminEvents = () => {
  return (
    <div className="space-y-6">
      <AdminEventsHeader />
      <EventsTable />
    </div>
  );
};

export default AdminEvents;
