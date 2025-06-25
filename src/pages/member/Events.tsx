
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

const Events = () => {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Eventos</h1>
        <p className="text-muted-foreground">
          Participe dos eventos da comunidade
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Workshop de IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                15/02/2024 - 14:00
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Online
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                45 participantes
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Events;
