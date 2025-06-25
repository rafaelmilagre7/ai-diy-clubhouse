
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

const Events = () => {
  const events = [
    {
      id: '1',
      title: 'Workshop: IA Generativa para Empresas',
      date: '25/01/2024',
      time: '14:00',
      location: 'Online',
      attendees: 45,
      maxAttendees: 50,
      status: 'confirmed'
    },
    {
      id: '2',
      title: 'Webinar: Futuro da Automação',
      date: '30/01/2024',
      time: '19:00',
      location: 'Online',
      attendees: 120,
      maxAttendees: 200,
      status: 'available'
    },
    {
      id: '3',
      title: 'Encontro Presencial - São Paulo',
      date: '05/02/2024',
      time: '18:30',
      location: 'São Paulo, SP',
      attendees: 15,
      maxAttendees: 30,
      status: 'available'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'available': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'available': return 'Disponível';
      default: return 'Indisponível';
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Eventos</h1>
        <p className="text-muted-foreground">
          Participe de workshops, webinars e encontros da comunidade
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {event.attendees}/{event.maxAttendees} participantes
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant={getStatusColor(event.status)}>
                    {getStatusText(event.status)}
                  </Badge>
                </div>
                
                <Button 
                  className="w-full" 
                  disabled={event.status === 'confirmed'}
                >
                  {event.status === 'confirmed' ? 'Já Inscrito' : 'Inscrever-se'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Events;
