
import React, { useState } from "react";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminStatsCard } from "@/components/admin/ui/AdminStatsCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  CalendarDays, 
  MapPin, 
  Users, 
  Clock,
  Repeat,
  Plus,
  Filter,
  RefreshCw,
  Search
} from "lucide-react";
import { EventsTable } from "@/components/admin/events/EventsTable";
import { EventFormDialog } from "@/components/admin/events/EventFormDialog";
import { useEvents } from "@/hooks/useEvents";
import { type EventFormData } from "@/components/admin/events/form/EventFormSchema";

const AdminEvents = () => {
  const { data: events = [], isLoading, refetch } = useEvents();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'recurring' | 'single'>('all');

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
  };

  // Calculate stats
  const totalEvents = events.length;
  const recurringEvents = events.filter(event => event.is_recurring).length;
  const singleEvents = events.filter(event => !event.is_recurring).length;
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    const now = new Date();
    return eventDate > now;
  }).length;

  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  }).length;

  // Filter and search logic
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'recurring' && event.is_recurring) ||
                         (filterType === 'single' && !event.is_recurring);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aurora-primary/5 via-transparent to-transparent" />
      
      <div className="relative p-6 md:p-8 space-y-8">
        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-aurora-primary/20 to-operational/20 backdrop-blur-sm border border-aurora-primary/20">
                <Calendar className="h-8 w-8 text-aurora-primary" />
              </div>
              <div>
                <h1 className="text-display text-foreground bg-gradient-to-r from-aurora-primary to-operational bg-clip-text text-transparent">
                  Gerenciar Eventos
                </h1>
                <p className="text-body-large text-muted-foreground">
                  Adicione e gerencie {totalEvents} eventos da comunidade
                </p>
              </div>
            </div>
            
            {/* Quick Stats Badges */}
            <div className="flex gap-4">
              <Badge variant="secondary" className="surface-elevated">
                {upcomingEvents} Próximos
              </Badge>
              <Badge variant="secondary" className="surface-elevated">
                {todayEvents} Hoje
              </Badge>
              <Badge variant="secondary" className="surface-elevated">
                {recurringEvents} Recorrentes
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <AdminButton
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
              icon={<RefreshCw />}
            >
              {isLoading ? "Atualizando..." : "Atualizar"}
            </AdminButton>
            
            <AdminButton
              onClick={() => setShowCreateDialog(true)}
              icon={<Plus />}
            >
              Novo Evento
            </AdminButton>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <AdminStatsCard label="Total de Eventos" value={totalEvents} icon={Calendar} variant="primary" description={`${recurringEvents} recorrentes`} />
          <AdminStatsCard label="Próximos Eventos" value={upcomingEvents} icon={CalendarDays} variant="success" description="Agendados" />
          <AdminStatsCard label="Eventos Hoje" value={todayEvents} icon={Clock} variant="info" description="Acontecendo" />
          <AdminStatsCard label="Recorrentes" value={recurringEvents} icon={Repeat} variant="success" description="Séries ativas" />
          <AdminStatsCard label="Únicos" value={singleEvents} icon={Users} variant="info" description="Eventos únicos" />
        </div>

        {/* Enhanced Filters */}
        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader>
            <CardTitle className="text-heading-3 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos por título ou descrição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="aurora-focus pl-10"
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'recurring' | 'single')}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background aurora-focus"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="recurring">Apenas recorrentes</option>
                  <option value="single">Apenas únicos</option>
                </select>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
                className="aurora-focus"
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Events Table */}
        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader>
            <CardTitle className="text-heading-3 flex items-center justify-between">
              <span>Lista de Eventos</span>
              <Badge variant="outline" className="text-xs">
                {filteredEvents.length} de {totalEvents}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EventsTable events={filteredEvents} />
          </CardContent>
        </Card>
      </div>

      {showCreateDialog && (
        <EventFormDialog onClose={handleCloseDialog} />
      )}
    </div>
  );
};

export default AdminEvents;
