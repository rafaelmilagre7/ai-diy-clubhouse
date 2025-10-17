
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatBrazilianDateTime } from "@/utils/timezoneUtils";
import { 
  Edit, 
  Trash2, 
  Repeat, 
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Image
} from "lucide-react";
import { useState } from "react";
import { useEvents } from "@/hooks/useEvents";
import { EventFormDialog } from "./EventFormDialog";
import { RecurrenceDeleteDialog } from "./RecurrenceDeleteDialog";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Event } from "@/types/events";
import { motion } from "framer-motion";

interface EventsTableProps {
  events?: Event[];
}

export const EventsTable = ({ events: propEvents }: EventsTableProps) => {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [showRecurrenceDeleteDialog, setShowRecurrenceDeleteDialog] = useState(false);
  
  // Use propEvents if provided, otherwise fetch from hook
  const { data: hookEvents = [], isLoading, error } = useEvents();
  const events = propEvents || hookEvents;
  
  const queryClient = useQueryClient();

  const handleDeleteClick = (event: Event) => {
    if (event.is_recurring || event.parent_event_id) {
      setDeletingEvent(event);
      setShowRecurrenceDeleteDialog(true);
    } else {
      const confirmed = window.confirm("Tem certeza que deseja excluir este evento?");
      if (confirmed) {
        handleDeleteConfirmed(event.id, 'this');
      }
    }
  };

  const handleRecurrenceDeleteChoice = (choice: 'this' | 'future' | 'all') => {
    if (deletingEvent) {
      handleDeleteConfirmed(deletingEvent.id, choice);
    }
    setShowRecurrenceDeleteDialog(false);
    setDeletingEvent(null);
  };

  const handleDeleteConfirmed = async (eventId: string, choice: 'this' | 'future' | 'all') => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      if (choice === 'this') {
        const { error } = await supabase
          .from("events")
          .delete()
          .eq("id", eventId);
        
        if (error) throw error;
        toast.success("Evento excluído com sucesso!");
        
      } else if (choice === 'future') {
        const parentId = event.parent_event_id || event.id;
        
        const { error } = await supabase
          .from("events")
          .delete()
          .or(`id.eq.${eventId},and(parent_event_id.eq.${parentId},start_time.gte.${event.start_time})`);
        
        if (error) throw error;
        toast.success("Eventos futuros excluídos com sucesso!");
        
      } else if (choice === 'all') {
        const parentId = event.parent_event_id || event.id;
        
        const { error } = await supabase
          .from("events")
          .delete()
          .or(`id.eq.${parentId},parent_event_id.eq.${parentId}`);
        
        if (error) throw error;
        toast.success("Série de eventos excluída com sucesso!");
      }

      queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      toast.error("Erro ao excluir evento");
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isUpcoming = date > now;
    const isToday = date.toDateString() === now.toDateString();
    
    return {
      formatted: formatBrazilianDateTime(dateString),
      isUpcoming,
      isToday,
      isPast: date < now && !isToday
    };
  };

  if (isLoading && !propEvents) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="surface-elevated border-0 shadow-aurora">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="skeleton h-16 w-16 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error && !propEvents) {
    return (
      <div className="text-center py-12">
        <div className="p-4 rounded-xl gradient-error-card backdrop-blur-sm border border-destructive/20 inline-block mb-4">
          <Trash2 className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-heading-3 text-destructive mb-2">Erro ao carregar eventos</h3>
        <p className="text-body text-muted-foreground">
          Tente recarregar a página ou entre em contato com o suporte
        </p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 rounded-xl gradient-muted-card backdrop-blur-sm border border-muted/20 inline-block mb-4">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-heading-3 text-foreground mb-2">Nenhum evento encontrado</h3>
        <p className="text-body text-muted-foreground">
          Clique em "Novo Evento" para criar o primeiro evento da comunidade
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => {
          const startDate = formatEventDate(event.start_time);
          const endDate = formatEventDate(event.end_time);
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.1,
                ease: 'easeOut' 
              }}
            >
              <Card className="surface-elevated border-0 shadow-aurora transition-smooth hover:shadow-aurora-strong group h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    {/* Event Image or Icon */}
                    <div className="flex-shrink-0">
                      {event.cover_image_url ? (
                        <div className="relative">
                          <img 
                            src={event.cover_image_url} 
                            alt={event.title}
                            className="w-16 h-16 rounded-lg object-cover border border-border/30"
                          />
                          <div className="absolute -top-1 -right-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-1 py-0 ${
                                startDate.isToday 
                                  ? 'bg-strategy text-strategy border-strategy/30' 
                                  : startDate.isUpcoming 
                                    ? 'bg-operational text-operational border-operational/30'
                                    : 'bg-muted text-muted-foreground border-muted/30'
                              }`}
                            >
                              {startDate.isToday ? 'Hoje' : startDate.isUpcoming ? 'Próximo' : 'Passado'}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className={`
                          p-3 rounded-lg transition-smooth group-hover:scale-110
                          ${startDate.isToday 
                            ? 'gradient-revenue-card group-hover:from-strategy/30 group-hover:to-revenue/30' 
                            : startDate.isUpcoming
                              ? 'gradient-operational-card group-hover:from-operational/30 group-hover:to-aurora-primary/30'
                              : 'gradient-muted-card group-hover:from-muted/30 group-hover:to-muted/20'
                          }
                        `}>
                          <Calendar className={`h-6 w-6 ${
                            startDate.isToday 
                              ? 'text-strategy' 
                              : startDate.isUpcoming 
                                ? 'text-operational'
                                : 'text-muted-foreground'
                          }`} />
                        </div>
                      )}
                    </div>
                    
                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-body-large font-semibold text-foreground line-clamp-2 group-hover:text-aurora-primary transition-colors">
                          {event.title}
                        </h3>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingEvent(event)}
                            className="h-8 w-8 p-0 opacity-60 hover:opacity-100 hover:bg-aurora-primary/10 hover:text-aurora-primary transition-all"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(event)}
                            className="h-8 w-8 p-0 opacity-60 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="text-body-small text-muted-foreground line-clamp-2 mt-1">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Date and Time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-body-small">
                      <Clock className="h-3 w-3 text-aurora-primary" />
                      <span className={`font-mono ${
                        startDate.isToday 
                          ? 'text-strategy font-semibold' 
                          : startDate.isUpcoming 
                            ? 'text-operational'
                            : 'text-muted-foreground'
                      }`}>
                        {startDate.formatted}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-body-small text-muted-foreground">
                      <div className="h-3 w-3" /> {/* Spacer */}
                      <span className="font-mono">até {endDate.formatted}</span>
                    </div>
                  </div>

                  {/* Location */}
                  {(event.physical_location || event.location_link) && (
                    <div className="flex items-center gap-2 text-body-small text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {event.physical_location || "Online"}
                      </span>
                      {event.location_link && (
                        <ExternalLink className="h-3 w-3 text-aurora-primary cursor-pointer" />
                      )}
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className={
                        event.is_recurring
                          ? 'bg-aurora-primary/10 text-aurora-primary border-aurora-primary/30 flex items-center gap-1'
                          : 'bg-operational/10 text-operational border-operational/30'
                      }
                    >
                      {event.is_recurring && <Repeat className="h-3 w-3" />}
                      {event.is_recurring ? 'Recorrente' : 'Único'}
                    </Badge>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingEvent(event)}
                      className="flex-1 h-8 text-xs aurora-focus"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    
                    {event.location_link && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(event.location_link, '_blank')}
                        className="flex-1 h-8 text-xs aurora-focus"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Acessar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {editingEvent && (
        <EventFormDialog
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}

      {showRecurrenceDeleteDialog && deletingEvent && (
        <RecurrenceDeleteDialog
          isOpen={showRecurrenceDeleteDialog}
          onClose={() => {
            setShowRecurrenceDeleteDialog(false);
            setDeletingEvent(null);
          }}
          onChoice={handleRecurrenceDeleteChoice}
          eventTitle={deletingEvent.title}
        />
      )}
    </>
  );
};
