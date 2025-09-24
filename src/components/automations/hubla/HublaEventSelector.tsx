import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Info } from "lucide-react";
import { HUBLA_EVENT_TYPES } from "@/hooks/useHublaEvents";

interface HublaEventSelectorProps {
  selectedEvent: string;
  onEventChange: (eventType: string) => void;
}

export const HublaEventSelector = ({ selectedEvent, onEventChange }: HublaEventSelectorProps) => {
  const selectedEventData = HUBLA_EVENT_TYPES.find(event => event.value === selectedEvent);
  
  const eventsByCategory = HUBLA_EVENT_TYPES.reduce((acc, event) => {
    if (!acc[event.category]) {
      acc[event.category] = [];
    }
    acc[event.category].push(event);
    return acc;
  }, {} as Record<string, typeof HUBLA_EVENT_TYPES>);

  return (
    <Card className="border-hubla">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-hubla-primary" />
          <CardTitle className="text-hubla-primary">Evento Hubla</CardTitle>
        </div>
        <CardDescription>
          Selecione o evento da Hubla que deve acionar esta automação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Select value={selectedEvent} onValueChange={onEventChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um evento da Hubla..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(eventsByCategory).map(([category, events]) => (
                <div key={category}>
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground capitalize">
                    {category}
                  </div>
                  {events.map(event => (
                    <SelectItem key={event.value} value={event.value}>
                      <div className="flex items-center gap-2">
                        <span>{event.icon}</span>
                        <div>
                          <div className="font-medium">{event.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {event.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedEventData && (
          <div className="p-4 bg-hubla-accent/10 rounded-lg border border-hubla-accent/20">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{selectedEventData.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-hubla-primary">
                    {selectedEventData.label}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {selectedEventData.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedEventData.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-hubla-primary">
                  <Info className="h-3 w-3" />
                  <span>Evento técnico: {selectedEventData.value}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};