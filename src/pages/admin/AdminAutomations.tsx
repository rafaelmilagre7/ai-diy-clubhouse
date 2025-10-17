import { useState } from "react";
import { Plus, Play, Pause, Edit, Trash2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAutomationRules } from "@/hooks/useAutomationRules";
import { AutomationCard } from "@/components/automations/AutomationCard";
import { AdminTable } from "@/components/admin/ui/AdminTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  rule_type: string;
  is_active: boolean;
  conditions: any;
  actions: any;
  priority: number;
  created_at: string;
  updated_at: string;
}

const AdminAutomations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: rules, isLoading, refetch } = useAutomationRules();

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active: !isActive })
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "Regra atualizada",
        description: `Regra ${!isActive ? 'ativada' : 'desativada'} com sucesso`,
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a regra",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta regra?")) return;

    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "Regra deletada",
        description: "Regra removida com sucesso",
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar a regra",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: 'name' as keyof AutomationRule,
      label: 'Nome',
      render: (rule: AutomationRule) => (
        <div>
          <div className="font-medium">{rule.name}</div>
          <div className="text-sm text-muted-foreground truncate">
            {rule.description}
          </div>
        </div>
      ),
    },
    {
      key: 'rule_type' as keyof AutomationRule,
      label: 'Tipo',
      render: (rule: AutomationRule) => (
        <Badge variant="outline">
          {rule.rule_type}
        </Badge>
      ),
    },
    {
      key: 'is_active' as keyof AutomationRule,
      label: 'Status',
      render: (rule: AutomationRule) => (
        <Badge variant={rule.is_active ? "default" : "secondary"}>
          {rule.is_active ? 'Ativa' : 'Inativa'}
        </Badge>
      ),
    },
    {
      key: 'priority' as keyof AutomationRule,
      label: 'Prioridade',
      render: (rule: AutomationRule) => rule.priority,
    },
    {
      key: 'actions' as keyof AutomationRule,
      label: 'Ações',
      render: (rule: AutomationRule) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={rule.is_active ? "outline" : "default"}
            onClick={() => handleToggleRule(rule.id, rule.is_active)}
          >
            {rule.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/admin/automations/${rule.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteRule(rule.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const stats = {
    total: rules?.length || 0,
    active: rules?.filter(r => r.is_active).length || 0,
    inactive: rules?.filter(r => !r.is_active).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automações da Hubla</h1>
          <p className="text-muted-foreground">
            Crie regras automatizadas para eventos da Hubla - envie convites personalizados quando houver novas vendas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/automations/logs')}
          >
            <Activity className="mr-2 h-4 w-4" />
            Ver Logs
          </Button>
          <Button onClick={() => navigate('/admin/automations/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Regra
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Regras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regras Inativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Regras de Automação da Hubla</CardTitle>
          <CardDescription>
            Configure automações para responder automaticamente a eventos da Hubla como novas vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminTable
            data={rules || []}
            columns={columns}
            loading={isLoading}
            emptyState={
              <div className="text-center py-12 px-4">
                <div className="mx-auto w-16 h-16 bg-hubla-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Activity className="h-8 w-8 text-hubla-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Comece criando sua primeira automação</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Configure regras que respondem automaticamente a eventos da Hubla, como enviar convites personalizados quando há uma nova venda.
                </p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-1.5 h-1.5 bg-hubla-primary rounded-full"></div>
                    <span>Eventos da Hubla detectados automaticamente</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-1.5 h-1.5 bg-hubla-primary rounded-full"></div>
                    <span>Convites enviados por email e WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-1.5 h-1.5 bg-hubla-primary rounded-full"></div>
                    <span>Templates personalizáveis por produto</span>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/admin/automations/new')} 
                  className="mt-6"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Nova Regra
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAutomations;