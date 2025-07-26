
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
    <div className="px-6 py-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-viverblue/10 border border-viverblue/20">
              <Plus className="w-5 h-5 text-viverblue" />
            </div>
            <div>
              <h1 className="text-heading-1">Gerenciar Eventos</h1>
              <p className="text-body-small text-text-muted">
                Adicione e gerencie eventos da comunidade
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-viverblue hover:bg-viverblue/90 text-white shadow-aurora"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      {showCreateDialog && (
        <EventFormDialog 
          onClose={handleCloseDialog} 
        />
      )}
    </div>
  );
};
