
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { EventFormDialog } from "./EventFormDialog";
import { GoogleCalendarImport } from "./GoogleCalendarImport";
import { type EventFormData } from "./form/EventFormSchema";

interface AdminEventsHeaderProps {
  // Corrigindo a tipagem para aceitar explicitamente boolean
  isCalendarAuthenticated: boolean;
}

export const AdminEventsHeader = ({ isCalendarAuthenticated = false }: AdminEventsHeaderProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [importedEvent, setImportedEvent] = useState<EventFormData | null>(null);

  const handleEventsImported = (events: EventFormData[]) => {
    if (events.length > 0) {
      // Por enquanto vamos abrir apenas o primeiro evento importado
      setImportedEvent(events[0]);
      setShowCreateDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
    setImportedEvent(null);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">Gerenciar Eventos</h1>
        <p className="text-muted-foreground">
          Adicione e gerencie eventos da comunidade
        </p>
      </div>
      <div className="flex gap-2">
        <GoogleCalendarImport 
          onEventsSelected={handleEventsImported} 
          isAuthenticated={isCalendarAuthenticated}
        />
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {showCreateDialog && (
        <EventFormDialog 
          initialData={importedEvent} 
          onClose={handleCloseDialog} 
        />
      )}
    </div>
  );
};
