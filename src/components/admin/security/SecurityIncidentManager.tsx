
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
  resolved_at?: string;
  created_by: string;
  metadata: any;
}

export const SecurityIncidentManager = () => {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    severity: 'medium'
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('security_incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar incidentes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os incidentes de segurança.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

      await fetchIncidents();
      toast({
        title: "Incidente resolvido",
        description: "O incidente foi marcado como resolvido.",
      });
    } catch (error) {
      console.error('Erro ao resolver incidente:', error);
      toast({
        title: "Erro",
        description: "Erro ao resolver o incidente.",
        variant: "destructive",
      });
    }
  };

  const createIncident = async () => {
    if (!newIncident.title || !newIncident.description || !user) return;

    try {
      setCreating(true);
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
      await fetchIncidents();
      toast({
        title: "Incidente criado",
        description: "O incidente de segurança foi registrado.",
      });
    } catch (error) {
      console.error('Erro ao criar incidente:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar o incidente.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'investigating': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <X className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
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
          <Select 
            value={newIncident.severity} 
            onValueChange={(value) => setNewIncident(prev => ({ ...prev, severity: value }))}
          >
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
          <Button 
            onClick={createIncident} 
            disabled={creating || !newIncident.title || !newIncident.description}
          >
            {creating ? 'Criando...' : 'Criar Incidente'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incidentes de Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Carregando incidentes...</div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Nenhum incidente registrado.
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(incident.status)}
                        <h3 className="font-medium">{incident.title}</h3>
                        <Badge variant={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <Badge variant="outline">{incident.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {incident.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Criado em: {new Date(incident.created_at).toLocaleString('pt-BR')}
                        {incident.resolved_at && (
                          <span className="ml-4">
                            Resolvido em: {new Date(incident.resolved_at).toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
