import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Info, Zap, Target, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AutomationReviewProps {
  formData: any;
  selectedTemplate?: any;
}

export const AutomationReview = ({ formData, selectedTemplate }: AutomationReviewProps) => {
  const getActionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'send_invite': 'Enviar Convite',
      'create_user': 'Criar Usuário',
      'send_email': 'Enviar Email',
      'send_whatsapp': 'Enviar WhatsApp',
      'webhook_call': 'Chamar Webhook',
      'update_profile': 'Atualizar Perfil'
    };
    return labels[type] || type;
  };

  const getRuleTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'webhook': 'Webhook',
      'schedule': 'Agendada',
      'manual': 'Manual'
    };
    return labels[type] || type;
  };

  const conditionsCount = formData.conditions?.conditions?.length || 0;
  const actionsCount = formData.actions?.length || 0;
  const activeActionsCount = formData.actions?.filter((a: any) => a.enabled !== false).length || 0;

  // Validation
  const hasValidName = formData.name && formData.name.trim() !== '';
  const hasValidConditions = conditionsCount > 0;
  const hasValidActions = actionsCount > 0;
  const isValid = hasValidName && hasValidConditions && hasValidActions;

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      <Card className={`border-l-4 ${isValid ? 'border-l-green-500 bg-green-50/50' : 'border-l-yellow-500 bg-yellow-50/50'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            <CardTitle className={`text-lg ${isValid ? 'text-green-800' : 'text-yellow-800'}`}>
              {isValid ? 'Automação Pronta para Salvar' : 'Verificar Configurações'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {hasValidName ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className={hasValidName ? 'text-green-700' : 'text-red-700'}>
                Nome da automação
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasValidConditions ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className={hasValidConditions ? 'text-green-700' : 'text-red-700'}>
                Condições de execução ({conditionsCount} configuradas)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasValidActions ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className={hasValidActions ? 'text-green-700' : 'text-red-700'}>
                Ações a executar ({activeActionsCount} ativas de {actionsCount} configuradas)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Info */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Template Utilizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{selectedTemplate.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTemplate.description}
                </p>
                <div className="flex gap-2 mt-2">
                  {selectedTemplate.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                #{selectedTemplate.usageCount} usos
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Nome</div>
              <div className="text-lg font-semibold">{formData.name || 'Não definido'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <Badge variant={formData.is_active ? "default" : "secondary"} className="mt-1">
                {formData.is_active ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
          </div>

          {formData.description && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Descrição</div>
              <p className="text-sm mt-1">{formData.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Tipo</div>
              <Badge variant="outline" className="mt-1">
                {getRuleTypeLabel(formData.rule_type)}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Prioridade</div>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${
                  formData.priority === 1 ? 'bg-red-500' :
                  formData.priority === 2 ? 'bg-orange-500' :
                  formData.priority === 3 ? 'bg-yellow-500' :
                  formData.priority === 4 ? 'bg-blue-500' : 'bg-gray-500'
                }`}></div>
                <span className="text-sm font-medium">{formData.priority}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditions Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Condições ({conditionsCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conditionsCount > 0 ? (
            <div className="space-y-3">
              <div className="text-sm">
                <Badge variant="outline" className="mr-2">
                  Operador: {formData.conditions.operator}
                </Badge>
                <span className="text-muted-foreground">
                  {formData.conditions.operator === 'AND' 
                    ? 'Todas as condições devem ser verdadeiras'
                    : 'Pelo menos uma condição deve ser verdadeira'
                  }
                </span>
              </div>
              
              <div className="space-y-2">
                {formData.conditions.conditions.map((condition: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                    <Badge variant="secondary" className="text-xs">
                      {index + 1}
                    </Badge>
                    <code className="text-xs bg-background px-2 py-1 rounded">
                      {condition.field}
                    </code>
                    <span className="text-muted-foreground">{condition.operator}</span>
                    <span className="font-medium">{condition.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Nenhuma condição configurada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Ações ({activeActionsCount} ativas de {actionsCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {actionsCount > 0 ? (
            <div className="space-y-3">
              {formData.actions.map((action: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{getActionTypeLabel(action.type)}</span>
                      {!action.enabled && (
                        <Badge variant="secondary" className="text-xs">
                          Desabilitada
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {action.parameters && Object.keys(action.parameters).length > 0 && (
                    <div className="ml-8 text-sm">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(action.parameters).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-muted-foreground">{key}:</span>
                            <code className="bg-muted px-1 py-0.5 rounded text-xs">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {index < formData.actions.length - 1 && (
                    <Separator className="mt-2" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Nenhuma ação configurada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Final Summary */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">Resumo Final</h3>
            <p className="text-muted-foreground">
              Sua automação "{formData.name}" está configurada para executar{' '}
              <strong>{activeActionsCount} ação(ões)</strong> quando{' '}
              <strong>{conditionsCount} condição(ões)</strong> forem atendidas.
            </p>
            
            {formData.is_active ? (
              <div className="flex items-center justify-center gap-2 text-green-600 text-sm mt-3">
                <CheckCircle className="h-4 w-4" />
                <span>A automação será ativada imediatamente após salvar</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-yellow-600 text-sm mt-3">
                <AlertCircle className="h-4 w-4" />
                <span>A automação ficará inativa até ser ativada manualmente</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};