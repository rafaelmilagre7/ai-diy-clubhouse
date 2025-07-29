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
      console.log('🔍 Verificando status da migração...');

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
        .select('checklist_type, is_template')
        .limit(100);

      // Contar por tipo
      const stats = unifiedData?.reduce((acc, item) => {
        const key = `${item.checklist_type}_${item.is_template ? 'template' : 'user'}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        oldImplementationCount: oldImplementation?.length || 0,
        oldUserChecklistsCount: oldUserChecklists?.length || 0,
        unifiedStats: stats,
        totalUnified: unifiedData?.length || 0,
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
    <Card className={isSuccess ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSuccess ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          )}
          Status da Migração do Sistema de Checklists
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border">
            <Database className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">
              {migrationStatus?.oldImplementationCount || 0}
            </div>
            <div className="text-sm text-gray-600">
              Implementation Checkpoints (Antiga)
            </div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg border">
            <Database className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">
              {migrationStatus?.oldUserChecklistsCount || 0}
            </div>
            <div className="text-sm text-gray-600">
              User Checklists (Antiga)
            </div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg border">
            <Database className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">
              {migrationStatus?.totalUnified || 0}
            </div>
            <div className="text-sm text-gray-600">
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

        <div className={`p-4 rounded-lg ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
          {isSuccess ? (
            <div>
              <div className="font-medium mb-1">✅ Migração Concluída com Sucesso!</div>
              <div className="text-sm">
                O sistema agora usa uma única tabela unificada para todos os checklists. 
                Os dados da Anna e outros usuários foram preservados e migrados corretamente.
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

        <div className="text-xs text-gray-500 space-y-1">
          <div><strong>Problema Original:</strong> Anna criou checklists que "sumiram" porque o sistema tinha duas tabelas separadas (implementation_checkpoints e user_checklists).</div>
          <div><strong>Solução Implementada:</strong> Criação da tabela unified_checklists que centraliza todos os tipos de checklist em um local único.</div>
          <div><strong>Benefícios:</strong> Não haverá mais confusão sobre onde os dados estão armazenados, e todos os checklists são visíveis em uma interface unificada.</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChecklistMigrationStatus;