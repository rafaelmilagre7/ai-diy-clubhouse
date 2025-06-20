
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { AlertTriangle, CheckCircle, Clock, Plus } from 'lucide-react';

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  created_by: string;
  created_at: string;
  resolved_at?: string;
  metadata?: any;
}

interface SecurityIncidentManagerProps {
  incidents: SecurityIncident[];
}

export const SecurityIncidentManager = ({ incidents }: SecurityIncidentManagerProps) => {
  const [localIncidents, setLocalIncidents] = useState<SecurityIncident[]>(incidents || []);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    severity: 'medium' as SecurityIncident['severity']
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (incidents) {
      setLocalIncidents(incidents);
    }
  }, [incidents]);

  const resolveIncident = async (id: string) => {
    try {
      const { error } = await supabase
        .from('security_incidents')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString()
        } as any)
        .eq('id', id as any);

      if (error) throw error;

      setLocalIncidents(prev => 
        prev.map(incident => 
          incident.id === id 
            ? { ...incident, status: 'resolved' as const, resolved_at: new Date().toISOString() }
            : incident
        )
      );

      toast({
        title: "Incidente resolvido",
        description: "O incidente foi marcado como resolvido.",
      });
    } catch (error: any) {
      console.error('Erro ao resolver incidente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível resolver o incidente.",
        variant: "destructive",
      });
    }
  };

  const createIncident = async () => {
    if (!user || !newIncident.title.trim() || !newIncident.description.trim()) return;

    try {
      const { error } = await supabase
        .from('security_incidents')
        .insert({
          title: newIncident.title,
          description: newIncident.description,
          severity: newIncident.severity,
          created_by: user.id,
          metadata: { manual_creation: true }
        } as any);

      if (error) throw error;

      setNewIncident({ title: '', description: '', severity: 'medium' });
      setShowCreateForm(false);

      toast({
        title: "Incidente criado",
        description: "O incidente foi criado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao criar incidente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o incidente.",
        variant: "destructive",
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gerenciamento de Incidentes</h3>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Incidente
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Incidente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Título do incidente"
              value={newIncident.title}
              onChange={(e) => setNewIncident(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Descrição detalhada do incidente"
              value={newIncident.description}
              onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
            />
            <select
              value={newIncident.severity}
              onChange={(e) => setNewIncident(prev => ({ ...prev, severity: e.target.value as SecurityIncident['severity'] }))}
              className="w-full p-2 border rounded"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
            <div className="flex gap-2">
              <Button onClick={createIncident}>Criar</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {localIncidents.map((incident) => (
          <Card key={incident.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(incident.severity)}
                    <h4 className="font-medium">{incident.title}</h4>
                    <Badge variant={getSeverityColor(incident.severity) as any}>
                      {incident.severity}
                    </Badge>
                    <Badge variant={incident.status === 'resolved' ? 'default' : 'secondary'}>
                      {incident.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {incident.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Criado em: {new Date(incident.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                {incident.status !== 'resolved' && (
                  <Button
                    size="sm"
                    onClick={() => resolveIncident(incident.id)}
                  >
                    Resolver
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
