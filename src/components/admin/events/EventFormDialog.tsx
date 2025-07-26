
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventForm } from "./EventForm";
import { EventFormSheet } from "./EventFormSheet";
import type { Event } from "@/types/events";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Edit } from "lucide-react";

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
      <DialogContent className="max-w-4xl surface-modal border-border/50 shadow-aurora-strong">
        <DialogHeader className="pb-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-viverblue/10 border border-viverblue/20">
              <Edit className="w-5 h-5 text-viverblue" />
            </div>
            <DialogTitle className="text-heading-2">
              {event ? "Editar Evento" : "Novo Evento"}
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="max-h-[calc(80vh-140px)] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <EventForm 
            event={event}
            onSuccess={onClose} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
