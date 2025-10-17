import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Palette, Type, Sparkles, TrendingUp } from 'lucide-react';
import { BarChart } from '@/components/ui/chart/bar-chart';
import { AreaChart } from '@/components/ui/chart/area-chart';
import { PieChart } from '@/components/ui/chart/pie-chart';
import { chartColors } from '@/lib/chart-utils';

/**
 * Página Style Guide - Documentação visual do Design System
 * Mostra todos os componentes, cores, tipografia e padrões da plataforma
 */
export default function StyleGuidePage() {
  // Dados de exemplo para gráficos
  const barData = [
    { name: 'Jan', value: 400 },
    { name: 'Fev', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Abr', value: 800 },
    { name: 'Mai', value: 500 },
  ];

  const pieData = [
    { name: 'Categoria A', value: 400 },
    { name: 'Categoria B', value: 300 },
    { name: 'Categoria C', value: 200 },
    { name: 'Categoria D', value: 100 },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-aurora-primary" />
            <h1 className="text-display">Design System</h1>
          </div>
          <p className="text-body-large text-text-secondary">
            Guia visual completo do Design System da plataforma Viver de IA
          </p>
        </div>

        {/* Cores Principais */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-aurora-primary" />
            <h2 className="text-heading-1">Paleta de Cores</h2>
          </div>
          
          <Card className="surface-elevated">
            <CardHeader>
              <CardTitle>Cores da Marca</CardTitle>
              <CardDescription>
                Cor principal Aurora Teal (#0ABAB5) e suas variantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch
                  name="Aurora Primary"
                  cssVar="--aurora-primary"
                  className="bg-aurora-primary"
                  hex="#0ABAB5"
                />
                <ColorSwatch
                  name="Primary Light"
                  cssVar="--aurora-primary-light"
                  className="bg-aurora-primary-light"
                  hex="Variante Clara"
                />
                <ColorSwatch
                  name="Primary Dark"
                  cssVar="--aurora-primary-dark"
                  className="bg-aurora-primary-dark"
                  hex="Variante Escura"
                />
                <ColorSwatch
                  name="Destructive"
                  cssVar="--destructive"
                  className="bg-destructive"
                  hex="Vermelho"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="surface-elevated">
            <CardHeader>
              <CardTitle>Cores de Gráficos</CardTitle>
              <CardDescription>
                Paleta categórica para visualizações de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {chartColors.categorical.map((color, idx) => (
                  <div
                    key={idx}
                    className="h-24 rounded-lg border border-border flex items-end p-3"
                    style={{ backgroundColor: color }}
                  >
                    <Badge variant="secondary" className="text-xs">
                      Cor {idx + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tipografia */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Type className="w-6 h-6 text-aurora-primary" />
            <h2 className="text-heading-1">Tipografia</h2>
          </div>

          <Card className="surface-elevated">
            <CardHeader>
              <CardTitle>Escala Tipográfica</CardTitle>
              <CardDescription>
                Hierarquia de texto usando Inter e Outfit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-caption text-text-muted">text-display</p>
                <p className="text-display">Grande Título Display</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-caption text-text-muted">text-heading-1</p>
                <h1 className="text-heading-1">Heading Level 1</h1>
              </div>
              
              <div className="space-y-2">
                <p className="text-caption text-text-muted">text-heading-2</p>
                <h2 className="text-heading-2">Heading Level 2</h2>
              </div>
              
              <div className="space-y-2">
                <p className="text-caption text-text-muted">text-heading-3</p>
                <h3 className="text-heading-3">Heading Level 3</h3>
              </div>
              
              <div className="space-y-2">
                <p className="text-caption text-text-muted">text-body-large</p>
                <p className="text-body-large">Texto corpo grande</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-caption text-text-muted">text-body</p>
                <p className="text-body">Texto corpo padrão</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-caption text-text-muted">text-body-small</p>
                <p className="text-body-small">Texto corpo pequeno</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-caption text-text-muted">text-caption</p>
                <p className="text-caption">Legenda ou caption</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Componentes de Gráfico */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-aurora-primary" />
            <h2 className="text-heading-1">Componentes de Gráficos</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="surface-elevated">
              <CardHeader>
                <CardTitle>Bar Chart</CardTitle>
                <CardDescription>
                  Gráfico de barras com paleta categórica
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <BarChart
                  data={barData}
                  index="name"
                  categories={['value']}
                />
              </CardContent>
            </Card>

            <Card className="surface-elevated">
              <CardHeader>
                <CardTitle>Area Chart</CardTitle>
                <CardDescription>
                  Gráfico de área com gradiente
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <AreaChart
                  data={barData}
                  index="name"
                  categories={['value']}
                />
              </CardContent>
            </Card>

            <Card className="surface-elevated">
              <CardHeader>
                <CardTitle>Pie Chart</CardTitle>
                <CardDescription>
                  Gráfico de pizza com cores categóricas
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <PieChart
                  data={pieData}
                  index="name"
                  category="value"
                />
              </CardContent>
            </Card>

            <Card className="surface-elevated">
              <CardHeader>
                <CardTitle>Paleta de Cores</CardTitle>
                <CardDescription>
                  8 cores categóricas para visualizações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {chartColors.categorical.map((color, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-lg border border-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="text-caption text-text-muted mt-4">
                  Todas as cores são referenciadas via CSS variables para máxima consistência
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Botões */}
        <section className="space-y-6">
          <h2 className="text-heading-1">Componentes Interativos</h2>

          <Card className="surface-elevated">
            <CardHeader>
              <CardTitle>Botões</CardTitle>
              <CardDescription>
                Variantes de botões usando design system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="aurora-primary">Aurora Primary</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Animações */}
        <section className="space-y-6">
          <h2 className="text-heading-1">Animações Aurora</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="surface-elevated aurora-pulse">
              <CardHeader>
                <CardTitle>Aurora Pulse</CardTitle>
                <CardDescription>
                  Pulsação suave e elegante
                </CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  .aurora-pulse
                </code>
              </CardContent>
            </Card>

            <Card className="surface-elevated aurora-glow">
              <CardHeader>
                <CardTitle>Aurora Glow</CardTitle>
                <CardDescription>
                  Brilho animado em loop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  .aurora-glow
                </code>
              </CardContent>
            </Card>

            <Card className="surface-elevated aurora-float">
              <CardHeader>
                <CardTitle>Aurora Float</CardTitle>
                <CardDescription>
                  Flutuação suave contínua
                </CardDescription>
              </CardHeader>
              <CardContent>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  .aurora-float
                </code>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8 border-t border-border">
          <p className="text-body-small text-text-muted">
            📚 Para mais informações, consulte{' '}
            <code className="bg-muted px-2 py-1 rounded text-xs">
              docs/design-system.md
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para mostrar swatches de cor
function ColorSwatch({
  name,
  cssVar,
  className,
  hex
}: {
  name: string;
  cssVar: string;
  className: string;
  hex: string;
}) {
  return (
    <div className="space-y-2">
      <div className={`h-24 rounded-lg border border-border ${className}`} />
      <div>
        <p className="text-label">{name}</p>
        <code className="text-xs text-text-muted">{cssVar}</code>
        <p className="text-caption text-text-muted">{hex}</p>
      </div>
    </div>
  );
}
