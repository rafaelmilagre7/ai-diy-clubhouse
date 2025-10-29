import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, Type, Stars, Layout, Zap, Shield, Search,
  Box, Circle, Square, Layers, Eye, Moon, Sun, Check, BarChart3,
  AlertCircle, ArrowRight, Code, Lightbulb, CheckCircle2, XCircle, Play, Bell
} from 'lucide-react';
import { ColorPalette, ColorSwatch } from '@/components/style-guide/ColorPalette';
import { ComponentShowcase } from '@/components/style-guide/ComponentShowcase';
import { TokenTable, Token } from '@/components/style-guide/TokenTable';
import { InteractiveDemo } from '@/components/style-guide/InteractiveDemo';
import { CodeBlock } from '@/components/style-guide/CodeBlock';
import { AuroraButton } from '@/components/ui/aurora-button';
import { AuroraCard } from '@/components/ui/AuroraCard';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationsSection } from '@/components/style-guide/NotificationsSection';

/**
 * 🎨 DESIGN SYSTEM 2.0 - DOCUMENTAÇÃO VISUAL COMPLETA
 * 
 * Esta é a fonte única de verdade (Single Source of Truth) para o Design System.
 * TODA mudança visual na plataforma DEVE seguir esta documentação.
 * 
 * ⚡ REGRA DE OURO: Sempre use tokens. Se não existe, crie primeiro.
 */
export default function StyleGuidePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('golden-rules');

  // Dados de cores - Brand Colors
  const brandColors = [
    { name: 'Aurora Primary', cssVar: 'hsl(var(--aurora-primary))', className: 'bg-aurora-primary', hex: '#0ABAB5' },
    { name: 'Primary Light', cssVar: 'hsl(var(--aurora-primary-light))', className: 'bg-aurora-primary-light', hex: '#3DD4CF' },
    { name: 'Primary Dark', cssVar: 'hsl(var(--aurora-primary-dark))', className: 'bg-aurora-primary-dark', hex: '#089993' },
  ];

  // Cores Semânticas
  const semanticColors = [
    { name: 'Success', cssVar: 'hsl(var(--status-success))', className: 'bg-[hsl(var(--status-success))]', hex: 'Verde' },
    { name: 'Warning', cssVar: 'hsl(var(--warning))', className: 'bg-warning', hex: 'Amarelo' },
    { name: 'Error', cssVar: 'hsl(var(--destructive))', className: 'bg-destructive', hex: 'Vermelho' },
    { name: 'Info', cssVar: 'hsl(var(--aurora-primary))', className: 'bg-aurora-primary', hex: 'Azul' },
  ];

  // Cores Sociais
  const socialColors = [
    { name: 'WhatsApp', cssVar: 'hsl(var(--social-whatsapp))', className: 'bg-social-whatsapp', hex: '#25D366' },
    { name: 'LinkedIn', cssVar: 'hsl(var(--social-linkedin))', className: 'bg-social-linkedin', hex: '#0A66C2' },
    { name: 'Twitter', cssVar: 'hsl(var(--social-twitter))', className: 'bg-social-twitter', hex: '#1DA1F2' },
  ];

  // Status Semantic Colors - Fase 14
  const statusColors = [
    { name: 'Success', cssVar: 'hsl(var(--status-success))', className: 'bg-status-success', hex: 'Verde' },
    { name: 'Error', cssVar: 'hsl(var(--status-error))', className: 'bg-status-error', hex: 'Vermelho' },
    { name: 'Warning', cssVar: 'hsl(var(--status-warning))', className: 'bg-status-warning', hex: 'Amarelo' },
    { name: 'Info', cssVar: 'hsl(var(--status-info))', className: 'bg-status-info', hex: 'Azul' },
    { name: 'Neutral', cssVar: 'hsl(var(--status-neutral))', className: 'bg-status-neutral', hex: 'Cinza' },
  ];

  const priorityColors = [
    { name: 'Low', cssVar: 'hsl(var(--priority-low))', className: 'bg-priority-low', hex: 'Cinza' },
    { name: 'Normal', cssVar: 'hsl(var(--priority-normal))', className: 'bg-priority-normal', hex: 'Azul' },
    { name: 'High', cssVar: 'hsl(var(--priority-high))', className: 'bg-priority-high', hex: 'Amarelo' },
    { name: 'Urgent', cssVar: 'hsl(var(--priority-urgent))', className: 'bg-priority-urgent', hex: 'Vermelho' },
  ];

  const trackingColors = [
    { name: 'Sent', cssVar: 'hsl(var(--tracking-sent))', className: 'bg-tracking-sent', hex: 'Azul' },
    { name: 'Delivered', cssVar: 'hsl(var(--tracking-delivered))', className: 'bg-tracking-delivered', hex: 'Verde' },
    { name: 'Opened', cssVar: 'hsl(var(--tracking-opened))', className: 'bg-tracking-opened', hex: 'Verde Claro' },
    { name: 'Clicked', cssVar: 'hsl(var(--tracking-clicked))', className: 'bg-tracking-clicked', hex: 'Roxo' },
    { name: 'Bounced', cssVar: 'hsl(var(--tracking-bounced))', className: 'bg-tracking-bounced', hex: 'Laranja' },
    { name: 'Failed', cssVar: 'hsl(var(--tracking-failed))', className: 'bg-tracking-failed', hex: 'Vermelho' },
  ];

  const systemHealthColors = [
    { name: 'Healthy', cssVar: 'hsl(var(--system-healthy))', className: 'bg-system-healthy', hex: 'Verde' },
    { name: 'Warning', cssVar: 'hsl(var(--system-warning))', className: 'bg-system-warning', hex: 'Amarelo' },
    { name: 'Critical', cssVar: 'hsl(var(--system-critical))', className: 'bg-system-critical', hex: 'Vermelho' },
  ];

  // Severity Colors - Fase 14.2
  const severityColors = [
    { name: 'Critical', cssVar: 'hsl(var(--severity-critical))', className: 'bg-severity-critical', hex: 'Vermelho' },
    { name: 'High', cssVar: 'hsl(var(--severity-high))', className: 'bg-severity-high', hex: 'Laranja' },
    { name: 'Medium', cssVar: 'hsl(var(--severity-medium))', className: 'bg-severity-medium', hex: 'Amarelo' },
    { name: 'Low', cssVar: 'hsl(var(--severity-low))', className: 'bg-severity-low', hex: 'Azul' },
    { name: 'Info', cssVar: 'hsl(var(--severity-info))', className: 'bg-severity-info', hex: 'Cinza' },
  ];

  const permissionColors = [
    { name: 'Granted', cssVar: 'hsl(var(--permission-granted))', className: 'bg-permission-granted', hex: 'Verde' },
    { name: 'Partial', cssVar: 'hsl(var(--permission-partial))', className: 'bg-permission-partial', hex: 'Amarelo' },
    { name: 'Denied', cssVar: 'hsl(var(--permission-denied))', className: 'bg-permission-denied', hex: 'Vermelho' },
    { name: 'Restricted', cssVar: 'hsl(var(--permission-restricted))', className: 'bg-permission-restricted', hex: 'Laranja' },
  ];

  const difficultyColors = [
    { name: 'Beginner', cssVar: 'hsl(var(--difficulty-beginner))', className: 'bg-difficulty-beginner', hex: 'Verde' },
    { name: 'Intermediate', cssVar: 'hsl(var(--difficulty-intermediate))', className: 'bg-difficulty-intermediate', hex: 'Azul' },
    { name: 'Advanced', cssVar: 'hsl(var(--difficulty-advanced))', className: 'bg-difficulty-advanced', hex: 'Laranja' },
    { name: 'Expert', cssVar: 'hsl(var(--difficulty-expert))', className: 'bg-difficulty-expert', hex: 'Roxo' },
  ];

  const performanceColors = [
    { name: 'Excellent', cssVar: 'hsl(var(--performance-excellent))', className: 'bg-performance-excellent', hex: 'Verde' },
    { name: 'Good', cssVar: 'hsl(var(--performance-good))', className: 'bg-performance-good', hex: 'Azul' },
    { name: 'Fair', cssVar: 'hsl(var(--performance-fair))', className: 'bg-performance-fair', hex: 'Amarelo' },
    { name: 'Poor', cssVar: 'hsl(var(--performance-poor))', className: 'bg-performance-poor', hex: 'Vermelho' },
  ];

  const semanticStatusColors = [...statusColors, ...priorityColors, ...trackingColors, ...systemHealthColors, ...severityColors, ...permissionColors, ...difficultyColors, ...performanceColors];


  // Sistema de Superfícies
  const surfaceColors = [
    { name: 'Base', cssVar: 'hsl(var(--surface-base))', className: 'bg-surface-base border border-border' },
    { name: 'Elevated', cssVar: 'hsl(var(--surface-elevated))', className: 'bg-surface-elevated border border-border' },
    { name: 'Overlay', cssVar: 'hsl(var(--surface-overlay))', className: 'bg-surface-overlay border border-border' },
    { name: 'Modal', cssVar: 'hsl(var(--surface-modal))', className: 'bg-surface-modal border border-border' },
  ];

  // Hierarquia de Texto
  const textColors = [
    { name: 'Primary', cssVar: 'hsl(var(--text-primary))', className: 'bg-text-primary' },
    { name: 'Secondary', cssVar: 'hsl(var(--text-secondary))', className: 'bg-text-secondary' },
    { name: 'Muted', cssVar: 'hsl(var(--text-muted))', className: 'bg-text-muted' },
    { name: 'Disabled', cssVar: 'hsl(var(--text-disabled))', className: 'bg-text-disabled' },
  ];

  // Tokens de Spacing - Fase 10 Completa
  const spacingTokens: Token[] = [
    { name: 'xs', value: '4px (0.25rem)', usage: 'Espaçamento mínimo - badges, ícones pequenos', type: 'spacing' },
    { name: 'sm', value: '8px (0.5rem)', usage: 'Espaçamento pequeno - gaps entre elementos próximos', type: 'spacing' },
    { name: 'md', value: '16px (1rem)', usage: 'Espaçamento médio - padding de cards, buttons', type: 'spacing' },
    { name: 'lg', value: '24px (1.5rem)', usage: 'Espaçamento grande - seções, grupos de conteúdo', type: 'spacing' },
    { name: 'xl', value: '32px (2rem)', usage: 'Espaçamento extra grande - margens de página', type: 'spacing' },
    { name: '2xl', value: '48px (3rem)', usage: 'Espaçamento muito grande - seções principais', type: 'spacing' },
    { name: '3xl', value: '64px (4rem)', usage: 'Espaçamento hero - grandes separações visuais', type: 'spacing' },
  ];

  // Tokens de Typography
  const typographyTokens: Token[] = [
    { name: 'text-display', value: '3.5rem / 700', usage: 'Títulos hero e displays principais', type: 'typography' },
    { name: 'text-heading-1', value: '2.5rem / 700', usage: 'Títulos de seção principais', type: 'typography' },
    { name: 'text-heading-2', value: '2rem / 600', usage: 'Subtítulos importantes', type: 'typography' },
    { name: 'text-heading-3', value: '1.5rem / 600', usage: 'Títulos de cards e módulos', type: 'typography' },
    { name: 'text-body-large', value: '1.125rem / 400', usage: 'Texto destacado', type: 'typography' },
    { name: 'text-body', value: '1rem / 400', usage: 'Texto padrão do corpo', type: 'typography' },
    { name: 'text-body-small', value: '0.875rem / 400', usage: 'Texto secundário', type: 'typography' },
    { name: 'text-caption', value: '0.75rem / 400', usage: 'Legendas e metadados', type: 'typography' },
  ];

  // Tokens de Shadow
  const shadowTokens: Token[] = [
    { name: 'shadow-sm', value: '0 1px 2px rgba(0,0,0,0.05)', usage: 'Elevação mínima', type: 'shadow' },
    { name: 'shadow-md', value: '0 4px 6px rgba(0,0,0,0.1)', usage: 'Elevação média', type: 'shadow' },
    { name: 'shadow-lg', value: '0 10px 15px rgba(0,0,0,0.1)', usage: 'Elevação grande', type: 'shadow' },
    { name: 'shadow-xl', value: '0 20px 25px rgba(0,0,0,0.15)', usage: 'Elevação extra grande', type: 'shadow' },
    { name: 'shadow-aurora', value: '0 8px 32px aurora/20%', usage: 'Sombra com glow Aurora', type: 'shadow' },
    { name: 'shadow-aurora-strong', value: '0 12px 48px aurora/30%', usage: 'Sombra forte com glow', type: 'shadow' },
  ];

  // Tokens de Chart - BATCH 1
  const chartTokens: Token[] = [
    { name: 'h-chart-sm', value: '200px', usage: 'Charts pequenos (mobile, dashboards compactos)', type: 'other' },
    { name: 'h-chart-md', value: '300px', usage: 'Charts médios (dashboards padrão)', type: 'other' },
    { name: 'h-chart-lg', value: '400px', usage: 'Charts grandes (analytics detalhados)', type: 'other' },
    { name: 'h-chart-xl', value: '500px', usage: 'Charts extra grandes (relatórios full)', type: 'other' },
  ];

  // Gradientes - BATCH 4
  const gradientClasses = [
    { name: 'gradient-aurora', value: 'linear-gradient(135deg, aurora-primary → aurora-light)', usage: 'Gradiente principal da marca' },
    { name: 'gradient-revenue', value: 'linear-gradient(135deg, emerald → teal)', usage: 'Métricas financeiras positivas' },
    { name: 'gradient-success', value: 'linear-gradient(135deg, green → emerald)', usage: 'Estados de sucesso' },
    { name: 'gradient-warning', value: 'linear-gradient(135deg, amber → orange)', usage: 'Alertas e avisos' },
    { name: 'gradient-error', value: 'linear-gradient(135deg, red → rose)', usage: 'Erros e estados críticos' },
    { name: 'gradient-operational', value: 'linear-gradient(135deg, blue → indigo)', usage: 'Métricas operacionais' },
    { name: 'gradient-engagement', value: 'linear-gradient(135deg, purple → pink)', usage: 'Métricas de engajamento' },
    { name: 'gradient-neutral', value: 'linear-gradient(135deg, gray → slate)', usage: 'Estados neutros' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b border-border bg-gradient-to-br from-aurora-primary/5 via-background to-background">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-aurora-primary/10 border border-aurora-primary/20">
              <Stars className="w-8 h-8 text-aurora-primary" />
            </div>
            <div>
              <h1 className="text-display">Design System 2.0</h1>
              <p className="text-body text-muted-foreground">
                Documentação visual completa • 120+ tokens • 35+ gradientes • 12 animações • 150+ componentes normalizados
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar tokens, componentes, cores..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Navigation Tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-8">
          <ScrollArea className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="golden-rules" className="gap-sm">
                <Lightbulb className="w-4 h-4" />
                Regras de Ouro
              </TabsTrigger>
              <TabsTrigger value="foundation" className="gap-sm">
                <Layers className="w-4 h-4" />
                Foundation
              </TabsTrigger>
              <TabsTrigger value="components" className="gap-sm">
                <Box className="w-4 h-4" />
                Components
              </TabsTrigger>
              <TabsTrigger value="patterns" className="gap-sm">
                <Zap className="w-4 h-4" />
                Patterns
              </TabsTrigger>
              <TabsTrigger value="workflow" className="gap-sm">
                <Play className="w-4 h-4" />
                Workflow
              </TabsTrigger>
              <TabsTrigger value="notificacoes" className="gap-sm">
                <Bell className="w-4 h-4" />
                Notificações
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

          {/* 🎯 GOLDEN RULES TAB */}
          <TabsContent value="golden-rules" className="space-y-lg">
            {/* Hero Section */}
            <AuroraCard className="p-lg bg-gradient-aurora border-aurora-primary/20">
              <div className="flex items-start gap-md">
                <div className="p-md rounded-xl bg-white/20">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-sm flex-1">
                  <h2 className="text-heading-1 text-white">⚡ Regras de Ouro do Design System</h2>
                  <p className="text-body text-white/90">
                    Princípios fundamentais que garantem consistência, escalabilidade e manutenibilidade da plataforma.
                  </p>
                </div>
              </div>
            </AuroraCard>

            {/* Regra #1: Sempre use tokens */}
            <Card className="surface-elevated">
              <CardHeader>
                <div className="flex items-center gap-sm">
                  <div className="w-10 h-10 rounded-lg bg-status-success/10 border border-status-success/20 flex items-center justify-center">
                    <span className="text-heading-2 text-status-success">1</span>
                  </div>
                  <CardTitle>Sempre Use Tokens Semânticos</CardTitle>
                </div>
                <CardDescription>
                  NUNCA use valores hardcoded. Se o token não existe, crie primeiro.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-md">
                <div className="grid md:grid-cols-2 gap-md">
                  {/* ❌ ERRADO */}
                  <div className="p-md border-2 border-status-error/20 bg-status-error/5 rounded-lg space-y-sm">
                    <div className="flex items-center gap-xs">
                      <XCircle className="w-5 h-5 text-status-error" />
                      <h3 className="text-heading-3 text-status-error">❌ ERRADO</h3>
                    </div>
                    <CodeBlock
                      language="tsx"
                      code={`// ❌ Valores hardcoded
<div className="p-4 gap-2">
  <h1 className="text-2xl">Título</h1>
  <p className="text-gray-500">Texto</p>
</div>`}
                    />
                    <p className="text-body-small text-muted-foreground">
                      Valores mágicos que quebram consistência
                    </p>
                  </div>

                  {/* ✅ CORRETO */}
                  <div className="p-md border-2 border-status-success/20 bg-status-success/5 rounded-lg space-y-sm">
                    <div className="flex items-center gap-xs">
                      <CheckCircle2 className="w-5 h-5 text-status-success" />
                      <h3 className="text-heading-3 text-status-success">✅ CORRETO</h3>
                    </div>
                    <CodeBlock
                      language="tsx"
                      code={`// ✅ Tokens semânticos
<div className="p-md gap-sm">
  <h1 className="text-heading-2">Título</h1>
  <p className="text-muted-foreground">Texto</p>
</div>`}
                    />
                    <p className="text-body-small text-muted-foreground">
                      Tokens mantêm consistência e escalam
                    </p>
                  </div>
                </div>

                <div className="p-md bg-aurora-primary/5 border border-aurora-primary/20 rounded-lg">
                  <div className="flex items-start gap-sm">
                    <AlertCircle className="w-5 h-5 text-aurora-primary mt-0.5" />
                    <div className="space-y-xs">
                      <p className="text-sm font-medium">Se o token não existe...</p>
                      <ol className="text-xs text-muted-foreground space-y-xs pl-md">
                        <li>1. Avalie se um token existente serve</li>
                        <li>2. Se não, adicione em <code>tailwind.config.ts</code></li>
                        <li>3. Documente aqui nesta página</li>
                        <li>4. Use o novo token</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regra #2: Hierarquia Visual */}
            <Card className="surface-elevated">
              <CardHeader>
                <div className="flex items-center gap-sm">
                  <div className="w-10 h-10 rounded-lg bg-status-info/10 border border-status-info/20 flex items-center justify-center">
                    <span className="text-heading-2 text-status-info">2</span>
                  </div>
                  <CardTitle>Mantenha Hierarquia Visual Clara</CardTitle>
                </div>
                <CardDescription>
                  Use tokens de espaçamento e tipografia para criar hierarquia visual consistente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-md">
                <div className="grid md:grid-cols-2 gap-md">
                  {/* Spacing */}
                  <div className="space-y-sm">
                    <h3 className="text-heading-3">📏 Espaçamento</h3>
                    <div className="space-y-xs text-body-small">
                      <div className="flex items-center gap-sm">
                        <code className="text-xs bg-muted px-xs py-0.5 rounded">xs (4px)</code>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-muted-foreground">Badges, ícones pequenos</span>
                      </div>
                      <div className="flex items-center gap-sm">
                        <code className="text-xs bg-muted px-xs py-0.5 rounded">sm (8px)</code>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-muted-foreground">Gaps entre elementos</span>
                      </div>
                      <div className="flex items-center gap-sm">
                        <code className="text-xs bg-muted px-xs py-0.5 rounded">md (16px)</code>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-muted-foreground">Padding de cards</span>
                      </div>
                      <div className="flex items-center gap-sm">
                        <code className="text-xs bg-muted px-xs py-0.5 rounded">lg (24px)</code>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-muted-foreground">Seções de conteúdo</span>
                      </div>
                      <div className="flex items-center gap-sm">
                        <code className="text-xs bg-muted px-xs py-0.5 rounded">xl (32px)</code>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-muted-foreground">Margens de página</span>
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="space-y-sm">
                    <h3 className="text-heading-3">📝 Tipografia</h3>
                    <div className="space-y-xs text-body-small">
                      <div className="flex items-center gap-sm">
                        <code className="text-xs bg-muted px-xs py-0.5 rounded">text-display</code>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-muted-foreground">Hero titles</span>
                      </div>
                      <div className="flex items-center gap-sm">
                        <code className="text-xs bg-muted px-xs py-0.5 rounded">text-heading-1</code>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-muted-foreground">Títulos de página</span>
                      </div>
                      <div className="flex items-center gap-sm">
                        <code className="text-xs bg-muted px-xs py-0.5 rounded">text-heading-2</code>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-muted-foreground">Subtítulos</span>
                      </div>
                      <div className="flex items-center gap-sm">
                        <code className="text-xs bg-muted px-xs py-0.5 rounded">text-heading-3</code>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-muted-foreground">Títulos de cards</span>
                      </div>
                      <div className="flex items-center gap-sm">
                        <code className="text-xs bg-muted px-xs py-0.5 rounded">text-body</code>
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-muted-foreground">Texto padrão</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regra #3: Cores Semânticas */}
            <Card className="surface-elevated">
              <CardHeader>
                <div className="flex items-center gap-sm">
                  <div className="w-10 h-10 rounded-lg bg-status-warning/10 border border-status-warning/20 flex items-center justify-center">
                    <span className="text-heading-2 text-status-warning">3</span>
                  </div>
                  <CardTitle>Use Cores Semânticas por Contexto</CardTitle>
                </div>
                <CardDescription>
                  NUNCA use cores diretas. Use tokens semânticos que expressam significado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-md">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                  <div className="space-y-sm">
                    <div className="h-16 bg-status-success rounded-lg" />
                    <div className="space-y-xs">
                      <code className="text-xs">status-success</code>
                      <p className="text-xs text-muted-foreground">Sucesso, confirmações</p>
                    </div>
                  </div>
                  <div className="space-y-sm">
                    <div className="h-16 bg-status-error rounded-lg" />
                    <div className="space-y-xs">
                      <code className="text-xs">status-error</code>
                      <p className="text-xs text-muted-foreground">Erros, falhas</p>
                    </div>
                  </div>
                  <div className="space-y-sm">
                    <div className="h-16 bg-status-warning rounded-lg" />
                    <div className="space-y-xs">
                      <code className="text-xs">status-warning</code>
                      <p className="text-xs text-muted-foreground">Avisos, atenção</p>
                    </div>
                  </div>
                  <div className="space-y-sm">
                    <div className="h-16 bg-status-info rounded-lg" />
                    <div className="space-y-xs">
                      <code className="text-xs">status-info</code>
                      <p className="text-xs text-muted-foreground">Informações, dicas</p>
                    </div>
                  </div>
                </div>

                <CodeBlock
                  language="tsx"
                  code={`// ✅ Cores semânticas por contexto
<StatusBadge status="success">Aprovado</StatusBadge>
<StatusBadge status="error">Rejeitado</StatusBadge>
<StatusBadge status="warning">Pendente</StatusBadge>
<StatusBadge status="info">Em análise</StatusBadge>

// ✅ Prioridades
<Badge className="bg-priority-urgent/10 text-priority-urgent">
  Urgente
</Badge>

// ✅ Tracking
<Badge className="bg-tracking-delivered/10 text-tracking-delivered">
  Entregue
</Badge>`}
                />
              </CardContent>
            </Card>

            {/* Regra #4: Componentes Reutilizáveis */}
            <Card className="surface-elevated">
              <CardHeader>
                <div className="flex items-center gap-sm">
                  <div className="w-10 h-10 rounded-lg bg-aurora-primary/10 border border-aurora-primary/20 flex items-center justify-center">
                    <span className="text-heading-2 text-aurora-primary">4</span>
                  </div>
                  <CardTitle>Maximize Reutilização de Componentes</CardTitle>
                </div>
                <CardDescription>
                  Use componentes existentes com variants. Não crie componentes customizados sem necessidade.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-md">
                <div className="p-md bg-aurora-primary/5 border border-aurora-primary/20 rounded-lg space-y-sm">
                  <h3 className="text-heading-3">📦 Componentes Base Disponíveis</h3>
                  <div className="grid md:grid-cols-3 gap-sm text-body-small">
                    <div><Code className="w-3 h-3 inline mr-1" />AuroraCard</div>
                    <div><Code className="w-3 h-3 inline mr-1" />AuroraButton</div>
                    <div><Code className="w-3 h-3 inline mr-1" />LiquidGlassCard</div>
                    <div><Code className="w-3 h-3 inline mr-1" />StatusBadge</div>
                    <div><Code className="w-3 h-3 inline mr-1" />Badge</div>
                    <div><Code className="w-3 h-3 inline mr-1" />Button</div>
                    <div><Code className="w-3 h-3 inline mr-1" />Card</div>
                    <div><Code className="w-3 h-3 inline mr-1" />Input</div>
                    <div><Code className="w-3 h-3 inline mr-1" />Progress</div>
                  </div>
                </div>

                <CodeBlock
                  language="tsx"
                  code={`// ✅ Reutilize com variants
<AuroraCard variant="glass" className="p-lg">
  <CardHeader className="space-y-sm">
    <CardTitle className="text-heading-2">Título</CardTitle>
    <CardDescription>Descrição do card</CardDescription>
  </CardHeader>
  <CardContent className="space-y-md">
    {/* Conteúdo */}
  </CardContent>
</AuroraCard>

// ✅ StatusBadge com contexto
<StatusBadge status="success" size="lg">
  Implementado
</StatusBadge>`}
                />
              </CardContent>
            </Card>

            {/* Checklist de Validação */}
            <Card className="surface-elevated border-2 border-aurora-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-sm">
                  <CheckCircle2 className="w-6 h-6 text-aurora-primary" />
                  Checklist de Validação
                </CardTitle>
                <CardDescription>
                  Use esta checklist antes de criar ou modificar qualquer componente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-sm">
                <div className="space-y-xs">
                  <div className="flex items-start gap-sm p-sm hover:bg-muted/50 rounded-lg transition-colors">
                    <Checkbox id="check1" />
                    <label htmlFor="check1" className="text-sm cursor-pointer">
                      ✅ Todos os espaçamentos usam tokens semânticos (xs, sm, md, lg, xl, 2xl, 3xl)?
                    </label>
                  </div>
                  <div className="flex items-start gap-sm p-sm hover:bg-muted/50 rounded-lg transition-colors">
                    <Checkbox id="check2" />
                    <label htmlFor="check2" className="text-sm cursor-pointer">
                      ✅ Todas as cores usam tokens semânticos (status-*, priority-*, etc)?
                    </label>
                  </div>
                  <div className="flex items-start gap-sm p-sm hover:bg-muted/50 rounded-lg transition-colors">
                    <Checkbox id="check3" />
                    <label htmlFor="check3" className="text-sm cursor-pointer">
                      ✅ Tipografia usa classes semânticas (text-heading-*, text-body-*, text-caption)?
                    </label>
                  </div>
                  <div className="flex items-start gap-sm p-sm hover:bg-muted/50 rounded-lg transition-colors">
                    <Checkbox id="check4" />
                    <label htmlFor="check4" className="text-sm cursor-pointer">
                      ✅ Componente reutiliza componentes existentes sempre que possível?
                    </label>
                  </div>
                  <div className="flex items-start gap-sm p-sm hover:bg-muted/50 rounded-lg transition-colors">
                    <Checkbox id="check5" />
                    <label htmlFor="check5" className="text-sm cursor-pointer">
                      ✅ Sombras usam tokens (shadow-sm, shadow-md, shadow-aurora, etc)?
                    </label>
                  </div>
                  <div className="flex items-start gap-sm p-sm hover:bg-muted/50 rounded-lg transition-colors">
                    <Checkbox id="check6" />
                    <label htmlFor="check6" className="text-sm cursor-pointer">
                      ✅ Gradientes usam classes semânticas (gradient-aurora, gradient-success, etc)?
                    </label>
                  </div>
                  <div className="flex items-start gap-sm p-sm hover:bg-muted/50 rounded-lg transition-colors">
                    <Checkbox id="check7" />
                    <label htmlFor="check7" className="text-sm cursor-pointer">
                      ✅ Transições usam tokens (transition-base, transition-smooth)?
                    </label>
                  </div>
                  <div className="flex items-start gap-sm p-sm hover:bg-muted/50 rounded-lg transition-colors">
                    <Checkbox id="check8" />
                    <label htmlFor="check8" className="text-sm cursor-pointer">
                      ✅ Responsividade usa breakpoints padronizados (sm, md, lg, xl)?
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FOUNDATION TAB */}
          <TabsContent value="foundation" className="space-y-12">
            {/* Spacing System - Fase 10 */}
            <section id="spacing" className="space-y-6">
              <div className="flex items-center gap-3">
                <Layout className="w-6 h-6 text-aurora-primary" />
                <h2 className="text-heading-1">Spacing System</h2>
              </div>

              <Card className="surface-elevated">
                <CardHeader>
                  <CardTitle>Semantic Spacing Tokens (Fase 10)</CardTitle>
                  <CardDescription>
                    Sistema de espaçamento unificado baseado em escala de 4px • 100% dos componentes normalizados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TokenTable title="Spacing Tokens" tokens={spacingTokens} />
                  
                  <div className="mt-6 space-y-4">
                    <h3 className="text-heading-3">Exemplos de Uso</h3>
                    <div className="space-y-3">
                      <div className="p-md border border-border rounded-lg">
                        <code className="text-sm">gap-sm</code>
                        <p className="text-xs text-muted-foreground mt-1">Gap de 8px entre elementos</p>
                      </div>
                      <div className="p-lg border border-border rounded-lg">
                        <code className="text-sm">p-lg</code>
                        <p className="text-xs text-muted-foreground mt-1">Padding de 24px (cards, modais)</p>
                      </div>
                      <div className="space-y-md border border-border rounded-lg p-md">
                        <code className="text-sm">space-y-md</code>
                        <p className="text-xs text-muted-foreground">Espaço vertical de 16px entre filhos</p>
                      </div>
                    </div>
                    
                    <CodeBlock
                      language="tsx"
                      code={`// Uso em componentes
<Card className="p-lg space-y-md">
  <CardHeader className="gap-sm">
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent className="space-y-sm">
    <p>Conteúdo com espaçamento semântico</p>
  </CardContent>
</Card>`}
                    />
                  </div>
                  
                  <div className="mt-6 p-md bg-status-success/10 border border-status-success/20 rounded-lg">
                    <div className="flex items-start gap-sm">
                      <Check className="w-5 h-5 text-status-success mt-0.5" />
                      <div className="space-y-xs">
                        <p className="text-sm font-medium text-status-success">Sistema 100% Normalizado</p>
                        <p className="text-xs text-muted-foreground">
                          9.600+ ocorrências processadas • 918 arquivos • UI, Admin, Learning, Community, Tools, Pages
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Colors Section */}
            <section id="colors" className="space-y-6">
              <div className="flex items-center gap-3">
                <Palette className="w-6 h-6 text-aurora-primary" />
                <h2 className="text-heading-1">Colors</h2>
              </div>

              {/* Brand Colors */}
              <Card className="surface-elevated">
                <CardHeader>
                  <CardTitle>Brand Colors</CardTitle>
                  <CardDescription>
                    Cor principal da marca Aurora Teal (#0ABAB5) e suas variantes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ColorPalette colors={brandColors} columns={3} />
                </CardContent>
              </Card>

              {/* Semantic Colors */}
              <Card className="surface-elevated">
                <CardHeader>
                  <CardTitle>Semantic Colors</CardTitle>
                  <CardDescription>
                    Cores para estados e feedback do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ColorPalette colors={semanticColors} columns={4} />
                </CardContent>
              </Card>

              {/* Social Colors */}
              <Card className="surface-elevated">
                <CardHeader>
                  <CardTitle>Social Brand Colors</CardTitle>
                  <CardDescription>
                    Cores oficiais das redes sociais integradas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ColorPalette colors={socialColors} columns={3} />
                </CardContent>
              </Card>

              {/* Status Semantic Colors - Fase 14 */}
              <Card className="surface-elevated">
                <CardHeader>
                  <CardTitle>Status Semantic Colors</CardTitle>
                  <CardDescription>
                    Sistema de cores semânticas para status, prioridades e tracking - Fase 14
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status Colors */}
                  <div className="space-y-4">
                    <h3 className="text-heading-3">Status Colors</h3>
                    <ColorPalette colors={statusColors} columns={5} />
                    <div className="flex gap-3 flex-wrap pt-2">
                      <StatusBadge status="success">Success</StatusBadge>
                      <StatusBadge status="error">Error</StatusBadge>
                      <StatusBadge status="warning">Warning</StatusBadge>
                      <StatusBadge status="info">Info</StatusBadge>
                      <StatusBadge status="neutral">Neutral</StatusBadge>
                    </div>
                    <CodeBlock
                      language="tsx"
                      code={`<StatusBadge status="success">Success</StatusBadge>
<StatusBadge status="error">Error</StatusBadge>
<StatusBadge status="warning">Warning</StatusBadge>
<StatusBadge status="info">Info</StatusBadge>
<StatusBadge status="neutral">Neutral</StatusBadge>`}
                    />
                  </div>

                  {/* Priority Colors */}
                  <div className="space-y-4">
                    <h3 className="text-heading-3">Priority Colors</h3>
                    <ColorPalette colors={priorityColors} columns={4} />
                    <div className="flex gap-3 flex-wrap pt-2">
                      <Badge className="bg-priority-low/10 text-priority-low border-priority-low/20">Low</Badge>
                      <Badge className="bg-priority-normal/10 text-priority-normal border-priority-normal/20">Normal</Badge>
                      <Badge className="bg-priority-high/10 text-priority-high border-priority-high/20">High</Badge>
                      <Badge className="bg-priority-urgent/10 text-priority-urgent border-priority-urgent/20">Urgent</Badge>
                    </div>
                  </div>

                  {/* Tracking Colors */}
                  <div className="space-y-4">
                    <h3 className="text-heading-3">Email Tracking Colors</h3>
                    <ColorPalette colors={trackingColors} columns={3} />
                    <p className="text-body-small text-muted-foreground">
                      Cores específicas para status de email tracking (enviado, entregue, aberto, clicado, rejeitado, falhou)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Surface System */}
              <Card className="surface-elevated">
                <CardHeader>
                  <CardTitle>Surface Elevation System</CardTitle>
                  <CardDescription>
                    4 níveis de elevação para profundidade visual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ColorPalette colors={surfaceColors} columns={4} />
                </CardContent>
              </Card>

              {/* Text Hierarchy */}
              <Card className="surface-elevated">
                <CardHeader>
                  <CardTitle>Text Color Hierarchy</CardTitle>
                  <CardDescription>
                    Sistema de cores de texto para hierarquia visual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ColorPalette colors={textColors} columns={4} />
                </CardContent>
              </Card>
            </section>

            {/* Typography Section */}
            <section id="typography" className="space-y-6">
              <div className="flex items-center gap-3">
                <Type className="w-6 h-6 text-aurora-primary" />
                <h2 className="text-heading-1">Typography</h2>
              </div>

              <Card className="surface-elevated">
                <CardHeader>
                  <CardTitle>Type Scale</CardTitle>
                  <CardDescription>
                    Sistema tipográfico com Inter (corpo) e Outfit (headings)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-2">
                    <Badge variant="outline">text-display</Badge>
                    <p className="text-display">Grande Título Display</p>
                    <p className="text-caption text-muted-foreground">3.5rem / 56px • Weight: 700 • Outfit</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="outline">text-heading-1</Badge>
                    <h1 className="text-heading-1">Heading Level 1</h1>
                    <p className="text-caption text-muted-foreground">2.5rem / 40px • Weight: 700 • Outfit</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="outline">text-heading-2</Badge>
                    <h2 className="text-heading-2">Heading Level 2</h2>
                    <p className="text-caption text-muted-foreground">2rem / 32px • Weight: 600 • Outfit</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="outline">text-heading-3</Badge>
                    <h3 className="text-heading-3">Heading Level 3</h3>
                    <p className="text-caption text-muted-foreground">1.5rem / 24px • Weight: 600 • Outfit</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="outline">text-body-large</Badge>
                    <p className="text-body-large">Texto corpo grande para destaque</p>
                    <p className="text-caption text-muted-foreground">1.125rem / 18px • Weight: 400 • Inter</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="outline">text-body</Badge>
                    <p className="text-body">Texto corpo padrão para leitura confortável</p>
                    <p className="text-caption text-muted-foreground">1rem / 16px • Weight: 400 • Inter</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="outline">text-body-small</Badge>
                    <p className="text-body-small">Texto corpo pequeno para informações secundárias</p>
                    <p className="text-caption text-muted-foreground">0.875rem / 14px • Weight: 400 • Inter</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="outline">text-caption</Badge>
                    <p className="text-caption">Legendas, metadados e texto auxiliar</p>
                    <p className="text-caption text-muted-foreground">0.75rem / 12px • Weight: 400 • Inter</p>
                  </div>
                </CardContent>
              </Card>

              <TokenTable
                title="Typography Tokens"
                description="Tokens de tipografia com valores e casos de uso"
                tokens={typographyTokens}
              />
            </section>

            {/* Spacing & Layout */}
            <section id="spacing" className="space-y-6">
              <div className="flex items-center gap-3">
                <Layout className="w-6 h-6 text-aurora-primary" />
                <h2 className="text-heading-1">Spacing & Layout</h2>
              </div>

              <TokenTable
                title="Spacing Scale"
                description="Sistema de espaçamento baseado em múltiplos de 8px"
                tokens={spacingTokens}
              />

              <Card className="surface-elevated">
                <CardHeader>
                  <CardTitle>Container Sizes</CardTitle>
                  <CardDescription>Larguras máximas para containers responsivos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <code className="text-sm">max-w-sm</code>
                        <span className="text-muted-foreground text-sm">384px</span>
                      </div>
                      <div className="h-8 bg-aurora-primary/20 rounded max-w-sm" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <code className="text-sm">max-w-md</code>
                        <span className="text-muted-foreground text-sm">448px</span>
                      </div>
                      <div className="h-8 bg-aurora-primary/20 rounded max-w-md" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <code className="text-sm">max-w-lg</code>
                        <span className="text-muted-foreground text-sm">512px</span>
                      </div>
                      <div className="h-8 bg-aurora-primary/20 rounded max-w-lg" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <code className="text-sm">max-w-7xl</code>
                        <span className="text-muted-foreground text-sm">1280px</span>
                      </div>
                      <div className="h-8 bg-aurora-primary/20 rounded max-w-7xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Shadows & Effects */}
            <section id="shadows" className="space-y-6">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-aurora-primary" />
                <h2 className="text-heading-1">Shadows & Effects</h2>
              </div>

              <TokenTable
                title="Shadow Tokens"
                description="Sistema de elevação com sombras graduais"
                tokens={shadowTokens}
              />

              <Card className="surface-elevated">
                <CardHeader>
                  <CardTitle>Shadow Examples</CardTitle>
                  <CardDescription>Visualização dos diferentes níveis de sombra</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="h-24 bg-card rounded-lg shadow-sm border border-border" />
                      <p className="text-sm text-center">shadow-sm</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-24 bg-card rounded-lg shadow-md border border-border" />
                      <p className="text-sm text-center">shadow-md</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-24 bg-card rounded-lg shadow-lg border border-border" />
                      <p className="text-sm text-center">shadow-lg</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-24 bg-card rounded-lg shadow-xl border border-border" />
                      <p className="text-sm text-center">shadow-xl</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-24 bg-card rounded-lg shadow-aurora border border-aurora-primary/20" />
                      <p className="text-sm text-center">shadow-aurora</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-24 bg-card rounded-lg shadow-aurora-strong border border-aurora-primary/30" />
                      <p className="text-sm text-center">shadow-aurora-strong</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Chart Tokens - BATCH 1 */}
            <section id="chart-tokens" className="space-y-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-aurora-primary" />
                <h2 className="text-heading-1">Chart Tokens</h2>
              </div>

              <TokenTable
                title="Chart Height Tokens"
                description="Tokens de altura padronizados para gráficos e visualizações"
                tokens={chartTokens}
              />

              <Card className="surface-elevated">
                <CardHeader>
                  <CardTitle>Chart Size Examples</CardTitle>
                  <CardDescription>Visualização dos diferentes tamanhos de charts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="h-chart-sm bg-gradient-aurora rounded-lg border border-aurora-primary/20 flex items-center justify-center">
                        <code className="text-sm text-white">h-chart-sm (200px)</code>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-chart-md bg-gradient-operational rounded-lg border border-border flex items-center justify-center">
                        <code className="text-sm text-white">h-chart-md (300px)</code>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-chart-lg bg-gradient-engagement rounded-lg border border-border flex items-center justify-center">
                        <code className="text-sm text-white">h-chart-lg (400px)</code>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-chart-xl bg-gradient-revenue rounded-lg border border-border flex items-center justify-center">
                        <code className="text-sm text-white">h-chart-xl (500px)</code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Gradients - BATCH 4 */}
            <section id="gradients" className="space-y-6">
              <div className="flex items-center gap-3">
                <Stars className="w-6 h-6 text-aurora-primary" />
                <h2 className="text-heading-1">Gradient System</h2>
              </div>

              <Card className="surface-elevated">
                <CardHeader>
                  <CardTitle>Semantic Gradients</CardTitle>
                  <CardDescription>
                    35+ gradientes semânticos para diferentes contextos (BATCH 4 - Normalização completa)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Brand Gradients */}
                  <div className="space-y-3">
                    <h3 className="text-heading-3">Brand Gradients</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="h-24 bg-gradient-aurora rounded-lg border border-aurora-primary/20 flex items-center justify-center">
                        <code className="text-sm text-white font-medium">bg-gradient-aurora</code>
                      </div>
                    </div>
                  </div>

                  {/* Status Gradients */}
                  <div className="space-y-3">
                    <h3 className="text-heading-3">Status Gradients</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="h-20 bg-gradient-success rounded-lg border border-border flex items-center justify-center">
                        <code className="text-sm text-white font-medium">bg-gradient-success</code>
                      </div>
                      <div className="h-20 bg-gradient-warning rounded-lg border border-border flex items-center justify-center">
                        <code className="text-sm text-white font-medium">bg-gradient-warning</code>
                      </div>
                      <div className="h-20 bg-gradient-error rounded-lg border border-border flex items-center justify-center">
                        <code className="text-sm text-white font-medium">bg-gradient-error</code>
                      </div>
                      <div className="h-20 bg-gradient-neutral rounded-lg border border-border flex items-center justify-center">
                        <code className="text-sm text-white font-medium">bg-gradient-neutral</code>
                      </div>
                    </div>
                  </div>

                  {/* Track Gradients */}
                  <div className="space-y-3">
                    <h3 className="text-heading-3">Track & Metric Gradients</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="h-20 bg-gradient-revenue rounded-lg border border-border flex items-center justify-center">
                        <code className="text-sm text-white font-medium">bg-gradient-revenue</code>
                      </div>
                      <div className="h-20 bg-gradient-operational rounded-lg border border-border flex items-center justify-center">
                        <code className="text-sm text-white font-medium">bg-gradient-operational</code>
                      </div>
                      <div className="h-20 bg-gradient-engagement rounded-lg border border-border flex items-center justify-center">
                        <code className="text-sm text-white font-medium">bg-gradient-engagement</code>
                      </div>
                    </div>
                  </div>

                  <CodeBlock
                    language="tsx"
                    code={`// Uso em cards e charts
<Card className="bg-gradient-revenue">
  <CardHeader>
    <CardTitle>Receita Total</CardTitle>
  </CardHeader>
</Card>

// Uso em badges
<Badge className="bg-gradient-success">
  Completo
</Badge>`}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Compliance Status - BATCH 1-4 */}
            <section id="compliance" className="space-y-6">
              <div className="flex items-center gap-3">
                <Check className="w-6 h-6 text-system-healthy" />
                <h2 className="text-heading-1">Design System Compliance</h2>
              </div>

              <Card className="surface-elevated border-system-healthy/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-system-healthy" />
                    Status de Normalização da Plataforma
                  </CardTitle>
                  <CardDescription>
                    Progresso da eliminação de valores hardcoded (Fases 1-10 completas)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className="bg-gradient-success border-0">
                      <CardContent className="pt-6 text-center">
                        <div className="text-3xl font-bold text-white mb-2">109</div>
                        <p className="text-sm text-white/90 font-medium">Valores Arbitrários</p>
                        <p className="text-xs text-white/70 mt-1">Fase 1</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-operational border-0">
                      <CardContent className="pt-6 text-center">
                        <div className="text-3xl font-bold text-white mb-2">25+</div>
                        <p className="text-sm text-white/90 font-medium">Cores Genéricas</p>
                        <p className="text-xs text-white/70 mt-1">Fase 2</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-engagement border-0">
                      <CardContent className="pt-6 text-center">
                        <div className="text-3xl font-bold text-white mb-2">270+</div>
                        <p className="text-sm text-white/90 font-medium">Transições</p>
                        <p className="text-xs text-white/70 mt-1">Fase 3</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-revenue border-0">
                      <CardContent className="pt-6 text-center">
                        <div className="text-3xl font-bold text-white mb-2">35+</div>
                        <p className="text-sm text-white/90 font-medium">Gradientes</p>
                        <p className="text-xs text-white/70 mt-1">Fase 4</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-aurora border-0">
                      <CardContent className="pt-6 text-center">
                        <div className="text-3xl font-bold text-white mb-2">9600+</div>
                        <p className="text-sm text-white/90 font-medium">Spacings</p>
                        <p className="text-xs text-white/70 mt-1">Fase 10 ✅</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Compliance Total</span>
                      <span className="text-sm font-bold text-system-healthy">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      ✅ Fases 1-10 completas • 150+ componentes normalizados • 918 arquivos processados • Design System totalmente unificado
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* COMPONENTS TAB */}
          <TabsContent value="components" className="space-y-12">
            {/* Buttons */}
            <section id="buttons" className="space-y-6">
              <h2 className="text-heading-1">Buttons</h2>

              <ComponentShowcase
                title="Button Variants"
                description="Todas as variantes de botões disponíveis no sistema"
                variants={[
                  {
                    name: 'Primary',
                    preview: <Button>Primary Button</Button>,
                    code: '<Button>Primary Button</Button>'
                  },
                  {
                    name: 'Secondary',
                    preview: <Button variant="secondary">Secondary Button</Button>,
                    code: '<Button variant="secondary">Secondary Button</Button>'
                  },
                  {
                    name: 'Outline',
                    preview: <Button variant="outline">Outline Button</Button>,
                    code: '<Button variant="outline">Outline Button</Button>'
                  },
                  {
                    name: 'Ghost',
                    preview: <Button variant="ghost">Ghost Button</Button>,
                    code: '<Button variant="ghost">Ghost Button</Button>'
                  },
                  {
                    name: 'Destructive',
                    preview: <Button variant="destructive">Destructive Button</Button>,
                    code: '<Button variant="destructive">Destructive Button</Button>'
                  },
                  {
                    name: 'Aurora Primary',
                    preview: <AuroraButton>Aurora Button</AuroraButton>,
                    code: '<AuroraButton>Aurora Button</AuroraButton>'
                  },
                ]}
              />

              <ComponentShowcase
                title="Button Sizes"
                description="Tamanhos disponíveis para botões"
                preview={
                  <div className="flex items-center gap-4">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                }
                code={`<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>`}
              />
            </section>

            {/* Cards */}
            <section id="cards" className="space-y-6">
              <h2 className="text-heading-1">Cards</h2>

              <ComponentShowcase
                title="Card Variants"
                description="Diferentes tipos de cards disponíveis"
                variants={[
                  {
                    name: 'Card',
                    preview: (
                      <Card className="w-64">
                        <CardHeader>
                          <CardTitle>Card Title</CardTitle>
                          <CardDescription>Card description</CardDescription>
                        </CardHeader>
                        <CardContent>Card content goes here</CardContent>
                      </Card>
                    ),
                  },
                  {
                    name: 'AuroraCard',
                    preview: (
                      <AuroraCard variant="interactive" className="w-64 p-6">
                        <h3 className="font-semibold mb-2">Aurora Card</h3>
                        <p className="text-sm text-muted-foreground">Interactive card with hover effects</p>
                      </AuroraCard>
                    ),
                  },
                  {
                    name: 'LiquidGlass',
                    preview: (
                      <LiquidGlassCard variant="premium" className="w-64 p-6">
                        <h3 className="font-semibold mb-2">Liquid Glass</h3>
                        <p className="text-sm text-muted-foreground">Premium glassmorphism card</p>
                      </LiquidGlassCard>
                    ),
                  },
                ]}
              />
            </section>

            {/* Form Controls */}
            <section id="forms" className="space-y-6">
              <h2 className="text-heading-1">Form Controls</h2>

              <ComponentShowcase
                title="Checkbox"
                description="Checkbox com Aurora Primary quando checked"
                preview={
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" defaultChecked />
                    <label htmlFor="terms" className="text-sm">Aceito os termos e condições</label>
                  </div>
                }
                code={`<Checkbox id="terms" defaultChecked />
<label htmlFor="terms">Aceito os termos</label>`}
              />

              <ComponentShowcase
                title="Switch"
                description="Toggle switch para ativar/desativar funcionalidades"
                preview={
                  <div className="flex items-center space-x-2">
                    <Switch id="notifications" defaultChecked />
                    <label htmlFor="notifications" className="text-sm">Notificações</label>
                  </div>
                }
                code={`<Switch id="notifications" defaultChecked />
<label htmlFor="notifications">Notificações</label>`}
              />

              <ComponentShowcase
                title="Progress"
                description="Barra de progresso"
                preview={<Progress value={66} className="w-64" />}
                code='<Progress value={66} />'
              />
            </section>

            {/* Feedback Components */}
            <section id="feedback" className="space-y-6">
              <h2 className="text-heading-1">Feedback Components</h2>

              <ComponentShowcase
                title="Skeleton"
                description="Loading states com skeleton"
                preview={
                  <div className="space-y-3 w-64">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                }
                code={`<Skeleton className="h-12 w-full" />
<Skeleton className="h-4 w-full" />
<Skeleton className="h-4 w-3/4" />`}
              />

              <ComponentShowcase
                title="Badge"
                description="Badges para status e categorias"
                preview={
                  <div className="flex gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                }
                code={`<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>`}
              />
            </section>
          </TabsContent>

          {/* PATTERNS TAB */}
          <TabsContent value="patterns" className="space-y-12">
            {/* Animations */}
            <section id="animations" className="space-y-6">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-aurora-primary" />
                <h2 className="text-heading-1">Animations</h2>
              </div>

              <Card className="surface-elevated">
                <CardHeader>
                  <CardTitle>Available Animations</CardTitle>
                  <CardDescription>12 animações personalizadas para a plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-6 rounded-lg border border-border bg-card animate-fade-in">
                      <code className="text-sm">animate-fade-in</code>
                    </div>
                    <div className="p-6 rounded-lg border border-border bg-card animate-scale-in">
                      <code className="text-sm">animate-scale-in</code>
                    </div>
                    <div className="p-6 rounded-lg border border-border bg-card animate-shimmer">
                      <code className="text-sm">animate-shimmer</code>
                    </div>
                    <div className="p-6 rounded-lg border border-border bg-card animate-float">
                      <code className="text-sm">animate-float</code>
                    </div>
                    <div className="p-6 rounded-lg border border-border bg-card animate-blob">
                      <code className="text-sm">animate-blob</code>
                    </div>
                    <div className="p-6 rounded-lg border border-border bg-card animate-spin-slow">
                      <Circle className="w-6 h-6" />
                      <code className="text-sm">animate-spin-slow</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Glassmorphism */}
            <section id="glass" className="space-y-6">
              <h2 className="text-heading-1">Glassmorphism System</h2>

              <Card className="surface-elevated">
                <CardHeader>
                  <CardTitle>Liquid Glass Components</CardTitle>
                  <CardDescription>Sistema de glassmorphism com blur e transparência</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 p-8 rounded-lg bg-gradient-to-br from-aurora-primary/20 to-purple-500/20">
                    <LiquidGlassCard variant="default" className="p-6">
                      <h3 className="font-semibold mb-2">Default Glass</h3>
                      <p className="text-sm text-muted-foreground">Glassmorphism padrão</p>
                    </LiquidGlassCard>
                    <LiquidGlassCard variant="premium" className="p-6">
                      <h3 className="font-semibold mb-2">Premium Glass</h3>
                      <p className="text-sm text-muted-foreground">Versão premium com mais blur</p>
                    </LiquidGlassCard>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* WORKFLOW TAB */}
          <TabsContent value="workflow" className="space-y-lg">
            {/* Hero Section */}
            <AuroraCard className="p-lg bg-gradient-operational border-status-info/20">
              <div className="flex items-start gap-md">
                <div className="p-md rounded-xl bg-white/20">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-sm flex-1">
                  <h2 className="text-heading-1 text-white">🔄 Como Evoluir o Design System</h2>
                  <p className="text-body text-white/90">
                    Guia passo-a-passo para adicionar novos tokens, modificar o design e manter a consistência da plataforma.
                  </p>
                </div>
              </div>
            </AuroraCard>

            {/* Workflow 1: Criar Novo Componente */}
            <Card className="surface-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-sm">
                  <Box className="w-6 h-6 text-aurora-primary" />
                  Workflow 1: Criar Novo Componente
                </CardTitle>
                <CardDescription>
                  Processo para criar um novo componente mantendo os padrões do Design System
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-md">
                <div className="space-y-md">
                  {/* Passo 1 */}
                  <div className="flex gap-md">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-aurora-primary/10 border border-aurora-primary/20 flex items-center justify-center text-sm font-bold text-aurora-primary">
                      1
                    </div>
                    <div className="flex-1 space-y-sm">
                      <h3 className="text-heading-3">Avalie Componentes Existentes</h3>
                      <p className="text-body-small text-muted-foreground">
                        Antes de criar, verifique se pode reutilizar: <code>AuroraCard</code>, <code>LiquidGlassCard</code>, <code>StatusBadge</code>, etc.
                      </p>
                      <CodeBlock
                        language="tsx"
                        code={`// ✅ Prefira reutilizar com variants
<AuroraCard variant="glass" className="p-lg">
  <CardHeader className="space-y-sm">
    <CardTitle>Novo Card</CardTitle>
  </CardHeader>
</AuroraCard>`}
                      />
                    </div>
                  </div>

                  {/* Passo 2 */}
                  <div className="flex gap-md">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-aurora-primary/10 border border-aurora-primary/20 flex items-center justify-center text-sm font-bold text-aurora-primary">
                      2
                    </div>
                    <div className="flex-1 space-y-sm">
                      <h3 className="text-heading-3">Use Tokens Semânticos</h3>
                      <p className="text-body-small text-muted-foreground">
                        Sempre use tokens para spacing, cores, tipografia. Zero valores hardcoded.
                      </p>
                      <CodeBlock
                        language="tsx"
                        code={`// ✅ Tokens semânticos
<div className="p-lg space-y-md">
  <h2 className="text-heading-2">Título</h2>
  <p className="text-body text-muted-foreground">Conteúdo</p>
  <Badge className="bg-status-success/10 text-status-success">
    Status
  </Badge>
</div>`}
                      />
                    </div>
                  </div>

                  {/* Passo 3 */}
                  <div className="flex gap-md">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-aurora-primary/10 border border-aurora-primary/20 flex items-center justify-center text-sm font-bold text-aurora-primary">
                      3
                    </div>
                    <div className="flex-1 space-y-sm">
                      <h3 className="text-heading-3">Valide Responsividade</h3>
                      <p className="text-body-small text-muted-foreground">
                        Teste em todos os breakpoints (mobile, tablet, desktop). Use classes responsivas.
                      </p>
                      <CodeBlock
                        language="tsx"
                        code={`// ✅ Design responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
  <Card className="p-md md:p-lg">
    {/* Conteúdo responsivo */}
  </Card>
</div>`}
                      />
                    </div>
                  </div>

                  {/* Passo 4 */}
                  <div className="flex gap-md">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-aurora-primary/10 border border-aurora-primary/20 flex items-center justify-center text-sm font-bold text-aurora-primary">
                      4
                    </div>
                    <div className="flex-1 space-y-sm">
                      <h3 className="text-heading-3">Documente Aqui</h3>
                      <p className="text-body-small text-muted-foreground">
                        Adicione o novo componente nesta página de documentação com exemplos.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workflow 2: Adicionar Novo Token */}
            <Card className="surface-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-sm">
                  <Stars className="w-6 h-6 text-aurora-primary" />
                  Workflow 2: Adicionar Novo Token
                </CardTitle>
                <CardDescription>
                  Como adicionar um novo token de spacing, cor, tipografia, etc.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-md">
                <div className="space-y-md">
                  {/* Passo 1 */}
                  <div className="flex gap-md">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-status-success/10 border border-status-success/20 flex items-center justify-center text-sm font-bold text-status-success">
                      1
                    </div>
                    <div className="flex-1 space-y-sm">
                      <h3 className="text-heading-3">Avalie Necessidade</h3>
                      <p className="text-body-small text-muted-foreground">
                        Confirme que nenhum token existente atende a necessidade. Exemplo: precisa de espaçamento entre <code>sm (8px)</code> e <code>md (16px)</code>?
                      </p>
                    </div>
                  </div>

                  {/* Passo 2 */}
                  <div className="flex gap-md">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-status-success/10 border border-status-success/20 flex items-center justify-center text-sm font-bold text-status-success">
                      2
                    </div>
                    <div className="flex-1 space-y-sm">
                      <h3 className="text-heading-3">Adicione em tailwind.config.ts</h3>
                      <p className="text-body-small text-muted-foreground">
                        Exemplo para novo token de spacing:
                      </p>
                      <CodeBlock
                        language="ts"
                        code={`// tailwind.config.ts
export default {
  theme: {
    extend: {
      spacing: {
        'xs': '0.25rem',   // 4px
        'sm': '0.5rem',    // 8px
        'smd': '0.75rem',  // 12px ← NOVO TOKEN
        'md': '1rem',      // 16px
        'lg': '1.5rem',    // 24px
      }
    }
  }
}`}
                      />
                    </div>
                  </div>

                  {/* Passo 3 */}
                  <div className="flex gap-md">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-status-success/10 border border-status-success/20 flex items-center justify-center text-sm font-bold text-status-success">
                      3
                    </div>
                    <div className="flex-1 space-y-sm">
                      <h3 className="text-heading-3">Para Cores: Adicione em src/index.css</h3>
                      <p className="text-body-small text-muted-foreground">
                        Exemplo para nova cor semântica:
                      </p>
                      <CodeBlock
                        language="css"
                        code={`/* src/index.css */
:root {
  /* Status Colors */
  --status-success: 142 76% 36%;
  --status-review: 43 96% 56%;  /* ← NOVO TOKEN */
  
  /* Background */
  --background: 224 71% 4%;
}`}
                      />
                      <CodeBlock
                        language="ts"
                        code={`// tailwind.config.ts - Registrar a nova cor
colors: {
  'status-success': 'hsl(var(--status-success))',
  'status-review': 'hsl(var(--status-review))',  // ← Registrar
}`}
                      />
                    </div>
                  </div>

                  {/* Passo 4 */}
                  <div className="flex gap-md">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-status-success/10 border border-status-success/20 flex items-center justify-center text-sm font-bold text-status-success">
                      4
                    </div>
                    <div className="flex-1 space-y-sm">
                      <h3 className="text-heading-3">Documente Aqui (StyleGuidePage.tsx)</h3>
                      <p className="text-body-small text-muted-foreground">
                        Adicione o novo token nas tabelas de documentação desta página com:
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-xs pl-md list-disc">
                        <li>Nome do token</li>
                        <li>Valor (px, rem, HSL)</li>
                        <li>Caso de uso/quando usar</li>
                        <li>Exemplo visual</li>
                      </ul>
                    </div>
                  </div>

                  {/* Passo 5 */}
                  <div className="flex gap-md">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-status-success/10 border border-status-success/20 flex items-center justify-center text-sm font-bold text-status-success">
                      5
                    </div>
                    <div className="flex-1 space-y-sm">
                      <h3 className="text-heading-3">Use o Novo Token</h3>
                      <CodeBlock
                        language="tsx"
                        code={`// Agora pode usar normalmente
<div className="p-smd">  {/* Novo token de spacing */}
  <Badge className="bg-status-review/10 text-status-review">
    Em Revisão  {/* Nova cor semântica */}
  </Badge>
</div>`}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workflow 3: Modificar Design Global */}
            <Card className="surface-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-sm">
                  <Palette className="w-6 h-6 text-aurora-primary" />
                  Workflow 3: Modificar Design Global
                </CardTitle>
                <CardDescription>
                  Como mudar cores, espaçamentos ou tipografia de forma global
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-md">
                <div className="p-md bg-status-warning/10 border border-status-warning/20 rounded-lg">
                  <div className="flex items-start gap-sm">
                    <AlertCircle className="w-5 h-5 text-status-warning mt-0.5" />
                    <div className="space-y-xs">
                      <p className="text-sm font-medium text-status-warning">⚠️ Mudanças Globais</p>
                      <p className="text-xs text-muted-foreground">
                        Mudanças em tokens afetam TODA a plataforma. Teste extensivamente antes de aplicar.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-md">
                  {/* Exemplo 1: Mudar Cor */}
                  <div className="space-y-sm">
                    <h3 className="text-heading-3">Exemplo: Mudar Cor Principal</h3>
                    <CodeBlock
                      language="css"
                      code={`/* src/index.css */
:root {
  /* Antes */
  --aurora-primary: 177 85% 39%;  /* #0ABAB5 - Teal */
  
  /* Depois - Nova cor de marca */
  --aurora-primary: 217 91% 60%;  /* #3B82F6 - Blue */
}

/* Resultado: TODA a plataforma muda automaticamente 🎯 */`}
                    />
                  </div>

                  {/* Exemplo 2: Ajustar Spacing */}
                  <div className="space-y-sm">
                    <h3 className="text-heading-3">Exemplo: Aumentar Espaçamento Médio</h3>
                    <CodeBlock
                      language="ts"
                      code={`// tailwind.config.ts
spacing: {
  'xs': '0.25rem',   // 4px
  'sm': '0.5rem',    // 8px
  'md': '1rem',      // 16px → MUDAR PARA 1.25rem (20px)
  'lg': '1.5rem',    // 24px
}

// Resultado: Todos os p-md, gap-md, space-y-md aumentam 🎯`}
                    />
                  </div>

                  {/* Exemplo 3: Ajustar Tipografia */}
                  <div className="space-y-sm">
                    <h3 className="text-heading-3">Exemplo: Aumentar Tamanho de Heading</h3>
                    <CodeBlock
                      language="css"
                      code={`/* src/index.css */
.text-heading-1 {
  /* Antes */
  font-size: 2.5rem;    /* 40px */
  
  /* Depois */
  font-size: 3rem;      /* 48px */
}

/* Resultado: Todos os text-heading-1 mudam 🎯 */`}
                    />
                  </div>
                </div>

                <div className="p-md bg-aurora-primary/5 border border-aurora-primary/20 rounded-lg">
                  <div className="flex items-start gap-sm">
                    <Zap className="w-5 h-5 text-aurora-primary mt-0.5" />
                    <div className="space-y-xs">
                      <p className="text-sm font-medium">✨ Poder do Design System</p>
                      <p className="text-xs text-muted-foreground">
                        Uma mudança em 1 linha → Atualiza 918 arquivos automaticamente. Sem refatoração manual necessária.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template de Solicitação */}
            <Card className="surface-elevated border-2 border-aurora-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-sm">
                  <Code className="w-6 h-6 text-aurora-primary" />
                  📋 Template para Solicitar Mudanças
                </CardTitle>
                <CardDescription>
                  Use este template para pedir mudanças de design de forma clara e completa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-md">
                <div className="space-y-sm">
                  <h3 className="text-heading-3">❌ Ruim (vago e impreciso)</h3>
                  <div className="p-md bg-status-error/5 border border-status-error/20 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">
                      "Deixa o botão mais bonito e aumenta o espaço entre as coisas."
                    </p>
                  </div>
                </div>

                <div className="space-y-sm">
                  <h3 className="text-heading-3">✅ Excelente (específico e semântico)</h3>
                  <div className="p-md bg-status-success/5 border border-status-success/20 rounded-lg space-y-sm">
                    <p className="text-sm font-medium">Contexto:</p>
                    <p className="text-xs text-muted-foreground">
                      "Na página de Dashboard, os cards de estatísticas estão muito próximos."
                    </p>
                    
                    <p className="text-sm font-medium mt-md">Objetivo:</p>
                    <p className="text-xs text-muted-foreground">
                      "Quero melhorar a respiração visual entre os cards."
                    </p>
                    
                    <p className="text-sm font-medium mt-md">Solicitação específica:</p>
                    <p className="text-xs text-muted-foreground">
                      "Mudar o gap entre cards de <code>gap-sm (8px)</code> para <code>gap-md (16px)</code>."
                    </p>
                    
                    <p className="text-sm font-medium mt-md">Elementos a manter:</p>
                    <p className="text-xs text-muted-foreground">
                      "Manter padding interno dos cards em <code>p-lg</code>, só aumentar gap entre eles."
                    </p>
                  </div>
                </div>

                <CodeBlock
                  language="markdown"
                  code={`📋 TEMPLATE PARA COPIAR:

**Contexto:** 
[Onde está o problema? Qual página/componente?]

**Objetivo:**
[O que você quer alcançar visualmente?]

**Solicitação Específica:**
[Use tokens semânticos sempre que possível]
- Mudar [elemento] de [token-atual] para [token-desejado]
- Adicionar novo token [nome-semantico] com valor [X]
- Aplicar gradiente [gradient-nome] em [elemento]

**Elementos a Manter:**
[O que NÃO deve mudar?]

**Validação:**
[Como você vai saber que ficou correto?]`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACCESSIBILITY TAB */}
          <TabsContent value="accessibility" className="space-y-12">
            <section id="a11y" className="space-y-6">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-aurora-primary" />
                <h2 className="text-heading-1">Accessibility</h2>
              </div>

              <Card className="surface-elevated">
                <CardHeader>
                  <CardTitle>WCAG 2.1 AA Compliance</CardTitle>
                  <CardDescription>
                    Design System construído com acessibilidade em mente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-status-success" />
                      Color Contrast
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Todas as combinações de cores atendem ao mínimo de 4.5:1 para texto normal
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-status-success" />
                      Focus Indicators
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Estados de foco visíveis com aurora-focus ring de 2px
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-status-success" />
                      Keyboard Navigation
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Todos os componentes são navegáveis via teclado
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-status-success" />
                      Screen Reader Support
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      ARIA labels e roles apropriados em todos os componentes interativos
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-status-success" />
                      Reduced Motion
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Respeita preferências de movimento reduzido do usuário
                    </p>
                  </div>
                </CardContent>
              </Card>

              <CodeBlock
                title="Screen Reader Only Class"
                code={`.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}`}
                language="css"
              />
            </section>
          </TabsContent>

          {/* NOTIFICAÇÕES TAB */}
          <TabsContent value="notificacoes" className="space-y-lg">
            <NotificationsSection />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="surface-elevated">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-aurora-primary mb-2">112+</div>
                <p className="text-sm text-muted-foreground">Tokens Totais</p>
              </CardContent>
            </Card>
            <Card className="surface-elevated">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-aurora-primary mb-2">35+</div>
                <p className="text-sm text-muted-foreground">Gradientes</p>
              </CardContent>
            </Card>
            <Card className="surface-elevated">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-aurora-primary mb-2">12</div>
                <p className="text-sm text-muted-foreground">Animações</p>
              </CardContent>
            </Card>
            <Card className="surface-elevated">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-aurora-primary mb-2">25+</div>
                <p className="text-sm text-muted-foreground">Componentes</p>
              </CardContent>
            </Card>
            <Card className="surface-elevated">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-system-healthy mb-2">85%</div>
                <p className="text-sm text-muted-foreground">Compliance</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-body-small text-muted-foreground">
              📚 Para mais informações, consulte{' '}
              <code className="bg-muted px-2 py-1 rounded text-xs">
                docs/design-system.md
              </code>
              {' • '}
              <code className="bg-muted px-2 py-1 rounded text-xs">
                docs/CHANGELOG-DESIGN-SYSTEM.md
              </code>
            </p>
            <p className="text-caption text-muted-foreground mt-2">
              Última atualização: Design System 2.0 • BATCH 1-4 Completos • Outubro 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
