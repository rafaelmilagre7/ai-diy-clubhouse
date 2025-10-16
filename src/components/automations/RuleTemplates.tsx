import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2, Mail, MessageSquare, Users, ShoppingCart } from "lucide-react";

interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  conditions: any;
  actions: any[];
  tags: string[];
}

interface RuleTemplatesProps {
  onSelectTemplate: (template: RuleTemplate) => void;
}

export const RuleTemplates = ({ onSelectTemplate }: RuleTemplatesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const templates: RuleTemplate[] = [
    {
      id: 'invite_creation_platform',
      name: 'Criação de convites plataforma',
      description: 'Cria convites automaticamente quando usuários compram produtos na Hubla',
      category: 'invite',
      icon: <Users className="h-5 w-5" />,
      tags: ['hubla', 'convites', 'automático'],
      conditions: {
        id: 'root',
        operator: 'AND',
        conditions: [
          {
            id: 'event_type',
            field: 'event_type',
            operator: 'equals',
            value: 'payment.approved',
            type: 'string'
          },
          {
            id: 'product_check',
            field: 'payload.product_id',
            operator: 'not_empty',
            value: '',
            type: 'string'
          }
        ]
      },
      actions: [
        {
          type: 'send_invite',
          parameters: {
            role_mapping: {
              'N1bkE4pVIUtii35IAoNP': 'lovable_course',
              'default': 'membro_club'
            },
            template: 'welcome_template',
            channels: ['email', 'whatsapp'],
            expires_in: '30 days',
            auto_send: true
          },
          enabled: true,
          order: 1
        }
      ]
    },
    {
      id: 'welcome_email_sequence',
      name: 'Sequência de boas-vindas',
      description: 'Envia sequência de emails de boas-vindas para novos membros',
      category: 'email',
      icon: <Mail className="h-5 w-5" />,
      tags: ['email', 'sequência', 'boas-vindas'],
      conditions: {
        id: 'root',
        operator: 'AND',
        conditions: [
          {
            id: 'new_user',
            field: 'event_type',
            operator: 'equals',
            value: 'user.created',
            type: 'string'
          }
        ]
      },
      actions: [
        {
          type: 'send_email',
          parameters: {
            template: 'welcome_sequence_1',
            delay: '0',
            subject: 'Bem-vindo à plataforma!'
          },
          enabled: true,
          order: 1
        },
        {
          type: 'send_email',
          parameters: {
            template: 'welcome_sequence_2',
            delay: '3 days',
            subject: 'Como aproveitar ao máximo a plataforma'
          },
          enabled: true,
          order: 2
        }
      ]
    },
    {
      id: 'subscription_cancellation',
      name: 'Cancelamento de assinatura',
      description: 'Remove acesso e envia email de retenção quando assinatura é cancelada',
      category: 'subscription',
      icon: <ShoppingCart className="h-5 w-5" />,
      tags: ['cancelamento', 'retenção', 'acesso'],
      conditions: {
        id: 'root',
        operator: 'OR',
        conditions: [
          {
            id: 'cancelled_sale',
            field: 'event_type',
            operator: 'equals',
            value: 'subscription.cancelled',
            type: 'string'
          },
          {
            id: 'cancelled_subscription',
            field: 'event_type',
            operator: 'equals',
            value: 'CanceledSubscription',
            type: 'string'
          }
        ]
      },
      actions: [
        {
          type: 'update_profile',
          parameters: {
            remove_role: true,
            backup_data: true
          },
          enabled: true,
          order: 1
        },
        {
          type: 'send_email',
          parameters: {
            template: 'retention_email',
            subject: 'Que pena que você está saindo...'
          },
          enabled: true,
          order: 2
        }
      ]
    },
    {
      id: 'whatsapp_notification',
      name: 'Notificação WhatsApp urgente',
      description: 'Envia notificação por WhatsApp para eventos críticos',
      category: 'notification',
      icon: <MessageSquare className="h-5 w-5" />,
      tags: ['whatsapp', 'urgente', 'notificação'],
      conditions: {
        id: 'root',
        operator: 'AND',
        conditions: [
          {
            id: 'payment_failed',
            field: 'event_type',
            operator: 'equals',
            value: 'payment.failed',
            type: 'string'
          },
          {
            id: 'has_phone',
            field: 'payload.customer.phone',
            operator: 'not_empty',
            value: '',
            type: 'string'
          }
        ]
      },
      actions: [
        {
          type: 'send_whatsapp',
          parameters: {
            template: 'payment_failed_urgent',
            priority: 'high'
          },
          enabled: true,
          order: 1
        }
      ]
    }
  ];

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'invite', label: 'Convites' },
    { value: 'email', label: 'Emails' },
    { value: 'subscription', label: 'Assinaturas' },
    { value: 'notification', label: 'Notificações' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Templates de Regras</h3>
        <p className="text-sm text-muted-foreground">
          Acelere a criação usando templates pré-configurados
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.value)}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                  {template.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base mb-1">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {template.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <div>• {template.conditions.conditions.length} condições</div>
                  <div>• {template.actions.length} ações</div>
                </div>

                <Button
                  onClick={() => onSelectTemplate(template)}
                  className="w-full"
                  size="sm"
                >
                  <Wand2 className="mr-2 h-3 w-3" />
                  Usar Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhum template encontrado para esta categoria</p>
        </div>
      )}
    </div>
  );
};