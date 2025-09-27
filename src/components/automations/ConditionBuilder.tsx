import { useState } from "react";
import { Plus, X, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: any;
  type: string;
}

interface ConditionGroup {
  id: string;
  operator: 'AND' | 'OR';
  conditions: (Condition | ConditionGroup)[];
  expanded?: boolean;
}

interface FieldDefinition {
  value: string;
  label: string;
  type: string;
  aliases?: string[];
  category?: string;
  description?: string;
  examples?: any[];
}

interface ConditionBuilderProps {
  conditions: ConditionGroup;
  onChange: (conditions: ConditionGroup) => void;
  availableFields: FieldDefinition[];
}

export const ConditionBuilder = ({ conditions, onChange, availableFields }: ConditionBuilderProps) => {
  const operators = {
    string: [
      { value: 'equals', label: 'Igual a' },
      { value: 'not_equals', label: 'Diferente de' },
      { value: 'contains', label: 'Contém' },
      { value: 'not_contains', label: 'Não contém' },
      { value: 'starts_with', label: 'Começa com' },
      { value: 'ends_with', label: 'Termina com' },
      { value: 'empty', label: 'Está vazio' },
      { value: 'not_empty', label: 'Não está vazio' }
    ],
    number: [
      { value: 'equals', label: 'Igual a' },
      { value: 'not_equals', label: 'Diferente de' },
      { value: 'greater_than', label: 'Maior que' },
      { value: 'less_than', label: 'Menor que' },
      { value: 'greater_equal', label: 'Maior ou igual a' },
      { value: 'less_equal', label: 'Menor ou igual a' }
    ],
    boolean: [
      { value: 'equals', label: 'É' },
      { value: 'not_equals', label: 'Não é' }
    ],
    array: [
      { value: 'contains', label: 'Contém' },
      { value: 'not_contains', label: 'Não contém' },
      { value: 'length_equals', label: 'Tamanho igual a' },
      { value: 'length_greater', label: 'Tamanho maior que' }
    ]
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addCondition = (groupId: string) => {
    const newCondition: Condition = {
      id: generateId(),
      field: '',
      operator: 'equals',
      value: '',
      type: 'string'
    };
    
    const updatedConditions = addConditionToGroup(conditions, groupId, newCondition);
    onChange(updatedConditions);
  };

  const addGroup = (parentGroupId: string) => {
    const newGroup: ConditionGroup = {
      id: generateId(),
      operator: 'AND',
      conditions: [],
      expanded: true
    };
    
    const updatedConditions = addConditionToGroup(conditions, parentGroupId, newGroup);
    onChange(updatedConditions);
  };

  const addConditionToGroup = (group: ConditionGroup, targetGroupId: string, item: Condition | ConditionGroup): ConditionGroup => {
    if (group.id === targetGroupId) {
      return {
        ...group,
        conditions: [...group.conditions, item]
      };
    }
    
    return {
      ...group,
      conditions: group.conditions.map(condition => 
        'conditions' in condition 
          ? addConditionToGroup(condition, targetGroupId, item)
          : condition
      )
    };
  };

  const removeCondition = (conditionId: string) => {
    const updatedConditions = removeConditionFromGroup(conditions, conditionId);
    onChange(updatedConditions);
  };

  const removeConditionFromGroup = (group: ConditionGroup, conditionId: string): ConditionGroup => {
    return {
      ...group,
      conditions: group.conditions
        .filter(condition => condition.id !== conditionId)
        .map(condition => 
          'conditions' in condition 
            ? removeConditionFromGroup(condition, conditionId)
            : condition
        )
    };
  };

  const updateCondition = (conditionId: string, updates: Partial<Condition>) => {
    const updatedConditions = updateConditionInGroup(conditions, conditionId, updates);
    onChange(updatedConditions);
  };

  const updateConditionInGroup = (group: ConditionGroup, conditionId: string, updates: Partial<Condition>): ConditionGroup => {
    return {
      ...group,
      conditions: group.conditions.map(condition => {
        if (condition.id === conditionId && !('conditions' in condition)) {
          return { ...condition, ...updates };
        }
        if ('conditions' in condition) {
          return updateConditionInGroup(condition, conditionId, updates);
        }
        return condition;
      })
    };
  };

  const updateGroupOperator = (groupId: string, operator: 'AND' | 'OR') => {
    const updatedConditions = updateGroupOperatorInGroup(conditions, groupId, operator);
    onChange(updatedConditions);
  };

  const updateGroupOperatorInGroup = (group: ConditionGroup, groupId: string, operator: 'AND' | 'OR'): ConditionGroup => {
    if (group.id === groupId) {
      return { ...group, operator };
    }
    
    return {
      ...group,
      conditions: group.conditions.map(condition => 
        'conditions' in condition 
          ? updateGroupOperatorInGroup(condition, groupId, operator)
          : condition
      )
    };
  };

  const toggleGroupExpansion = (groupId: string) => {
    const updatedConditions = toggleGroupExpansionInGroup(conditions, groupId);
    onChange(updatedConditions);
  };

  const toggleGroupExpansionInGroup = (group: ConditionGroup, groupId: string): ConditionGroup => {
    if (group.id === groupId) {
      return { ...group, expanded: !group.expanded };
    }
    
    return {
      ...group,
      conditions: group.conditions.map(condition => 
        'conditions' in condition 
          ? toggleGroupExpansionInGroup(condition, groupId)
          : condition
      )
    };
  };

  const renderCondition = (condition: Condition) => {
    // Primeiro tentar encontrar campo diretamente
    let field = availableFields.find(f => f.value === condition.field);
    
    // Se não encontrou, tentar com aliases (para compatibilidade)
    if (!field) {
      field = availableFields.find(f => 
        f.aliases && f.aliases.includes(condition.field)
      );
    }
    
    // Criar campo temporário se não encontrar (para não quebrar a UI)
    if (!field) {
      field = {
        value: condition.field,
        label: `Campo: ${condition.field}`,
        type: 'string'
      };
    }
    
    const fieldType = field?.type || 'string';
    const availableOperators = operators[fieldType as keyof typeof operators] || operators.string;
    
    // Verificar se o campo precisa de migração
    const isLegacyField = !availableFields.find(f => f.value === condition.field);
    const needsMigration = isLegacyField && availableFields.find(f => 
      f.aliases && f.aliases.includes(condition.field)
    );

    return (
      <Card key={condition.id} className={`border-l-4 ${needsMigration ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
        <CardContent className="p-4">
          {/* Warning para campos que precisam de migração */}
          {needsMigration && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <div className="flex items-center gap-2 text-yellow-700">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Campo incompatível detectado. Recomendamos atualizar para: 
                  <strong className="ml-1">
                    {availableFields.find(f => f.aliases && f.aliases.includes(condition.field))?.value}
                  </strong>
                </span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-3">
              <Label className="text-xs text-muted-foreground">Campo</Label>
              <Select
                value={condition.field}
                onValueChange={(value) => {
                  const selectedField = availableFields.find(f => f.value === value);
                  updateCondition(condition.id, { 
                    field: value, 
                    type: selectedField?.type || 'string',
                    operator: 'equals',
                    value: ''
                  });
                }}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {/* Campo atual (mesmo que incompatível) */}
                  {isLegacyField && (
                    <SelectItem value={condition.field}>
                      <div>
                        <div className="font-medium text-yellow-600">
                          {field.label} ⚠️
                        </div>
                        <div className="text-xs text-yellow-500">
                          Campo incompatível - considere migrar
                        </div>
                      </div>
                    </SelectItem>
                  )}
                  
                  {/* Campos atualizados agrupados por categoria */}
                  {availableFields.map(field => (
                    <SelectItem key={field.value} value={field.value}>
                      <div>
                        <div className="font-medium">{field.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {field.type} {field.category && `• ${field.category}`}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-3">
              <Label className="text-xs text-muted-foreground">Operador</Label>
              <Select
                value={condition.operator}
                onValueChange={(value) => updateCondition(condition.id, { operator: value })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableOperators.map(op => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-4">
              <Label className="text-xs text-muted-foreground">Valor</Label>
              {fieldType === 'boolean' ? (
                <Select
                  value={condition.value?.toString() || 'true'}
                  onValueChange={(value) => updateCondition(condition.id, { value: value === 'true' })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Verdadeiro</SelectItem>
                    <SelectItem value="false">Falso</SelectItem>
                  </SelectContent>
                </Select>
              ) : fieldType === 'number' ? (
                <Input
                  type="number"
                  value={condition.value || ''}
                  onChange={(e) => updateCondition(condition.id, { value: parseFloat(e.target.value) || 0 })}
                  className="text-xs"
                  disabled={['empty', 'not_empty'].includes(condition.operator)}
                />
              ) : (
                <Input
                  value={condition.value || ''}
                  onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                  className="text-xs"
                  disabled={['empty', 'not_empty'].includes(condition.operator)}
                  placeholder="Digite o valor..."
                />
              )}
            </div>

            <div className="col-span-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeCondition(condition.id)}
                className="h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderGroup = (group: ConditionGroup, level: number = 0) => {
    return (
      <div key={group.id} className={`space-y-3 ${level > 0 ? 'ml-6 pl-4 border-l-2 border-muted' : ''}`}>
        {level > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleGroupExpansion(group.id)}
                className="h-6 w-6 p-0"
              >
                {group.expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
              <Badge variant="outline" className="text-xs">
                Grupo {group.operator}
              </Badge>
              <div className="flex">
                <Button
                  variant={group.operator === 'AND' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateGroupOperator(group.id, 'AND')}
                  className="h-6 px-2 text-xs rounded-r-none"
                >
                  E
                </Button>
                <Button
                  variant={group.operator === 'OR' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateGroupOperator(group.id, 'OR')}
                  className="h-6 px-2 text-xs rounded-l-none"
                >
                  OU
                </Button>
              </div>
            </div>
          </div>
        )}

        {(group.expanded !== false) && (
          <div className="space-y-3">
            {group.conditions.map((condition, index) => (
              <div key={condition.id}>
                {index > 0 && (
                  <div className="flex justify-center my-2">
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      {group.operator}
                    </Badge>
                  </div>
                )}
                
                {'conditions' in condition 
                  ? renderGroup(condition, level + 1)
                  : renderCondition(condition)
                }
              </div>
            ))}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addCondition(group.id)}
                className="flex items-center gap-1 text-xs"
              >
                <Plus className="h-3 w-3" />
                Condição
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addGroup(group.id)}
                className="flex items-center gap-1 text-xs"
              >
                <Plus className="h-3 w-3" />
                Grupo
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <div className="font-semibold mb-2">💡 Como definir condições:</div>
          <div className="space-y-1 text-xs">
            <div>• <strong>payload.event.groupName</strong> - Nome do produto/grupo vendido</div>
            <div>• <strong>payload.event.userEmail</strong> - Email do comprador</div>
            <div>• <strong>payload.event.paidAt</strong> - Data/hora do pagamento</div>
            <div>• <strong>payload.event.saleValue</strong> - Valor da venda</div>
          </div>
          <div className="mt-2 text-xs italic">
            Exemplo: Para automatizar apenas vendas do "Curso Lovable", use <code>payload.event.groupName</code> igual a "Curso Lovable"
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Condições Principais</Badge>
          <div className="flex">
            <Button
              variant={conditions.operator === 'AND' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateGroupOperator(conditions.id, 'AND')}
              className="h-6 px-2 text-xs rounded-r-none"
            >
              E
            </Button>
            <Button
              variant={conditions.operator === 'OR' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateGroupOperator(conditions.id, 'OR')}
              className="h-6 px-2 text-xs rounded-l-none"
            >
              OU
            </Button>
          </div>
        </div>
      </div>

      {renderGroup(conditions)}

      {conditions.conditions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <div className="space-y-3">
            <p className="text-lg">✨ Condições Personalizadas</p>
            <p className="text-sm">Adicione condições específicas para filtrar quando a automação deve executar</p>
            <div className="text-xs space-y-1 text-muted-foreground/80">
              <p><strong>Exemplo:</strong> Apenas vendas do produto "Combo Viver de IA"</p>
              <p><strong>Campo:</strong> payload.event.groupName</p>
              <p><strong>Operador:</strong> Igual a</p>
              <p><strong>Valor:</strong> Combo Viver de IA</p>
            </div>
            <Button
              variant="outline"
              onClick={() => addCondition(conditions.id)}
              className="flex items-center gap-1 mt-4"
            >
              <Plus className="h-4 w-4" />
              Adicionar Condição Personalizada
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};