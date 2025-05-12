
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit, Trash2, Repeat } from "lucide-react";
import { useState } from "react";
import { useEvents } from "@/hooks/useEvents";
import { EventFormDialog } from "./EventFormDialog";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Event } from "@/types/events";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const EventsTable = () => {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { data: events = [], isLoading } = useEvents();
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir este evento?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      toast.error("Erro ao excluir evento");
    }
  };

  if (isLoading) {
    return <div className="text-center">Carregando eventos...</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Data/Hora Início</TableHead>
            <TableHead>Data/Hora Fim</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>{event.title}</TableCell>
              <TableCell>
                {format(new Date(event.start_time), "PPpp", { locale: ptBR })}
              </TableCell>
              <TableCell>
                {format(new Date(event.end_time), "PPpp", { locale: ptBR })}
              </TableCell>
              <TableCell>
                {event.is_recurring ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Repeat className="h-3 w-3" />
                          Recorrente
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {event.recurrence_pattern === 'daily' && "Ocorre diariamente"}
                          {event.recurrence_pattern === 'weekly' && "Ocorre semanalmente"}
                          {event.recurrence_pattern === 'monthly' && "Ocorre mensalmente"}
                          {event.recurrence_interval && event.recurrence_interval > 1 ? 
                            ` a cada ${event.recurrence_interval} ${
                              event.recurrence_pattern === 'daily' ? 'dias' : 
                              event.recurrence_pattern === 'weekly' ? 'semanas' : 'meses'
                            }` : ''}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Badge variant="outline">Único</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingEvent(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingEvent && (
        <EventFormDialog
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </>
  );
};
