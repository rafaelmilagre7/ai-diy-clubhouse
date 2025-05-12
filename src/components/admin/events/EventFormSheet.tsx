
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EventForm } from "./EventForm";
import type { Event } from "@/types/events";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type EventFormData } from "./form/EventFormSchema";

interface EventFormSheetProps {
  event?: Event;
  initialData?: EventFormData | null;
  onClose: () => void;
}

export const EventFormSheet = ({ event, initialData, onClose }: EventFormSheetProps) => {
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

        <Tabs defaultValue="informacoes" className="flex flex-col h-full">
          <TabsList className="w-full justify-start px-6 pt-4 border-b rounded-none">
            <TabsTrigger value="informacoes">Informações</TabsTrigger>
            <TabsTrigger value="recorrencia">Recorrência</TabsTrigger>
            <TabsTrigger value="acesso">Acesso</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 h-[calc(100vh-180px)]">
            <div className="px-6 py-4">
              <EventForm 
                event={event}
                initialData={initialData} 
                onSuccess={onClose}
                layout="tabs" 
              />
            </div>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
