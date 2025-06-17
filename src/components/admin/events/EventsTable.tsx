
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

export const EventsTable = () => {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { data: events = [], isLoading, error } = useEvents();
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

  // Função para formatar data/hora corretamente (sem conversão adicional)
  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-lg">Carregando eventos...</div>
          <div className="text-sm text-muted-foreground mt-1">Aguarde um momento</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-lg text-red-600">Erro ao carregar eventos</div>
          <div className="text-sm text-muted-foreground mt-1">
            Tente recarregar a página
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-lg">Nenhum evento encontrado</div>
          <div className="text-sm text-muted-foreground mt-1">
            Clique em "Novo Evento" para criar o primeiro evento
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Data/Hora Início</TableHead>
              <TableHead>Data/Hora Fim</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>
                  {formatEventDate(event.start_time)}
                </TableCell>
                <TableCell>
                  {formatEventDate(event.end_time)}
                </TableCell>
                <TableCell>
                  {event.is_recurring ? (
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <Repeat className="h-3 w-3" />
                      Recorrente
                    </Badge>
                  ) : (
                    <Badge variant="outline">Único</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingEvent(event)}
                      title="Editar evento"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(event.id)}
                      title="Excluir evento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingEvent && (
        <EventFormDialog
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </>
  );
};
