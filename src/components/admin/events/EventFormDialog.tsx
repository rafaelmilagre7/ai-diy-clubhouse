
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
          <div className="flex items-center gap-sm">
            <div className="p-sm rounded-lg bg-aurora-primary/10 border border-aurora-primary/20">
              <Edit className="w-5 h-5 text-aurora-primary" />
            </div>
            <DialogTitle className="text-heading-2">
              {event ? "Editar Evento" : "Novo Evento"}
            </DialogTitle>
            <DialogDescription className="text-body-small text-text-muted">
              {event ? "Modifique as informações do evento selecionado." : "Preencha os dados para criar um novo evento."}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="max-h-editor overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <EventForm 
            event={event}
            onSuccess={onClose} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
