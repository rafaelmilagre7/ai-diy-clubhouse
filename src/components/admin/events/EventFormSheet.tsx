
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EventForm } from "./EventForm";
import type { Event } from "@/types/events";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventFormSheetProps {
  event?: Event;
  onClose: () => void;
}

export const EventFormSheet = ({ event, onClose }: EventFormSheetProps) => {
  const isEditing = !!event;
  
  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto flex flex-col h-full p-0 surface-modal border-l border-border/50">
        <div className="flex justify-between items-center p-6 border-b border-border/50 sticky top-0 bg-surface-modal/95 backdrop-blur-sm z-10">
          <SheetHeader className="mb-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-aurora-primary/10 border border-aurora-primary/20">
                <Edit className="w-5 h-5 text-aurora-primary" />
              </div>
              <SheetTitle className="text-heading-2">
                {isEditing ? "Editar Evento" : "Novo Evento"}
              </SheetTitle>
            </div>
          </SheetHeader>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="hover:bg-surface-elevated"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 h-[calc(100vh-120px)]">
          <div className="px-6 py-6">
            <EventForm 
              event={event}
              onSuccess={onClose}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
