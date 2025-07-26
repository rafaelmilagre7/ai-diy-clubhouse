
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBrazilianDateTime } from "@/utils/timezoneUtils";
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

  if (isLoading) {
    return (
      <div className="surface-elevated rounded-xl border border-border/50 p-12">
        <div className="flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-shimmer loading-skeleton w-16 h-16 rounded-full mx-auto" />
            <div className="space-y-2">
              <div className="text-body-large text-text-primary">Carregando eventos...</div>
              <div className="text-body-small text-text-muted">Aguarde um momento</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface-elevated rounded-xl border border-destructive/20 p-12">
        <div className="flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="p-3 rounded-full bg-destructive/10 border border-destructive/20 w-fit mx-auto">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <div className="space-y-2">
              <div className="text-body-large text-destructive">Erro ao carregar eventos</div>
              <div className="text-body-small text-text-muted">
                Tente recarregar a página
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="surface-elevated rounded-xl border border-border/50 p-12">
        <div className="flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="p-3 rounded-full bg-viverblue/10 border border-viverblue/20 w-fit mx-auto">
              <Edit className="w-6 h-6 text-viverblue" />
            </div>
            <div className="space-y-2">
              <div className="text-body-large text-text-primary">Nenhum evento encontrado</div>
              <div className="text-body-small text-text-muted">
                Clique em "Novo Evento" para criar o primeiro evento
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="surface-elevated rounded-xl border border-border/50 overflow-hidden shadow-aurora">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 bg-surface-overlay/50">
              <TableHead className="text-text-primary font-semibold">Título</TableHead>
              <TableHead className="text-text-primary font-semibold">Data/Hora Início</TableHead>
              <TableHead className="text-text-primary font-semibold">Data/Hora Fim</TableHead>
              <TableHead className="text-text-primary font-semibold">Tipo</TableHead>
              <TableHead className="text-right text-text-primary font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event, index) => (
              <TableRow 
                key={event.id} 
                className="border-border/30 hover:bg-surface-overlay/30 transition-colors duration-200"
              >
                <TableCell className="font-medium text-text-primary py-4">
                  <div className="flex items-center gap-3">
                    {event.cover_image_url && (
                      <img 
                        src={event.cover_image_url} 
                        alt={event.title}
                        className="w-8 h-8 rounded object-cover border border-border/50"
                      />
                    )}
                    <span>{event.title}</span>
                  </div>
                </TableCell>
                <TableCell className="text-text-secondary py-4">
                  <div className="font-mono text-sm">
                    {formatBrazilianDateTime(event.start_time)}
                  </div>
                </TableCell>
                <TableCell className="text-text-secondary py-4">
                  <div className="font-mono text-sm">
                    {formatBrazilianDateTime(event.end_time)}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {event.is_recurring ? (
                    <Badge variant="outline" className="flex items-center gap-1 w-fit bg-viverblue/10 text-viverblue border-viverblue/30">
                      <Repeat className="h-3 w-3" />
                      Recorrente
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-operational/10 text-operational border-operational/30">
                      Único
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right py-4">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingEvent(event)}
                      title="Editar evento"
                      className="hover:bg-viverblue/10 hover:border-viverblue/30 hover:text-viverblue transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(event.id)}
                      title="Excluir evento"
                      className="hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-colors"
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
