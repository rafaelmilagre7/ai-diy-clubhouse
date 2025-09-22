import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, HelpCircle, Lightbulb, ArrowRight } from "lucide-react";
import { ActionSelector } from "../ActionSelector";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface AutomationActionsProps {
  actions: any[];
  onChange: (actions: any[]) => void;
}

export const AutomationActions = ({ actions, onChange }: AutomationActionsProps) => {
  const [showHelp, setShowHelp] = useState(false);

  const quickActions = [
    {
      name: "Convite Curso Lovable",
      description: "Criar convite para acesso ao curso Lovable",
      action: {
        type: 'send_invite',
        parameters: {
          role_id: 'lovable_course',
          template: 'lovable_welcome',
          channels: ['email'],
          expires_in: '7 days'
        },
        enabled: true,
        order: 1
      }
    },
    {
      name: "Convite Plataforma",
      description: "Criar convite para acesso à plataforma",
      action: {
        type: 'send_invite',
        parameters: {
          role_id: 'membro_club',
          template: 'platform_access',
          channels: ['email'],
          expires_in: '30 days'
        },
        enabled: true,
        order: 1
      }
    },
    {
      name: "Email de Boas-vindas",
      description: "Enviar email de boas-vindas personalizado",
      action: {
        type: 'send_email',
        parameters: {
          template: 'welcome_email',
          subject: 'Bem-vindo!',
          priority: 'normal'
        },
        enabled: true,
        order: 1
      }
    },
    {
      name: "WhatsApp Boas-vindas",
      description: "Enviar mensagem de boas-vindas via WhatsApp",
      action: {
        type: 'send_whatsapp',
        parameters: {
          template: 'welcome_whatsapp',
          priority: 'normal'
        },
        enabled: true,
        order: 1
      }
    }
  ];

  const addQuickAction = (quickAction: any) => {
    const newActions = [...actions, { ...quickAction.action, order: actions.length + 1 }];
    onChange(newActions);
  };

  const actionFlow = actions.map((action, index) => ({
    ...action,
    stepNumber: index + 1
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Ações da Automação</CardTitle>
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
            Configure as ações que serão executadas quando as condições forem atendidas.
            As ações são executadas na ordem definida.
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
                      <h4 className="font-medium text-blue-900">Como Funcionam as Ações</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        As ações são executadas sequencialmente quando as condições são atendidas. 
                        Se uma ação falhar, as próximas podem ainda ser executadas dependendo da configuração.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900">Ações Rápidas</h4>
                      <div className="grid gap-2 mt-2">
                        {quickActions.map((quickAction, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-2 bg-white rounded border"
                          >
                            <div>
                              <div className="text-sm font-medium">{quickAction.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {quickAction.description}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addQuickAction(quickAction)}
                            >
                              Adicionar
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

          {/* Action Flow Visualization */}
          {actions.length > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Fluxo de Execução
              </h4>
              <div className="flex items-center gap-2 overflow-x-auto">
                {actionFlow.map((action, index) => (
                  <div key={index} className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2 p-2 bg-white rounded border">
                      <Badge variant="outline" className="text-xs">
                        {action.stepNumber}
                      </Badge>
                      <span className="text-sm font-medium">
                        {action.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      {!action.enabled && (
                        <Badge variant="secondary" className="text-xs">
                          Desabilitada
                        </Badge>
                      )}
                    </div>
                    {index < actionFlow.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                As ações serão executadas nesta ordem. Ações desabilitadas são ignoradas.
              </p>
            </div>
          )}

          {/* Action Selector */}
          <ActionSelector
            actions={actions}
            onChange={onChange}
          />

          {/* Validation */}
          {actions.length > 0 && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">
                  {actions.filter(a => a.enabled !== false).length} ação(ões) ativa(s) configurada(s)
                </span>
              </div>
              {actions.some(a => a.enabled === false) && (
                <p className="text-xs text-yellow-600 mt-1">
                  {actions.filter(a => a.enabled === false).length} ação(ões) desabilitada(s) não serão executadas
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};