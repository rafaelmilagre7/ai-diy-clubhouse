
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useGoogleCalendarAuth, type GoogleEvent } from "@/hooks/admin/useGoogleCalendarAuth";
import { toast } from "sonner";
import { type EventFormData } from "./form/EventFormSchema";

export interface GoogleCalendarImportProps {
  onEventsSelected: (events: EventFormData[]) => void;
  isAuthenticated?: boolean;
}

export const GoogleCalendarImport = ({ 
  onEventsSelected,
  isAuthenticated = false 
}: GoogleCalendarImportProps) => {
  const { 
    initiateLogin,
    fetchEvents,
    isLoading
  } = useGoogleCalendarAuth();

  const handleImportClick = async () => {
    if (!isAuthenticated) {
      initiateLogin();
      return;
    }

    try {
      const events = await fetchEvents();
      if (events && events.length > 0) {
        const formattedEvents = events.map((event: GoogleEvent) => ({
          title: event.summary || '',
          description: event.description || '',
          start_time: event.start?.dateTime || event.start?.date || '',
          end_time: event.end?.dateTime || event.end?.date || '',
          physical_location: event.location || '',
          location_link: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || ''
        }));
        
        onEventsSelected(formattedEvents);
        toast.success(`${events.length} eventos encontrados no Google Calendar`);
      } else {
        toast.info('Nenhum evento encontrado no Google Calendar');
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      toast.error('Não foi possível carregar os eventos do Google Calendar');
    }
  };

  return (
    <Button
      variant="outline"
      className="bg-white border-gray-200 hover:bg-gray-100 gap-2"
      onClick={handleImportClick}
      disabled={isLoading}
    >
      <Calendar className="h-4 w-4" />
      {isAuthenticated 
        ? "Importar do Google Calendar"
        : "Conectar ao Google Calendar"
      }
    </Button>
  );
};
