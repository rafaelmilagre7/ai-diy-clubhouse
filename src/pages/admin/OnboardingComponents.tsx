import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code2, 
  Settings, 
  Database, 
  FileText, 
  Wrench,
  Eye,
  Bug,
  Heart,
  Link,
  Trash2,
  Package
} from "lucide-react";

const OnboardingComponents = () => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const components = {
    pages: [
      {
        name: "OnboardingPreview",
        path: "/pages/admin/OnboardingPreview.tsx",
        description: "Página principal de preview do onboarding com simulação interativa",
        status: "active",
        route: "/admin/onboarding-preview",
        lines: 365
      }
    ],
    adminComponents: [
      {
        name: "OnboardingPreviewCard",
        path: "/components/admin/dashboard/OnboardingPreviewCard.tsx",
        description: "Card no dashboard admin para acessar o preview",
        status: "active",
        lines: 51
      },
      {
        name: "OnboardingDebugPanel (Admin)",
        path: "/components/admin/onboarding/OnboardingDebugPanel.tsx",
        description: "Painel completo de debugging com controles avançados",
        status: "active",
        lines: 167
      },
      {
        name: "OnboardingHealthMonitor", 
        path: "/components/admin/onboarding/OnboardingHealthMonitor.tsx",
        description: "Monitor de saúde completo do sistema de onboarding",
        status: "active",
        lines: 298
      }
    ],
    debugComponents: [
      {
        name: "OnboardingDebugPanel (Debug)",
        path: "/components/debug/OnboardingDebugPanel.tsx", 
        description: "Painel simples de debug para desenvolvimento",
        status: "active",
        lines: 56
      }
    ],
    hooks: [
      {
        name: "useOnboardingRedirect",
        path: "/hooks/useOnboardingRedirect.ts",
        description: "Hook para redirecionamento inteligente baseado no progresso",
        status: "active", 
        lines: 134
      }
    ],
    utils: [
      {
        name: "onboardingDebug",
        path: "/utils/onboardingDebug.ts",
        description: "Utilitários de debugging simplificados",
        status: "active",
        lines: 35
      },
      {
        name: "onboardingNavigation", 
        path: "/utils/onboardingNavigation.ts",
        description: "Lógica de navegação entre steps do onboarding",
        status: "active",
        lines: 86
      },
      {
        name: "onboardingValidation",
        path: "/utils/onboardingValidation.ts", 
        description: "Validação completa de dados e fluxo",
        status: "active",
        lines: 141
      },
      {
        name: "validateOnboardingSteps",
        path: "/utils/validateOnboardingSteps.ts",
        description: "Validação específica de cada step",
        status: "active", 
        lines: 215
      },
      {
        name: "validatePersonalInfoForm",
        path: "/utils/validatePersonalInfoForm.ts",
        description: "Validação de formulários pessoais",
        status: "active",
        lines: 25
      }
    ],
    database: [
      {
        name: "get_onboarding_next_step",
        path: "Função PostgreSQL",
        description: "Determina próximo step baseado no progresso do usuário",
        status: "active",
        lines: 104
      },
      {
        name: "initialize_onboarding_for_user", 
        path: "Função PostgreSQL",
        description: "Inicializa onboarding para novo usuário",
        status: "active",
        lines: 93
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'deprecated': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'removed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'pages': return <FileText className="h-4 w-4" />;
      case 'adminComponents': return <Settings className="h-4 w-4" />;
      case 'debugComponents': return <Bug className="h-4 w-4" />;
      case 'hooks': return <Link className="h-4 w-4" />;
      case 'utils': return <Wrench className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getTotalLines = () => {
    return Object.values(components).flat().reduce((total, comp) => total + (comp.lines || 0), 0);
  };

  const getTotalComponents = () => {
    return Object.values(components).flat().length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Componentes de Onboarding
          </h1>
          <p className="text-muted-foreground mt-2">
            Inventário completo de todos os componentes, hooks e utils relacionados ao onboarding
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{getTotalComponents()}</div>
            <div className="text-muted-foreground">Componentes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{getTotalLines()}</div>
            <div className="text-muted-foreground">Linhas de código</div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(components).map(([type, items]) => (
          <Card key={type} className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                {getIconForType(type)}
              </div>
              <div className="text-2xl font-bold">{items.length}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {type.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            Componentes
          </TabsTrigger>
          <TabsTrigger value="logic" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Lógica & Utils
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Banco de Dados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Status do Sistema de Onboarding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-600">✅ O que está funcionando:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Preview interativo completo (365 linhas)</li>
                    <li>• Sistema de debugging avançado</li>
                    <li>• Monitor de saúde em tempo real</li>
                    <li>• Hooks de redirecionamento</li>
                    <li>• Validação completa de dados</li>
                    <li>• Funções de banco ativas</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-red-600">❌ O que foi removido:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Tabelas principais (onboarding_final, etc)</li>
                    <li>• Fluxo de steps funcional</li>
                    <li>• Interface real de preenchimento</li>
                    <li>• Sistema de persistência</li>
                    <li>• Integração com convites</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          {/* Páginas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Páginas ({components.pages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {components.pages.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{comp.name}</h4>
                        <Badge className={getStatusColor(comp.status)}>
                          {comp.status}
                        </Badge>
                        <Badge variant="outline">{comp.lines} linhas</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{comp.description}</p>
                      <p className="text-xs text-blue-600 mt-1">{comp.path}</p>
                      {comp.route && (
                        <p className="text-xs text-purple-600">Rota: {comp.route}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Admin Components */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Componentes Admin ({components.adminComponents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {components.adminComponents.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{comp.name}</h4>
                        <Badge className={getStatusColor(comp.status)}>
                          {comp.status}
                        </Badge>
                        <Badge variant="outline">{comp.lines} linhas</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{comp.description}</p>
                      <p className="text-xs text-blue-600 mt-1">{comp.path}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Debug Components */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Componentes Debug ({components.debugComponents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {components.debugComponents.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{comp.name}</h4>
                        <Badge className={getStatusColor(comp.status)}>
                          {comp.status}
                        </Badge>
                        <Badge variant="outline">{comp.lines} linhas</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{comp.description}</p>
                      <p className="text-xs text-blue-600 mt-1">{comp.path}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logic" className="space-y-6">
          {/* Hooks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Hooks ({components.hooks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {components.hooks.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{comp.name}</h4>
                        <Badge className={getStatusColor(comp.status)}>
                          {comp.status}
                        </Badge>
                        <Badge variant="outline">{comp.lines} linhas</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{comp.description}</p>
                      <p className="text-xs text-blue-600 mt-1">{comp.path}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Utils */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Utilitários ({components.utils.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {components.utils.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{comp.name}</h4>
                        <Badge className={getStatusColor(comp.status)}>
                          {comp.status}
                        </Badge>
                        <Badge variant="outline">{comp.lines} linhas</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{comp.description}</p>
                      <p className="text-xs text-blue-600 mt-1">{comp.path}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Funções do Banco ({components.database.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {components.database.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{comp.name}</h4>
                        <Badge className={getStatusColor(comp.status)}>
                          {comp.status}
                        </Badge>
                        <Badge variant="outline">{comp.lines} linhas</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{comp.description}</p>
                      <p className="text-xs text-blue-600 mt-1">{comp.path}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Panel */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-green-700">✅ Manter</h4>
              <ul className="space-y-1 text-green-600">
                <li>• Preview funcional</li>
                <li>• Sistema de debug</li>
                <li>• Monitor de saúde</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-700">⚠️ Revisar</h4>
              <ul className="space-y-1 text-yellow-600">
                <li>• Hooks de redirecionamento</li>
                <li>• Validações existentes</li>
                <li>• Funções do banco</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-red-700">🗑️ Remover</h4>
              <ul className="space-y-1 text-red-600">
                <li>• Referências a tabelas removidas</li>
                <li>• Utils obsoletos</li>
                <li>• Código morto</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingComponents;