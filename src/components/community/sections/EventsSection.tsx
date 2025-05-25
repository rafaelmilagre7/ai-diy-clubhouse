
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const EventsSection = () => {
  // Mock events data
  const events = [
    {
      id: 1,
      title: 'Workshop: Implementando IA em Pequenas Empresas',
      description: 'Aprenda estratégias práticas para implementar soluções de IA em negócios de pequeno e médio porte.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '19:00',
      location: 'Online via Zoom',
      attendees: 45,
      maxAttendees: 100,
      type: 'Workshop',
      featured: true
    },
    {
      id: 2,
      title: 'Networking: Profissionais de IA em São Paulo',
      description: 'Encontro presencial para networking entre profissionais de IA da região metropolitana de São Paulo.',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      time: '18:30',
      location: 'São Paulo, SP',
      attendees: 23,
      maxAttendees: 50,
      type: 'Networking',
      featured: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Eventos da Comunidade</h2>
          <p className="text-muted-foreground">Participe dos nossos encontros e workshops</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Criar Evento
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => (
          <Card key={event.id} className={`hover:shadow-lg transition-all duration-200 ${event.featured ? 'ring-2 ring-primary/20' : ''}`}>
            <CardContent className="p-6">
              {event.featured && (
                <Badge className="mb-4">Evento em Destaque</Badge>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <Badge variant="outline">{event.type}</Badge>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {format(event.date, "d 'de' MMMM", { locale: ptBR })}
                  </div>
                  <div className="text-sm font-medium">{event.time}</div>
                </div>
              </div>
              
              <h3 className="font-semibold text-lg mb-3">{event.title}</h3>
              <p className="text-muted-foreground mb-4">{event.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(event.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {event.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {event.attendees}/{event.maxAttendees} participantes
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1">Participar</Button>
                <Button variant="outline">Detalhes</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Calendar View */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4">Calendário de Eventos</h3>
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <p>Calendário interativo será implementado aqui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
