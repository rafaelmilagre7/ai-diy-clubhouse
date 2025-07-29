import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  FileText,
  Users,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ChecklistDataMigrationTool: React.FC = () => {
  const [migrationStatus, setMigrationStatus] = useState<{
    running: boolean;
    completed: boolean;
    errors: string[];
    migratedCount: number;
    duplicatesSkipped: number;
  }>({
    running: false,
    completed: false,
    errors: [],
    migratedCount: 0,
    duplicatesSkipped: 0
  });

  const runMigration = async () => {
    setMigrationStatus(prev => ({ ...prev, running: true, errors: [] }));
    toast.info('Iniciando migração de dados de checklist...');

    try {
      // 1. Migrar implementation_checkpoints para unified_checklists
      console.log('🔄 Migrando implementation_checkpoints...');
      
      const { data: checkpoints, error: checkpointsError } = await supabase
        .from('implementation_checkpoints')
        .select('*');

      if (checkpointsError) throw checkpointsError;

      let migratedCount = 0;
      let duplicatesSkipped = 0;

      for (const checkpoint of checkpoints || []) {
        // Verificar se já existe na unified_checklists
        const { data: existing } = await supabase
          .from('unified_checklists')
          .select('id')
          .eq('user_id', checkpoint.user_id)
          .eq('solution_id', checkpoint.solution_id)
          .eq('checklist_type', 'implementation')
          .eq('is_template', checkpoint.is_template || false)
          .maybeSingle();

        if (existing) {
          duplicatesSkipped++;
          continue;
        }

        // Preparar dados para migração
        const migratedData = {
          user_id: checkpoint.user_id,
          solution_id: checkpoint.solution_id,
          template_id: checkpoint.template_id,
          checklist_type: 'implementation',
          checklist_data: checkpoint.checkpoint_data || { items: [], lastUpdated: new Date().toISOString() },
          completed_items: checkpoint.completed_steps?.length || 0,
          total_items: checkpoint.total_steps || 0,
          progress_percentage: checkpoint.progress_percentage || 0,
          is_completed: (checkpoint.progress_percentage || 0) === 100,
          is_template: checkpoint.is_template || false,
          created_at: checkpoint.created_at,
          updated_at: checkpoint.updated_at,
          metadata: {
            migrated_from: 'implementation_checkpoints',
            original_id: checkpoint.id,
            last_completed_step: checkpoint.last_completed_step
          }
        };

        const { error: insertError } = await supabase
          .from('unified_checklists')
          .insert(migratedData);

        if (insertError) {
          console.error('Erro ao migrar checkpoint:', checkpoint.id, insertError);
          setMigrationStatus(prev => ({
            ...prev,
            errors: [...prev.errors, `Erro ao migrar checkpoint ${checkpoint.id}: ${insertError.message}`]
          }));
        } else {
          migratedCount++;
        }
      }

      // 2. Migrar user_checklists para unified_checklists
      console.log('🔄 Migrando user_checklists...');
      
      const { data: userChecklists, error: userChecklistsError } = await supabase
        .from('user_checklists')
        .select('*');

      if (userChecklistsError) throw userChecklistsError;

      for (const userChecklist of userChecklists || []) {
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('unified_checklists')
          .select('id')
          .eq('user_id', userChecklist.user_id)
          .eq('solution_id', userChecklist.solution_id)
          .eq('checklist_type', 'user')
          .eq('is_template', false)
          .maybeSingle();

        if (existing) {
          duplicatesSkipped++;
          continue;
        }

        // Converter checklist_data para formato unificado
        const checklistData = userChecklist.checklist_data || {};
        const items = Array.isArray(checklistData.items) ? checklistData.items : [];
        
        const migratedData = {
          user_id: userChecklist.user_id,
          solution_id: userChecklist.solution_id,
          checklist_type: 'user',
          checklist_data: {
            items: items.map((item: any, index: number) => ({
              id: item.id || `migrated-${index}`,
              title: item.title || item.text || `Item ${index + 1}`,
              description: item.description || '',
              completed: item.completed || false,
              notes: item.notes || ''
            })),
            lastUpdated: new Date().toISOString()
          },
          completed_items: items.filter((item: any) => item.completed).length,
          total_items: items.length,
          progress_percentage: items.length > 0 ? Math.round((items.filter((item: any) => item.completed).length / items.length) * 100) : 0,
          is_completed: items.length > 0 && items.every((item: any) => item.completed),
          is_template: false,
          created_at: userChecklist.created_at,
          updated_at: userChecklist.updated_at,
          metadata: {
            migrated_from: 'user_checklists',
            original_id: userChecklist.id
          }
        };

        const { error: insertError } = await supabase
          .from('unified_checklists')
          .insert(migratedData);

        if (insertError) {
          console.error('Erro ao migrar user_checklist:', userChecklist.id, insertError);
          setMigrationStatus(prev => ({
            ...prev,
            errors: [...prev.errors, `Erro ao migrar user_checklist ${userChecklist.id}: ${insertError.message}`]
          }));
        } else {
          migratedCount++;
        }
      }

      setMigrationStatus(prev => ({
        ...prev,
        running: false,
        completed: true,
        migratedCount,
        duplicatesSkipped
      }));

      toast.success(`Migração concluída! ${migratedCount} registros migrados, ${duplicatesSkipped} duplicados ignorados.`);

    } catch (error) {
      console.error('Erro na migração:', error);
      setMigrationStatus(prev => ({
        ...prev,
        running: false,
        errors: [...prev.errors, `Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
      }));
      toast.error('Erro durante a migração');
    }
  };

  const resetMigration = () => {
    setMigrationStatus({
      running: false,
      completed: false,
      errors: [],
      migratedCount: 0,
      duplicatesSkipped: 0
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Ferramenta de Migração de Checklists
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta ferramenta migra dados das tabelas antigas (implementation_checkpoints, user_checklists) 
              para a nova tabela unificada (unified_checklists). Execute apenas uma vez.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm">implementation_checkpoints</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-sm">user_checklists</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-purple-500" />
              <span className="text-sm">unified_checklists</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={runMigration}
              disabled={migrationStatus.running}
              className="flex items-center gap-2"
            >
              {migrationStatus.running ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {migrationStatus.running ? 'Migrando...' : 'Executar Migração'}
            </Button>

            {(migrationStatus.completed || migrationStatus.errors.length > 0) && (
              <Button 
                onClick={resetMigration}
                variant="outline"
              >
                Limpar Status
              </Button>
            )}
          </div>

          {migrationStatus.completed && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Migração concluída com sucesso!</p>
                  <div className="flex gap-4">
                    <Badge variant="outline">
                      {migrationStatus.migratedCount} migrados
                    </Badge>
                    <Badge variant="secondary">
                      {migrationStatus.duplicatesSkipped} duplicados ignorados
                    </Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {migrationStatus.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Erros durante a migração:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {migrationStatus.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChecklistDataMigrationTool;