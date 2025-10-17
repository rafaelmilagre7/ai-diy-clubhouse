import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, Type, Sparkles, Layout, Zap, Shield, Search,
  Box, Circle, Square, Layers, Eye, Moon, Sun, Check
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

/**
 * Design System 2.0 - Documentação Visual Completa
 * Documentação interativa de todos os tokens, componentes e padrões da plataforma
 */
export default function StyleGuidePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('foundation');

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

  // Tokens de Spacing
  const spacingTokens: Token[] = [
    { name: '0.5rem', value: '8px', usage: 'Espaçamento extra pequeno', type: 'spacing' },
    { name: '1rem', value: '16px', usage: 'Espaçamento pequeno', type: 'spacing' },
    { name: '1.5rem', value: '24px', usage: 'Espaçamento médio', type: 'spacing' },
    { name: '2rem', value: '32px', usage: 'Espaçamento grande', type: 'spacing' },
    { name: '3rem', value: '48px', usage: 'Espaçamento extra grande', type: 'spacing' },
    { name: '4rem', value: '64px', usage: 'Espaçamento muito grande', type: 'spacing' },
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b border-border bg-gradient-to-br from-aurora-primary/5 via-background to-background">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-aurora-primary/10 border border-aurora-primary/20">
              <Sparkles className="w-8 h-8 text-aurora-primary" />
            </div>
            <div>
              <h1 className="text-display">Design System 2.0</h1>
              <p className="text-body text-muted-foreground">
                Documentação visual completa • 84 tokens • 12 animações • 25+ componentes
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
              <TabsTrigger value="foundation" className="gap-2">
                <Layers className="w-4 h-4" />
                Foundation
              </TabsTrigger>
              <TabsTrigger value="components" className="gap-2">
                <Box className="w-4 h-4" />
                Components
              </TabsTrigger>
              <TabsTrigger value="patterns" className="gap-2">
                <Zap className="w-4 h-4" />
                Patterns
              </TabsTrigger>
              <TabsTrigger value="accessibility" className="gap-2">
                <Shield className="w-4 h-4" />
                Accessibility
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

          {/* FOUNDATION TAB */}
          <TabsContent value="foundation" className="space-y-12">
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
                      <Check className="w-4 h-4 text-green-500" />
                      Color Contrast
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Todas as combinações de cores atendem ao mínimo de 4.5:1 para texto normal
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Focus Indicators
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Estados de foco visíveis com aurora-focus ring de 2px
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Keyboard Navigation
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Todos os componentes são navegáveis via teclado
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Screen Reader Support
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      ARIA labels e roles apropriados em todos os componentes interativos
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
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
        </Tabs>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="surface-elevated">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-aurora-primary mb-2">84</div>
                <p className="text-sm text-muted-foreground">Color Tokens</p>
              </CardContent>
            </Card>
            <Card className="surface-elevated">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-aurora-primary mb-2">12</div>
                <p className="text-sm text-muted-foreground">Animations</p>
              </CardContent>
            </Card>
            <Card className="surface-elevated">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-aurora-primary mb-2">25+</div>
                <p className="text-sm text-muted-foreground">Components</p>
              </CardContent>
            </Card>
            <Card className="surface-elevated">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-aurora-primary mb-2">v13.2</div>
                <p className="text-sm text-muted-foreground">Version</p>
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
              Última atualização: Design System 2.0 • Outubro 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
