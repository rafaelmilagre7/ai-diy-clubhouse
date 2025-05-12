
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventForm } from "./EventForm";
import { EventFormSheet } from "./EventFormSheet";
import type { Event } from "@/types/events";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface EventFormDialogProps {
  event?: Event;
  onClose: () => void;
}

export const EventFormDialog = ({ event, onClose }: EventFormDialogProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Não renderizar nada durante o SSR para evitar hidratação incorreta
  if (!isMounted) return null;

  // Para dispositivos móveis ou quando a preferência é por sliding panel
  if (!isDesktop) {
    return <EventFormSheet event={event} onClose={onClose} />;
  }

  // Para desktop, continuamos a usar o Dialog mais compacto
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {event ? "Editar Evento" : "Novo Evento"}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[calc(80vh-100px)] overflow-y-auto">
          <EventForm 
            event={event}
            onSuccess={onClose} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
