
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventForm } from "./EventForm";
import type { Event } from "@/types/events";

interface EventFormDialogProps {
  event?: Event;
  onClose: () => void;
}

export const EventFormDialog = ({ event, onClose }: EventFormDialogProps) => {
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
          onSuccess={onClose} 
        />
      </DialogContent>
    </Dialog>
  );
};
