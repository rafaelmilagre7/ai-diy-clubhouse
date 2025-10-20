import { useState } from "react";
import { Plus, Play, Pause, Edit, Trash2, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminStatsCard } from "@/components/admin/ui/AdminStatsCard";
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
          <AdminButton
            size="sm"
            variant={rule.is_active ? "outline" : "default"}
            onClick={() => handleToggleRule(rule.id, rule.is_active)}
            icon={rule.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          />
          <AdminButton
            size="sm"
            variant="outline"
            onClick={() => navigate(`/admin/automations/${rule.id}`)}
            icon={<Edit className="h-4 w-4" />}
          />
          <AdminButton
            size="sm"
            variant="outline"
            onClick={() => handleDeleteRule(rule.id)}
            icon={<Trash2 className="h-4 w-4" />}
          />
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-aurora-primary/5 p-6 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aurora-primary/5 via-transparent to-transparent" />
      
      <div className="relative space-y-8">
        {/* Modern Header with Aurora Style */}
        <div className="aurora-glass rounded-2xl p-8 border border-aurora-primary/20 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-16 bg-gradient-to-b from-aurora-primary via-operational to-strategy rounded-full aurora-glow"></div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-aurora-primary/20 to-operational/10 aurora-glass">
                      <Activity className="h-6 w-6 text-aurora-primary" />
                    </div>
                    <h1 className="text-4xl font-bold aurora-text-gradient">
                      Automações da Hubla
                    </h1>
                  </div>
                  <p className="text-lg text-muted-foreground font-medium">
                    Crie regras automatizadas para eventos da Hubla - envie convites personalizados quando houver novas vendas
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <AdminButton
                variant="outline"
                size="lg"
                onClick={() => navigate('/admin/automations/logs')}
                icon={<Activity />}
              >
                Ver Logs
              </AdminButton>
              <AdminButton 
                size="lg"
                onClick={() => navigate('/admin/automations/new')}
                icon={<Plus />}
              >
                Nova Regra
              </AdminButton>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdminStatsCard
            label="Total de Regras"
            value={stats.total}
            icon={Activity}
            variant="primary"
            description="Regras configuradas"
          />
          
          <AdminStatsCard
            label="Regras Ativas"
            value={stats.active}
            icon={Play}
            variant="success"
            description="Em execução"
          />
          
          <AdminStatsCard
            label="Regras Inativas"
            value={stats.inactive}
            icon={Pause}
            variant="warning"
            description="Pausadas"
          />
        </div>

        {/* Rules Table */}
        <AdminCard
          title="Regras de Automação da Hubla"
          subtitle="Configure automações para responder automaticamente a eventos da Hubla como novas vendas"
          variant="elevated"
          className="animate-fade-in"
        >
          <AdminTable
            data={rules || []}
            columns={columns}
            loading={isLoading}
            emptyState={
              <div className="text-center py-12 px-4">
                <div className="mx-auto w-16 h-16 bg-aurora-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Activity className="h-8 w-8 text-aurora-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Comece criando sua primeira automação</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Configure regras que respondem automaticamente a eventos da Hubla, como enviar convites personalizados quando há uma nova venda.
                </p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-1.5 h-1.5 bg-aurora-primary rounded-full"></div>
                    <span>Eventos da Hubla detectados automaticamente</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-1.5 h-1.5 bg-aurora-primary rounded-full"></div>
                    <span>Convites enviados por email e WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-1.5 h-1.5 bg-aurora-primary rounded-full"></div>
                    <span>Templates personalizáveis por produto</span>
                  </div>
                </div>
                <AdminButton 
                  onClick={() => navigate('/admin/automations/new')} 
                  className="mt-6"
                  icon={<Plus />}
                >
                  Criar Nova Regra
                </AdminButton>
              </div>
            }
          />
        </AdminCard>
      </div>
    </div>
  );
};

export default AdminAutomations;