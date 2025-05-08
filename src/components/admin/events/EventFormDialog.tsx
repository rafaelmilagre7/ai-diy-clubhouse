
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventForm } from "./EventForm";
import type { Event } from "@/types/events";
import type { EventFormData } from "./form/EventFormSchema";

interface EventFormDialogProps {
  event?: Event;
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
