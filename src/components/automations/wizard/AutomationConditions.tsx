import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, HelpCircle, Lightbulb } from "lucide-react";
import { ConditionBuilder } from "../ConditionBuilder";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface AutomationConditionsProps {
  conditions: any;
  onChange: (conditions: any) => void;
}

export const AutomationConditions = ({ conditions, onChange }: AutomationConditionsProps) => {
  const [showHelp, setShowHelp] = useState(false);

  const availableFields = [
    { 
      value: 'event_type', 
      label: 'Tipo de Evento', 
      type: 'string',
      description: 'Tipo do evento recebido (ex: purchase_completed)',
      examples: ['purchase_completed', 'user_registered', 'payment_failed']
    },
    { 
      value: 'payload.event.product.name', 
      label: 'Nome do Produto', 
      type: 'string',
      description: 'Nome do produto comprado na Hubla',
      examples: ['Lovable na Prática | Viver de IA', 'Plataforma Viver de IA']
    },
    { 
      value: 'payload.event.groupName', 
      label: 'Nome do Grupo', 
      type: 'string',
      description: 'Nome do grupo/categoria do produto',
      examples: ['Formação Viver de IA', 'Formação Copy com IA']
    },
    { 
      value: 'payload.event.customer.email', 
      label: 'Email do Cliente', 
      type: 'string',
      description: 'Email do cliente que fez a compra',
      examples: ['cliente@example.com']
    },
    { 
      value: 'payload.event.customer.name', 
      label: 'Nome do Cliente', 
      type: 'string',
      description: 'Nome completo do cliente',
      examples: ['João Silva', 'Maria Santos']
    },
    { 
      value: 'payload.event.customer.phone', 
      label: 'Telefone do Cliente', 
      type: 'string',
      description: 'Número de telefone do cliente',
      examples: ['+5511999999999', '11999999999']
    },
    { 
      value: 'payload.event.value', 
      label: 'Valor da Compra', 
      type: 'number',
      description: 'Valor total da compra em centavos',
      examples: ['29700', '49900', '99900']
    },
    { 
      value: 'payload.event.status', 
      label: 'Status da Compra', 
      type: 'string',
      description: 'Status atual da transação',
      examples: ['approved', 'pending', 'canceled']
    },
    { 
      value: 'payload.event.payment_method', 
      label: 'Método de Pagamento', 
      type: 'string',
      description: 'Forma de pagamento utilizada',
      examples: ['pix', 'credit_card', 'boleto']
    },
    { 
      value: 'payload.event.utm_source', 
      label: 'Origem UTM', 
      type: 'string',
      description: 'Origem do tráfego (parâmetro utm_source)',
      examples: ['facebook', 'google', 'instagram']
    }
  ];

  const commonPatterns = [
    {
      name: "Compra de Produto Específico",
      description: "Detectar quando um produto específico é comprado",
      condition: {
        field: 'payload.event.product.name',
        operator: 'equals',
        value: 'Nome do Produto'
      }
    },
    {
      name: "Compra Acima de Valor",
      description: "Detectar compras acima de um valor específico",
      condition: {
        field: 'payload.event.value',
        operator: 'greater_than',
        value: 50000
      }
    },
    {
      name: "Pagamento Aprovado",
      description: "Detectar quando pagamento é aprovado",
      condition: {
        field: 'payload.event.status',
        operator: 'equals',
        value: 'approved'
      }
    }
  ];

  const addCommonPattern = (pattern: any) => {
    const newCondition = {
      id: Math.random().toString(36).substr(2, 9),
      field: pattern.condition.field,
      operator: pattern.condition.operator,
      value: pattern.condition.value,
      type: availableFields.find(f => f.value === pattern.condition.field)?.type || 'string'
    };

    const updatedConditions = {
      ...conditions,
      conditions: [...(conditions.conditions || []), newCondition]
    };

    onChange(updatedConditions);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Condições de Execução</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Ajuda
            </Button>
          </div>
          <CardDescription>
            Configure quando esta automação deve ser executada. As condições determinam 
            quais eventos irão acionar suas ações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Help Section */}
          <Collapsible open={showHelp} onOpenChange={setShowHelp}>
            <CollapsibleContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-blue-900">Como Funcionam as Condições</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        As condições são verificadas sempre que um evento é recebido. 
                        Todas as condições do grupo devem ser verdadeiras (AND) ou 
                        pelo menos uma deve ser verdadeira (OR) para executar as ações.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900">Padrões Comuns</h4>
                      <div className="grid gap-2 mt-2">
                        {commonPatterns.map((pattern, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-2 bg-white rounded border"
                          >
                            <div>
                              <div className="text-sm font-medium">{pattern.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {pattern.description}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addCommonPattern(pattern)}
                            >
                              Usar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Condition Builder */}
          <ConditionBuilder
            conditions={conditions || { id: 'root', operator: 'AND', conditions: [] }}
            onChange={onChange}
            availableFields={availableFields}
          />

          {/* Field Reference */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Campos Disponíveis
            </h4>
            <div className="grid gap-2 text-sm">
              {availableFields.slice(0, 5).map(field => (
                <div key={field.value} className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline" className="text-xs mr-2">
                      {field.type}
                    </Badge>
                    <span className="font-mono text-xs">{field.value}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {field.label}
                  </span>
                </div>
              ))}
              <div className="text-xs text-muted-foreground pt-2 border-t">
                + {availableFields.length - 5} campos adicionais disponíveis
              </div>
            </div>
          </div>

          {/* Validation */}
          {conditions?.conditions?.length > 0 && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">
                  {conditions.conditions.length} condição(ões) configurada(s)
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                As condições serão verificadas usando operador {conditions.operator}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};