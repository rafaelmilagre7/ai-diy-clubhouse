
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Shield,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useToastModern } from '@/hooks/useToastModern';

interface SecurityIncident {
  id: string;
  title: string;
  description?: string;
  severity: string;
  status: string;
  assigned_to?: string;
  created_by?: string;
  related_logs: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

interface SecurityIncidentManagerProps {
  incidents: SecurityIncident[];
}

export const SecurityIncidentManager = ({ incidents }: SecurityIncidentManagerProps) => {
  const { user } = useAuth();
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const { showSuccess, showError } = useToastModern();

  // Filtrar incidentes
  const filteredIncidents = incidents.filter(incident => {
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'investigating': return 'default';
      case 'resolved': return 'default';
      case 'false_positive': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <XCircle className="h-4 w-4" />;
      case 'investigating': return <Eye className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'false_positive': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const updateIncidentStatus = async (incidentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('security_incidents')
        .update({ 
          status,
          resolved_at: ['resolved', 'false_positive'].includes(status) ? new Date().toISOString() : null
        })
        .eq('id', incidentId);

      if (error) throw error;

      showSuccess('Status atualizado', 'Status do incidente atualizado com sucesso');
      
      // Atualizar incidente selecionado se for o mesmo
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showError('Erro ao atualizar', 'Erro ao atualizar status do incidente');
    }
  };

  const createIncident = async (data: {
    title: string;
    description: string;
    severity: string;
  }) => {
    try {
      const { error } = await supabase
        .from('security_incidents')
        .insert({
          title: data.title,
          description: data.description,
          severity: data.severity,
          created_by: user?.id,
          metadata: { manual_creation: true }
        });

      if (error) throw error;

      showSuccess('Incidente criado', 'Incidente criado com sucesso');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar incidente:', error);
      showError('Erro ao criar', 'Erro ao criar incidente');
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Controles */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gerenciamento de Incidentes</h3>
          <p className="text-sm text-muted-foreground">
            {filteredIncidents.length} incidente(s) encontrado(s)
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Incidente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Incidente</DialogTitle>
            </DialogHeader>
            <IncidentForm onSubmit={createIncident} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Aberto</SelectItem>
            <SelectItem value="investigating">Investigando</SelectItem>
            <SelectItem value="resolved">Resolvido</SelectItem>
            <SelectItem value="false_positive">Falso Positivo</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="critical">Crítica</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Incidentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Incidentes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum incidente encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedIncident?.id === incident.id 
                        ? 'bg-muted border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedIncident(incident)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(incident.severity) as any}>
                          {incident.severity}
                        </Badge>
                        <Badge variant={getStatusColor(incident.status) as any}>
                          {getStatusIcon(incident.status)}
                          {incident.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(incident.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-sm mb-1">
                      {incident.title}
                    </h4>
                    
                    {incident.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {incident.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detalhes do Incidente */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Incidente</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedIncident ? (
              <IncidentDetails 
                incident={selectedIncident}
                onStatusUpdate={updateIncidentStatus}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um incidente para ver os detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Componente para formulário de criação
const IncidentForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="severity">Severidade</Label>
        <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="critical">Crítica</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button type="submit" className="w-full">
        Criar Incidente
      </Button>
    </form>
  );
};

// Componente para detalhes do incidente
const IncidentDetails = ({ 
  incident, 
  onStatusUpdate 
}: { 
  incident: SecurityIncident;
  onStatusUpdate: (id: string, status: string) => void;
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-lg mb-2">{incident.title}</h3>
        <div className="flex gap-2 mb-3">
          <Badge variant={incident.severity === 'critical' ? 'destructive' : 'default'}>
            {incident.severity}
          </Badge>
          <Badge variant="outline">
            {incident.status}
          </Badge>
        </div>
      </div>
      
      {incident.description && (
        <div>
          <h4 className="font-medium mb-1">Descrição</h4>
          <p className="text-sm text-muted-foreground">{incident.description}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-medium mb-1">Criado em</h4>
          <p className="text-muted-foreground">
            {new Date(incident.created_at).toLocaleString('pt-BR')}
          </p>
        </div>
        
        {incident.resolved_at && (
          <div>
            <h4 className="font-medium mb-1">Resolvido em</h4>
            <p className="text-muted-foreground">
              {new Date(incident.resolved_at).toLocaleString('pt-BR')}
            </p>
          </div>
        )}
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Atualizar Status</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusUpdate(incident.id, 'investigating')}
            disabled={incident.status === 'investigating'}
          >
            Investigar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusUpdate(incident.id, 'resolved')}
            disabled={incident.status === 'resolved'}
          >
            Resolver
          </Button>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full mt-2"
          onClick={() => onStatusUpdate(incident.id, 'false_positive')}
          disabled={incident.status === 'false_positive'}
        >
          Marcar como Falso Positivo
        </Button>
      </div>
      
      {incident.metadata && Object.keys(incident.metadata).length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Metadados</h4>
          <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
            {JSON.stringify(incident.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
