
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { EventFormDialog } from "./EventFormDialog";

export const AdminEventsHeader = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">Gerenciar Eventos</h1>
        <p className="text-muted-foreground">
          Adicione e gerencie eventos da comunidade
        </p>
      </div>
      <Button onClick={() => setShowCreateDialog(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Evento
      </Button>

      {showCreateDialog && (
        <EventFormDialog onClose={() => setShowCreateDialog(false)} />
      )}
    </div>
  );
};
