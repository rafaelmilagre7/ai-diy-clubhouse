
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventForm } from "./EventForm";
import { Event as SupabaseEvent } from "@/lib/supabase/types";
import { Event as AppEvent } from "@/types/events";
import type { EventFormData } from "./form/EventFormSchema";

interface EventFormDialogProps {
  event?: AppEvent; // Usando o tipo AppEvent do aplicativo
  initialData?: EventFormData | null;
  onClose: () => void;
}

export const EventFormDialog = ({ event, initialData, onClose }: EventFormDialogProps) => {
  const isEditing = !!event;
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Evento" : "Novo Evento"}
          </DialogTitle>
        </DialogHeader>
        <EventForm 
          event={event} 
          initialData={initialData}
          onSuccess={onClose} 
        />
      </DialogContent>
    </Dialog>
  );
};
