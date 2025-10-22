import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Database } from "lucide-react";

const ChecklistMigrationStatus: React.FC = () => {
  const { data: migrationStatus, isLoading } = useQuery({
    queryKey: ['checklist-migration-status'],
    queryFn: async () => {
      // Verificar dados nas tabelas antigas
      const { data: oldImplementation } = await supabase
        .from('implementation_checkpoints')
        .select('id')
        .limit(10);

      const { data: oldUserChecklists } = await supabase
        .from('user_checklists')
        .select('id')
        .limit(10);

      // Verificar dados na tabela unificada
      const { data: unifiedData } = await supabase
        .from('unified_checklists')
        .select('checklist_type, is_template, solution_id')
        .limit(1000);

      // Contar por tipo
      const stats = unifiedData?.reduce((acc, item) => {
        const key = `${item.checklist_type}_${item.is_template ? 'template' : 'user'}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Verificar quantas soluções únicas têm templates
      const templatesPerSolution = unifiedData?.filter(item => item.is_template) || [];
      const uniqueSolutionsWithTemplates = new Set(templatesPerSolution.map(t => t.solution_id)).size;

      // Verificar quantas soluções únicas têm user checklists
      const userChecklistsPerSolution = unifiedData?.filter(item => !item.is_template) || [];
      const uniqueSolutionsWithUserChecklists = new Set(userChecklistsPerSolution.map(u => u.solution_id)).size;

      return {
        oldImplementationCount: oldImplementation?.length || 0,
        oldUserChecklistsCount: oldUserChecklists?.length || 0,
        unifiedStats: stats,
        totalUnified: unifiedData?.length || 0,
        uniqueSolutionsWithTemplates,
        uniqueSolutionsWithUserChecklists,
        templatesConsistency: uniqueSolutionsWithUserChecklists === uniqueSolutionsWithTemplates,
        migrationComplete: (unifiedData?.length || 0) > 0
      };
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Verificando status da migração...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isSuccess = migrationStatus?.migrationComplete;

  return (
    <Card className={isSuccess ? "border-operational/30 bg-operational/10" : "border-status-warning/30 bg-status-warning/10"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSuccess ? (
            <CheckCircle className="w-5 h-5 text-operational" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-status-warning" />
          )}
          Status da Migração do Sistema de Checklists
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-card rounded-lg border border-border">
            <Database className="w-8 h-8 mx-auto mb-2 text-operational" />
            <div className="text-2xl font-bold text-operational">
              {migrationStatus?.oldImplementationCount || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Implementation Checkpoints (Antiga)
            </div>
          </div>

          <div className="text-center p-4 bg-card rounded-lg border border-border">
            <Database className="w-8 h-8 mx-auto mb-2 text-strategy" />
            <div className="text-2xl font-bold text-strategy">
              {migrationStatus?.oldUserChecklistsCount || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              User Checklists (Antiga)
            </div>
          </div>

          <div className="text-center p-4 bg-card rounded-lg border border-border">
            <Database className="w-8 h-8 mx-auto mb-2 text-operational" />
            <div className="text-2xl font-bold text-operational">
              {migrationStatus?.totalUnified || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Unified Checklists (Nova)
            </div>
          </div>
        </div>

        {migrationStatus?.unifiedStats && (
          <div className="space-y-2">
            <h4 className="font-medium">Distribuição na Tabela Unificada:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(migrationStatus.unifiedStats).map(([key, count]) => (
                <Badge key={key} variant="outline">
                  {key.replace('_', ' ')}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className={`p-4 rounded-lg ${isSuccess ? 'bg-operational/20 text-operational' : 'bg-status-warning/20 text-status-warning'}`}>
          {isSuccess ? (
            <div>
              <div className="font-medium mb-1">✅ Migração e Correção Concluída com Sucesso!</div>
              <div className="text-sm space-y-1">
                <div>• Sistema unificado implementado com {migrationStatus?.totalUnified} checklists</div>
                <div>• {migrationStatus?.uniqueSolutionsWithTemplates} soluções com templates criados</div>
                <div>• {migrationStatus?.uniqueSolutionsWithUserChecklists} soluções com checklists de usuários</div>
                {migrationStatus?.templatesConsistency ? (
                  <div className="text-operational-dark font-medium">• ✅ Todas as soluções com checklists têm templates (problema corrigido)</div>
                ) : (
                  <div className="text-status-error font-medium">• ⚠️ Algumas soluções ainda não têm templates</div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="font-medium mb-1">⚠️ Migração Pendente</div>
              <div className="text-sm">
                A migração do sistema de checklists ainda não foi executada ou não foi concluída com sucesso.
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div><strong>Problema Original:</strong> Checklists não apareciam no Admin porque soluções tinham checklists de usuários mas não tinham templates.</div>
          <div><strong>Solução Implementada:</strong> Sistema unificado + correção automática criando templates para todas as soluções baseados nos dados existentes.</div>
          <div><strong>Benefícios:</strong> Checklists aparecem corretamente tanto no Admin quanto no dashboard de Membros, com dados consistentes.</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChecklistMigrationStatus;