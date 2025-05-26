
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Calendar, CalendarDays, Users, MapPin } from 'lucide-react';

export const EventsSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('upcoming');

  const filters = [
    { id: 'upcoming', label: 'Próximos' },
    { id: 'this-week', label: 'Esta Semana' },
    { id: 'this-month', label: 'Este Mês' },
    { id: 'past', label: 'Passados' },
  ];

  return (
    <div className="space-y-6">
      {/* Header com busca */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter.id)}
            className="whitespace-nowrap"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Estado vazio temporário */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Calendário de Eventos</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Fique por dentro dos próximos eventos da comunidade. Lives, workshops, 
            networking e muito mais!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-2xl">
            <div className="flex flex-col items-center p-4 border border-dashed rounded-lg">
              <CalendarDays className="h-8 w-8 text-muted-foreground mb-2" />
              <h4 className="font-medium mb-1">Lives Semanais</h4>
              <p className="text-sm text-muted-foreground text-center">
                Participe das lives toda semana
              </p>
            </div>
            <div className="flex flex-col items-center p-4 border border-dashed rounded-lg">
              <Users className="h-8 w-8 text-muted-foreground mb-2" />
              <h4 className="font-medium mb-1">Networking</h4>
              <p className="text-sm text-muted-foreground text-center">
                Eventos de conexão entre membros
              </p>
            </div>
            <div className="flex flex-col items-center p-4 border border-dashed rounded-lg">
              <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
              <h4 className="font-medium mb-1">Workshops</h4>
              <p className="text-sm text-muted-foreground text-center">
                Sessões práticas e hands-on
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
