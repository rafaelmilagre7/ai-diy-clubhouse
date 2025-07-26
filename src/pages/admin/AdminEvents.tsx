
import { EventsTable } from "@/components/admin/events/EventsTable";
import { AdminEventsHeader } from "@/components/admin/events/AdminEventsHeader";

const AdminEvents = () => {
  return (
    <div className="min-h-screen">
      {/* Background with Aurora effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-aurora/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 -left-40 w-80 h-80 bg-viverblue/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-40 right-40 w-80 h-80 bg-operational/8 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative">
        <div className="surface-base border-b border-border/50">
          <AdminEventsHeader />
        </div>
        
        <div className="p-6 space-y-8">
          <EventsTable />
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;
