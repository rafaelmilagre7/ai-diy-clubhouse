import { useState } from 'react';
import { AdminCard } from '../ui/AdminCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Monitor, Mail, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TemplateOption {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
}

const EMAIL_TEMPLATES: TemplateOption[] = [
  {
    id: 'suggestion-new',
    name: 'Nova Sugestão',
    category: 'Sugestões',
    icon: '💡',
    description: 'Notificação de nova sugestão publicada',
  },
  {
    id: 'networking-connection',
    name: 'Nova Conexão',
    category: 'Networking',
    icon: '🤝',
    description: 'Solicitação de conexão recebida',
  },
  {
    id: 'gamification-badge',
    name: 'Novo Badge',
    category: 'Gamification',
    icon: '🏆',
    description: 'Conquista desbloqueada',
  },
  {
    id: 'weekly-digest',
    name: 'Resumo Semanal',
    category: 'Sistema',
    icon: '📊',
    description: 'Digest semanal de atividades',
  },
];

export const EmailTemplatePreview = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('suggestion-new');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const currentTemplate = EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate);

  const handleSendTestEmail = async () => {
    toast({
      title: 'Email de teste enviado',
      description: 'Verifique sua caixa de entrada',
    });
  };

  const getPreviewData = (templateId: string) => {
    const baseData = {
      userName: 'João Silva',
      unsubscribeUrl: 'https://viverdeia.ai/preferences',
    };

    switch (templateId) {
      case 'suggestion-new':
        return {
          ...baseData,
          suggestionTitle: 'Implementar Dashboard de IA',
          suggestionDescription:
            'Criar um dashboard inteligente que analisa métricas e sugere ações automáticas usando machine learning.',
          suggestionAuthor: 'Maria Santos',
          suggestionUrl: 'https://viverdeia.ai/suggestions/123',
          categoryName: 'Estratégia',
        };
      case 'networking-connection':
        return {
          ...baseData,
          senderName: 'Carlos Oliveira',
          senderCompany: 'Tech Innovations',
          senderPosition: 'CEO',
          senderAvatar: 'https://i.pravatar.cc/150?img=12',
          connectionUrl: 'https://viverdeia.ai/networking/connections',
        };
      case 'gamification-badge':
        return {
          ...baseData,
          badgeName: 'Pioneiro da IA',
          badgeDescription: 'Completou 10 sugestões implementadas com IA',
          badgeUrl: 'https://viverdeia.ai/profile/badges',
          totalBadges: 15,
        };
      case 'weekly-digest':
        return {
          ...baseData,
          weekStart: '15/01/2025',
          weekEnd: '22/01/2025',
          newSuggestions: 12,
          newConnections: 5,
          badgesEarned: 2,
          totalLikes: 28,
          dashboardUrl: 'https://viverdeia.ai/dashboard',
          topActivities: [
            {
              icon: '💡',
              title: 'Sugestão em Destaque',
              description: 'Sua sugestão "Automação de Processos" recebeu 15 votos!',
              url: 'https://viverdeia.ai/suggestions/123',
            },
            {
              icon: '🎯',
              title: 'Meta Atingida',
              description: 'Você completou 5 conexões esta semana',
              url: 'https://viverdeia.ai/networking',
            },
          ],
        };
      default:
        return baseData;
    }
  };

  return (
    <div className="space-y-md">
      {/* Header */}
      <div className="flex justify-between items-start gap-md">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Preview de Templates de Email</h2>
          <p className="text-muted-foreground mt-xs">
            Visualize e teste os templates profissionais de notificação por email
          </p>
        </div>
        <Button onClick={handleSendTestEmail} className="gap-sm">
          <Mail className="w-4 h-4" />
          Enviar Teste
        </Button>
      </div>

      {/* Controls */}
      <AdminCard>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {/* Template Selection */}
          <div className="space-y-sm">
            <label className="text-sm font-medium">Template</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-sm">
                      <span>{template.icon}</span>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.category}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Mode */}
          <div className="space-y-sm">
            <label className="text-sm font-medium">Visualização</label>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="desktop" className="gap-xs">
                  <Monitor className="w-4 h-4" />
                  Desktop
                </TabsTrigger>
                <TabsTrigger value="mobile" className="gap-xs">
                  <Smartphone className="w-4 h-4" />
                  Mobile
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Theme */}
          <div className="space-y-sm">
            <label className="text-sm font-medium">Tema</label>
            <Tabs value={theme} onValueChange={(v) => setTheme(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="light">☀️ Claro</TabsTrigger>
                <TabsTrigger value="dark">🌙 Escuro</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Template Info */}
        {currentTemplate && (
          <div className="mt-md pt-md border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <span className="text-2xl">{currentTemplate.icon}</span>
              <div>
                <h3 className="font-semibold">{currentTemplate.name}</h3>
                <p className="text-sm text-muted-foreground">{currentTemplate.description}</p>
              </div>
            </div>
            <Badge variant="outline">{currentTemplate.category}</Badge>
          </div>
        )}
      </AdminCard>

      {/* Preview */}
      <AdminCard className="p-0 overflow-hidden">
        <div className="bg-muted p-md border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Preview</span>
          </div>
          <Badge variant="secondary">{viewMode === 'desktop' ? '📧 Desktop' : '📱 Mobile'}</Badge>
        </div>

        <div
          className={`bg-gradient-to-br from-muted/30 to-muted/50 p-lg flex items-center justify-center min-h-[600px] ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
          }`}
        >
          <div
            className={`bg-background rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ${
              viewMode === 'mobile' ? 'max-w-[375px] w-full' : 'max-w-[600px] w-full'
            }`}
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            <iframe
              srcDoc={generateEmailHTML(selectedTemplate, getPreviewData(selectedTemplate), theme)}
              className="w-full h-[600px] border-0"
              title="Email Preview"
            />
          </div>
        </div>
      </AdminCard>
    </div>
  );
};

// Helper to generate email HTML for preview
const generateEmailHTML = (templateId: string, data: any, theme: string) => {
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1f2937' : '#f6f9fc';
  const cardBg = isDark ? '#111827' : '#ffffff';
  const textColor = isDark ? '#f3f4f6' : '#111827';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';

  // Base styles adaptados para tema
  const baseStyles = `
    body { 
      background-color: ${bgColor}; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: ${textColor};
      padding: 20px;
      margin: 0;
    }
    .container {
      background-color: ${cardBg};
      border-radius: 12px;
      overflow: hidden;
      max-width: 600px;
      margin: 0 auto;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: ${cardBg};
      padding: 24px 32px;
      text-align: center;
      border-bottom: 1px solid ${isDark ? '#374151' : '#e5e7eb'};
    }
    .banner {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
      padding: 48px 32px;
      text-align: center;
    }
    .banner h1 {
      color: #ffffff;
      font-size: 32px;
      margin: 0;
      font-weight: bold;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .content {
      padding: 40px 32px;
      color: ${textColor};
    }
    .footer {
      background-color: ${isDark ? '#0f172a' : '#f9fafb'};
      padding: 32px;
      text-align: center;
      border-top: 1px solid ${isDark ? '#374151' : '#e5e7eb'};
    }
    .footer-text {
      color: ${mutedColor};
      font-size: 13px;
      margin: 8px 0;
    }
  `;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://viverdeia.ai/logo.png" width="180" height="48" alt="Viver de IA" />
          </div>
          <div class="banner">
            <h1>${getTemplateHeading(templateId)}</h1>
          </div>
          <div class="content">
            ${getTemplateContent(templateId, data, isDark)}
          </div>
          <div class="footer">
            <p class="footer-text">Esta é uma notificação automática da plataforma <strong>Viver de IA</strong></p>
            <p class="footer-text">© ${new Date().getFullYear()} Viver de IA - Transformando negócios com IA</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const getTemplateHeading = (templateId: string): string => {
  const headings: Record<string, string> = {
    'suggestion-new': '💡 Nova Sugestão',
    'networking-connection': '🤝 Nova Conexão',
    'gamification-badge': '🏆 Conquista Desbloqueada!',
    'weekly-digest': '📊 Resumo Semanal',
  };
  return headings[templateId] || 'Notificação';
};

const getTemplateContent = (templateId: string, data: any, isDark: boolean): string => {
  const cardBg = isDark ? '#1f2937' : '#f9fafb';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#f3f4f6' : '#111827';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';

  switch (templateId) {
    case 'suggestion-new':
      return `
        <p style="color: ${textColor}; font-weight: 600; margin: 0 0 16px;">Olá, ${data.userName}!</p>
        <p style="color: ${mutedColor}; margin: 16px 0;">Uma nova sugestão foi publicada e pode ser do seu interesse:</p>
        <div style="background: ${cardBg}; border: 2px solid ${borderColor}; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <div style="background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 6px; display: inline-block; font-size: 13px; margin-bottom: 12px;">
            📂 ${data.categoryName}
          </div>
          <h3 style="color: ${textColor}; font-size: 20px; margin: 12px 0;">${data.suggestionTitle}</h3>
          <p style="color: ${mutedColor}; font-size: 14px; margin: 12px 0;">${data.suggestionDescription}</p>
          <p style="color: ${mutedColor}; font-size: 13px; margin: 12px 0 0;"><strong>Por:</strong> ${data.suggestionAuthor}</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.suggestionUrl}" style="background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold;">
            🚀 Ver Sugestão Completa
          </a>
        </div>
      `;
    case 'networking-connection':
      return `
        <p style="color: ${textColor}; font-weight: 600; margin: 0 0 16px;">Olá, ${data.userName}!</p>
        <p style="color: ${mutedColor}; margin: 16px 0;">Você tem uma nova solicitação de conexão:</p>
        <div style="background: ${cardBg}; border: 2px solid ${borderColor}; border-radius: 12px; padding: 32px; margin: 24px 0; text-align: center;">
          ${
            data.senderAvatar
              ? `<img src="${data.senderAvatar}" width="80" height="80" alt="${data.senderName}" style="border-radius: 50%; border: 3px solid #6366f1; margin-bottom: 16px;" />`
              : ''
          }
          <h3 style="color: ${textColor}; font-size: 22px; margin: 12px 0;">${data.senderName}</h3>
          <p style="color: ${mutedColor}; font-size: 14px; margin: 6px 0;">💼 ${data.senderPosition}</p>
          <p style="color: ${mutedColor}; font-size: 14px; margin: 6px 0;">🏢 ${data.senderCompany}</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.connectionUrl}" style="background: #6366f1; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold; margin: 0 8px 8px;">
            ✅ Aceitar Conexão
          </a>
          <a href="${data.connectionUrl}" style="background: white; color: #6366f1; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold; margin: 0 8px 8px; border: 2px solid #6366f1;">
            👤 Ver Perfil
          </a>
        </div>
      `;
    case 'gamification-badge':
      return `
        <p style="color: ${textColor}; font-weight: bold; font-size: 18px; text-align: center; margin: 0 0 16px;">Parabéns, ${data.userName}! 🎉</p>
        <p style="color: ${mutedColor}; text-align: center; margin: 16px 0;">Você acabou de desbloquear uma nova conquista na plataforma:</p>
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 3px solid #f59e0b; border-radius: 16px; padding: 40px 32px; margin: 32px 0; text-align: center;">
          <div style="font-size: 80px; margin-bottom: 20px;">🏆</div>
          <h3 style="color: #78350f; font-size: 28px; margin: 16px 0 8px;">${data.badgeName}</h3>
          <p style="color: #92400e; font-size: 15px; margin: 8px 0 24px;">${data.badgeDescription}</p>
          <div style="background: rgba(255, 255, 255, 0.8); border-radius: 12px; padding: 20px; margin-top: 24px;">
            <div style="color: #78350f; font-size: 32px; font-weight: bold; margin: 0 0 4px;">${data.totalBadges}</div>
            <div style="color: #92400e; font-size: 13px; font-weight: 500; text-transform: uppercase;">Total de Badges</div>
          </div>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.badgeUrl}" style="background: #f59e0b; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold;">
            🎖️ Ver Minha Coleção
          </a>
        </div>
      `;
    case 'weekly-digest':
      return `
        <p style="color: ${textColor}; font-weight: bold; font-size: 18px; margin: 0 0 16px;">Olá, ${data.userName}! 👋</p>
        <p style="color: ${mutedColor}; margin: 16px 0;">Aqui está o resumo da sua semana na plataforma <strong>Viver de IA</strong>:</p>
        <div style="background: #dbeafe; color: #1e40af; padding: 12px 20px; border-radius: 8px; text-align: center; margin: 24px 0; font-weight: 600;">
          📅 ${data.weekStart} - ${data.weekEnd}
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 32px 0;">
          <div style="background: ${cardBg}; border: 2px solid ${borderColor}; border-radius: 12px; padding: 24px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">💡</div>
            <div style="color: #6366f1; font-size: 36px; font-weight: bold; margin: 8px 0 4px;">${data.newSuggestions}</div>
            <div style="color: ${mutedColor}; font-size: 13px; font-weight: 500; text-transform: uppercase;">Novas Sugestões</div>
          </div>
          <div style="background: ${cardBg}; border: 2px solid ${borderColor}; border-radius: 12px; padding: 24px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">🤝</div>
            <div style="color: #6366f1; font-size: 36px; font-weight: bold; margin: 8px 0 4px;">${data.newConnections}</div>
            <div style="color: ${mutedColor}; font-size: 13px; font-weight: 500; text-transform: uppercase;">Novas Conexões</div>
          </div>
          <div style="background: ${cardBg}; border: 2px solid ${borderColor}; border-radius: 12px; padding: 24px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">🏆</div>
            <div style="color: #6366f1; font-size: 36px; font-weight: bold; margin: 8px 0 4px;">${data.badgesEarned}</div>
            <div style="color: ${mutedColor}; font-size: 13px; font-weight: 500; text-transform: uppercase;">Badges Ganhos</div>
          </div>
          <div style="background: ${cardBg}; border: 2px solid ${borderColor}; border-radius: 12px; padding: 24px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">❤️</div>
            <div style="color: #6366f1; font-size: 36px; font-weight: bold; margin: 8px 0 4px;">${data.totalLikes}</div>
            <div style="color: ${mutedColor}; font-size: 13px; font-weight: 500; text-transform: uppercase;">Curtidas Recebidas</div>
          </div>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.dashboardUrl}" style="background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold;">
            📈 Ver Dashboard Completo
          </a>
        </div>
        <div style="color: #059669; background: #d1fae5; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0; font-weight: 500;">
          🚀 Continue assim! Sua participação está fazendo a diferença na comunidade.
        </div>
      `;
    default:
      return '<p>Template não encontrado</p>';
  }
};
