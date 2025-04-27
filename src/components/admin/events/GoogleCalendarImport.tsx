
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useGoogleCalendarAuth, type GoogleEvent } from "@/hooks/admin/useGoogleCalendarAuth";
import { useGoogleCalendarEvents } from "@/hooks/admin/useGoogleCalendarEvents";
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
    accessToken,
    isLoading: isAuthLoading
  } = useGoogleCalendarAuth();

  const {
    fetchEvents,
    formatEvents,
    isLoading: isEventsLoading
  } = useGoogleCalendarEvents(accessToken);

  const handleImportClick = async () => {
    if (!isAuthenticated) {
      initiateLogin();
      return;
    }

    try {
      const events = await fetchEvents();
      
      if (!events || events.length === 0) {
        toast.info('Nenhum evento encontrado no Google Calendar');
        return;
      }

      const formattedEvents = formatEvents(events);      
      onEventsSelected(formattedEvents);
      toast.success(`${formattedEvents.length} eventos encontrados no Google Calendar`);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      toast.error('Não foi possível carregar os eventos do Google Calendar');
    }
  };

  const isLoadingState = isAuthLoading || isEventsLoading;

  return (
    <Button
      variant="outline"
      className="bg-white border-gray-200 hover:bg-gray-100 gap-2"
      onClick={handleImportClick}
      disabled={isLoadingState}
    >
      <Calendar className="h-4 w-4" />
      {isAuthenticated 
        ? "Importar do Google Calendar"
        : "Conectar ao Google Calendar"
      }
    </Button>
  );
};
