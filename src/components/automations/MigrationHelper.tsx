import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { migrateFieldName, FIELD_MIGRATION_MAP } from '@/hooks/useHublaEvents';

interface MigrationHelperProps {
  conditions: any;
  onMigrate: (migratedConditions: any) => void;
}

export const MigrationHelper = ({ conditions, onMigrate }: MigrationHelperProps) => {
  // Encontrar condições que precisam de migração
  const findLegacyConditions = (group: any): any[] => {
    if (!group || !group.conditions) return [];
    
    const legacyConditions: any[] = [];
    
    group.conditions.forEach((condition: any) => {
      if ('conditions' in condition) {
        // É um grupo, verificar recursivamente
        legacyConditions.push(...findLegacyConditions(condition));
      } else {
        // É uma condição, verificar se precisa de migração
        if (FIELD_MIGRATION_MAP[condition.field]) {
          legacyConditions.push({
            ...condition,
            oldField: condition.field,
            newField: FIELD_MIGRATION_MAP[condition.field]
          });
        }
      }
    });
    
    return legacyConditions;
  };

  // Migrar condições recursivamente
  const migrateConditions = (group: any): any => {
    if (!group || !group.conditions) return group;
    
    return {
      ...group,
      conditions: group.conditions.map((condition: any) => {
        if ('conditions' in condition) {
          // É um grupo, migrar recursivamente
          return migrateConditions(condition);
        } else {
          // É uma condição, migrar se necessário
          const newField = migrateFieldName(condition.field);
          return {
            ...condition,
            field: newField
          };
        }
      })
    };
  };

  const legacyConditions = findLegacyConditions(conditions);
  
  if (legacyConditions.length === 0) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Todas as condições estão usando a estrutura atualizada. Nenhuma migração necessária.
        </AlertDescription>
      </Alert>
    );
  }

  const handleMigrate = () => {
    const migratedConditions = migrateConditions(conditions);
    onMigrate(migratedConditions);
  };

  return (
    <Card className="border-status-warning/30 bg-status-warning/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-status-warning">
          <AlertTriangle className="h-5 w-5" />
          Migração de Campos Necessária
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Detectamos {legacyConditions.length} condição(ões) usando campos antigos que precisam ser atualizados
            para a nova estrutura da Hubla.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Campos que serão migrados:</h4>
          {legacyConditions.map((condition, index) => (
            <div 
              key={`${condition.id}-${index}`}
              className="flex items-center justify-between p-3 bg-white rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  {condition.oldField}
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="default" className="text-xs">
                  {condition.newField}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Valor: <span className="font-mono">{condition.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleMigrate} className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Migrar Automaticamente
          </Button>
          <Button variant="outline" size="sm">
            Migrar Manualmente
          </Button>
        </div>

        <div className="text-xs text-muted-foreground p-2 bg-white rounded border">
          <strong>O que isso faz:</strong> Atualiza os nomes dos campos para a nova estrutura da Hubla, 
          mantendo todos os operadores e valores existentes. Suas automações continuarão funcionando normalmente.
        </div>
      </CardContent>
    </Card>
  );
};