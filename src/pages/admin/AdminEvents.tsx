
import React, { useState } from 'react';
import { AdminEventsHeader } from '@/components/admin/events/AdminEventsHeader';
import { EventsTable } from '@/components/admin/events/EventsTable';
import { useEvents } from '@/hooks/useEvents';
import { Loader2 } from 'lucide-react';
import { useGoogleCalendarAuth } from '@/hooks/admin/useGoogleCalendarAuth';

const AdminEvents = () => {
  const { data: events, isLoading } = useEvents();
  const { isAuthenticated } = useGoogleCalendarAuth();

  return (
    <div className="container mx-auto py-6">
      <AdminEventsHeader isCalendarAuthenticated={isAuthenticated} />
      
      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-viverblue" />
            <span className="ml-2 text-muted-foreground">Carregando eventos...</span>
          </div>
        ) : (
          <EventsTable />
        )}
      </div>
    </div>
  );
};

export default AdminEvents;
