import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Users, 
  MessageSquare, 
  Webhook, 
  ShoppingCart, 
  UserPlus, 
  Bell,
  Zap,
  Sparkles,
  Clock,
  Shield
} from "lucide-react";

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  difficulty: 'easy' | 'medium' | 'advanced';
  estimatedTime: string;
  usageCount: number;
  conditions: any;
  actions: any[];
  tags: string[];
}

interface AutomationTemplatesProps {
  onSelectTemplate: (template: AutomationTemplate) => void;
  onCreateFromScratch: () => void;
}

export const AutomationTemplates = ({ onSelectTemplate, onCreateFromScratch }: AutomationTemplatesProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates: AutomationTemplate[] = [
    {
      id: 'hubla_welcome',
      name: 'Boas-vindas Hubla',
      description: 'Cria convite automático quando cliente compra produto na Hubla',
      category: 'hubla',
      icon: UserPlus,
      difficulty: 'easy',
      estimatedTime: '2 min',
      usageCount: 45,
      tags: ['Popular', 'Hubla', 'Convites'],
      conditions: {
        id: 'root',
        operator: 'AND',
        conditions: [
          {
            id: 'event_check',
            field: 'event_type',
            operator: 'equals',
            value: 'purchase_completed',
            type: 'string'
          },
          {
            id: 'product_check',
            field: 'payload.event.product.name',
            operator: 'contains',
            value: 'Lovable na Prática',
            type: 'string'
          }
        ]
      },
      actions: [
        {
          type: 'send_invite',
          parameters: {
            role_id: 'lovable_course',
            template: 'lovable_welcome',
            channels: ['email', 'whatsapp'],
            expires_in: '7 days'
          },
          enabled: true,
          order: 1
        }
      ]
    },
    {
      id: 'platform_access',
      name: 'Acesso à Plataforma',
      description: 'Cria usuário automaticamente para produto "Plataforma Viver de IA"',
      category: 'hubla',
      icon: Shield,
      difficulty: 'easy',
      estimatedTime: '3 min',
      usageCount: 32,
      tags: ['Hubla', 'Plataforma', 'Acesso'],
      conditions: {
        id: 'root',
        operator: 'AND',
        conditions: [
          {
            id: 'event_check',
            field: 'event_type',
            operator: 'equals',
            value: 'purchase_completed',
            type: 'string'
          },
          {
            id: 'product_check',
            field: 'payload.event.product.name',
            operator: 'equals',
            value: 'Plataforma Viver de IA',
            type: 'string'
          }
        ]
      },
      actions: [
        {
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
      ]
    },
    {
      id: 'email_notification',
      name: 'Notificação por Email',
      description: 'Envia email personalizado baseado em condições específicas',
      category: 'communication',
      icon: Mail,
      difficulty: 'medium',
      estimatedTime: '5 min',
      usageCount: 28,
      tags: ['Email', 'Comunicação'],
      conditions: {
        id: 'root',
        operator: 'OR',
        conditions: []
      },
      actions: [
        {
          type: 'send_email',
          parameters: {
            template: 'custom_notification',
            subject: 'Nova notificação',
            priority: 'normal'
          },
          enabled: true,
          order: 1
        }
      ]
    },
    {
      id: 'whatsapp_welcome',
      name: 'WhatsApp Boas-vindas',
      description: 'Envia mensagem de boas-vindas via WhatsApp para novos usuários',
      category: 'communication',
      icon: MessageSquare,
      difficulty: 'medium',
      estimatedTime: '4 min',
      usageCount: 19,
      tags: ['WhatsApp', 'Boas-vindas'],
      conditions: {
        id: 'root',
        operator: 'AND',
        conditions: []
      },
      actions: [
        {
          type: 'send_whatsapp',
          parameters: {
            template: 'welcome_whatsapp',
            priority: 'normal'
          },
          enabled: true,
          order: 1
        }
      ]
    },
    {
      id: 'webhook_integration',
      name: 'Integração Webhook',
      description: 'Chama API externa quando condições específicas são atendidas',
      category: 'integration',
      icon: Webhook,
      difficulty: 'advanced',
      estimatedTime: '10 min',
      usageCount: 12,
      tags: ['Webhook', 'API', 'Integração'],
      conditions: {
        id: 'root',
        operator: 'AND',
        conditions: []
      },
      actions: [
        {
          type: 'webhook_call',
          parameters: {
            url: 'https://api.example.com/webhook',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer YOUR_TOKEN'
            },
            timeout: 30
          },
          enabled: true,
          order: 1
        }
      ]
    },
    {
      id: 'user_management',
      name: 'Gestão de Usuários',
      description: 'Automatiza criação e atualização de perfis de usuário',
      category: 'user',
      icon: Users,
      difficulty: 'medium',
      estimatedTime: '6 min',
      usageCount: 15,
      tags: ['Usuários', 'Perfil'],
      conditions: {
        id: 'root',
        operator: 'AND',
        conditions: []
      },
      actions: [
        {
          type: 'create_user',
          parameters: {
            role_id: 'default_member_role',
            auto_activate: true,
            send_welcome: true
          },
          enabled: true,
          order: 1
        }
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'Todos', icon: Sparkles },
    { id: 'hubla', label: 'Hubla', icon: ShoppingCart },
    { id: 'communication', label: 'Comunicação', icon: Mail },
    { id: 'user', label: 'Usuários', icon: Users },
    { id: 'integration', label: 'Integrações', icon: Webhook },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const popularTemplates = templates
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Escolha um Template</h2>
        <p className="text-muted-foreground">
          Comece rapidamente com templates pré-configurados ou crie do zero
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Popular Templates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Mais Populares</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {popularTemplates.map(template => {
                const Icon = template.icon;
                return (
                  <Card 
                    key={template.id} 
                    className="hover-scale cursor-pointer border-2 hover:border-primary/50 transition-all"
                    onClick={() => onSelectTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Icon className="h-8 w-8 text-primary" />
                        <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                          #{template.usageCount} usos
                        </Badge>
                      </div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{template.estimatedTime}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${getDifficultyColor(template.difficulty)} border`}
                        >
                          {template.difficulty}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* All Templates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Todos os Templates</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map(template => {
                const Icon = template.icon;
                return (
                  <Card 
                    key={template.id} 
                    className="hover-scale cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => onSelectTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Icon className="h-6 w-6 text-primary" />
                        <div className="flex gap-1">
                          {template.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{template.estimatedTime}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${getDifficultyColor(template.difficulty)} border text-xs`}
                        >
                          {template.difficulty}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {categories.slice(1).map(category => (
          <TabsContent key={category.id} value={category.id}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map(template => {
                const Icon = template.icon;
                return (
                  <Card 
                    key={template.id} 
                    className="hover-scale cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => onSelectTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Icon className="h-6 w-6 text-primary" />
                        <div className="flex gap-1">
                          {template.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{template.estimatedTime}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${getDifficultyColor(template.difficulty)} border text-xs`}
                        >
                          {template.difficulty}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Create from Scratch */}
      <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-all">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Zap className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Criar do Zero</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Tenha controle total criando sua automação personalizada com condições e ações específicas
          </p>
          <Button onClick={onCreateFromScratch} variant="outline" className="gap-2">
            <Zap className="h-4 w-4" />
            Começar do Zero
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};