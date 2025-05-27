
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EventForm } from "./EventForm";
import type { Event } from "@/types/events";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventFormSheetProps {
  event?: Event;
  onClose: () => void;
}

export const EventFormSheet = ({ event, onClose }: EventFormSheetProps) => {
  const isEditing = !!event;
  
  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto flex flex-col h-full p-0">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-background z-10">
          <SheetHeader className="mb-0">
            <SheetTitle className="text-xl">
              {isEditing ? "Editar Evento" : "Novo Evento"}
            </SheetTitle>
          </SheetHeader>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 h-[calc(100vh-80px)]">
          <div className="px-6 py-4">
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
