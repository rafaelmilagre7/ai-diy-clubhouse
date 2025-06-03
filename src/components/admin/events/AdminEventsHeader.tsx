
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { EventFormDialog } from "./EventFormDialog";
import { type EventFormData } from "./form/EventFormSchema";

interface AdminEventsHeaderProps {}

export const AdminEventsHeader = ({}: AdminEventsHeaderProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="text-left">
        <h1 className="text-2xl font-bold">Gerenciar Eventos</h1>
        <p className="text-muted-foreground">
          Adicione e gerencie eventos da comunidade
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {showCreateDialog && (
        <EventFormDialog 
          onClose={handleCloseDialog} 
        />
      )}
    </div>
  );
};
