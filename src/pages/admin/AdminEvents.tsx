
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
      {/* Aurora Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aurora-primary/5 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-br from-operational/10 to-strategy/10 blur-3xl animate-blob" />
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-tr from-revenue/10 to-aurora-primary/10 blur-3xl animate-blob animation-delay-2000" />
      
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
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
              className="aurora-focus gap-2 bg-card/50 backdrop-blur-sm"
            >
              <RefreshCw className="h-4 w-4" />
              {isLoading ? "Atualizando..." : "Atualizar"}
            </Button>
            
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="aurora-focus gap-2 bg-gradient-to-r from-aurora-primary to-operational hover:from-aurora-primary/90 hover:to-operational/90"
            >
              <Plus className="h-4 w-4" />
              Novo Evento
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="surface-elevated border-0 shadow-aurora transition-all duration-300 hover:shadow-aurora-strong group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Total de Eventos</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-aurora-primary/20 to-aurora-primary/10 transition-all duration-300 group-hover:from-aurora-primary/30 group-hover:to-aurora-primary/20">
                <Calendar className="h-4 w-4 text-aurora-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2 bg-gradient-to-r from-aurora-primary to-aurora-primary/80 bg-clip-text text-transparent">
                {totalEvents}
              </div>
              <p className="text-caption text-muted-foreground">
                {recurringEvents} recorrentes
              </p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-0 shadow-aurora transition-all duration-300 hover:shadow-aurora-strong group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Próximos Eventos</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-operational/20 to-operational/10 transition-all duration-300 group-hover:from-operational/30 group-hover:to-operational/20">
                <CalendarDays className="h-4 w-4 text-operational" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2 bg-gradient-to-r from-operational to-operational/80 bg-clip-text text-transparent">
                {upcomingEvents}
              </div>
              <p className="text-caption text-muted-foreground">
                Agendados
              </p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-0 shadow-aurora transition-all duration-300 hover:shadow-aurora-strong group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Eventos Hoje</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-strategy/20 to-strategy/10 transition-all duration-300 group-hover:from-strategy/30 group-hover:to-strategy/20">
                <Clock className="h-4 w-4 text-strategy" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2 bg-gradient-to-r from-strategy to-strategy/80 bg-clip-text text-transparent">
                {todayEvents}
              </div>
              <p className="text-caption text-muted-foreground">
                Acontecendo
              </p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-0 shadow-aurora transition-all duration-300 hover:shadow-aurora-strong group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Recorrentes</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-revenue/20 to-revenue/10 transition-all duration-300 group-hover:from-revenue/30 group-hover:to-revenue/20">
                <Repeat className="h-4 w-4 text-revenue" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2 bg-gradient-to-r from-revenue to-revenue/80 bg-clip-text text-transparent">
                {recurringEvents}
              </div>
              <p className="text-caption text-muted-foreground">
                Séries ativas
              </p>
            </CardContent>
          </Card>

          <Card className="surface-elevated border-0 shadow-aurora transition-all duration-300 hover:shadow-aurora-strong group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-label text-muted-foreground">Únicos</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-surface-accent/20 to-surface-accent/10 transition-all duration-300 group-hover:from-surface-accent/30 group-hover:to-surface-accent/20">
                <Users className="h-4 w-4 text-surface-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-heading-2 text-foreground mb-2 bg-gradient-to-r from-surface-accent to-surface-accent/80 bg-clip-text text-transparent">
                {singleEvents}
              </div>
              <p className="text-caption text-muted-foreground">
                Eventos únicos
              </p>
            </CardContent>
          </Card>
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
