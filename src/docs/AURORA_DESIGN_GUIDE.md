# 🎨 Aurora Design System - Guia de Uso

## Paleta de Cores

### Cores Principais

#### Aurora Primary (`aurora-primary`)
**Cor:** #0ABAB5 (Turquesa)  
**HSL:** 178 90% 38%  
**Uso:** Botões primários, CTAs, highlights, elementos interativos principais  
**Classes:** `bg-aurora-primary`, `text-aurora-primary`, `border-aurora-primary`

```tsx
// Botão primário
<AuroraButton>Ação Principal</AuroraButton>

// Texto destacado
<span className="text-aurora-primary">Importante</span>

// Card com borda
<Card className="border-l-4 border-l-aurora-primary">...</Card>
```

#### Viver Blue (`viverblue`)
**Cor:** #00FFFF (Ciano vibrante)  
**HSL:** 180 100% 50%  
**Uso:** Gradientes, efeitos de glow, ícones, elementos decorativos  
**Classes:** `bg-viverblue`, `text-viverblue`, `from-aurora`

```tsx
// Gradiente Aurora
<div className="bg-gradient-to-r from-aurora to-aurora-light">...</div>
```

#### Viver Cyan (`vivercyan`)
**Cor:** #0BC8D5 (Turquesa claro)  
**HSL:** 184 90% 44%  
**Uso:** Categoria Receita/Operacional, cards secundários  
**Classes:** `bg-revenue`, `bg-operational`, `text-vivercyan`

```tsx
// Card de categoria
<Card className="border-l-4 border-l-revenue bg-revenue/10">
  Conteúdo de Receita
</Card>
```

#### Viver Petrol (`viverpetrol`)
**Cor:** #076770 (Azul petróleo)  
**HSL:** 185 88% 23%  
**Uso:** Categoria Estratégia, fundos escuros, contraste  
**Classes:** `bg-strategy`, `text-viverpetrol`

```tsx
// Card de estratégia
<Card className="border-l-4 border-l-strategy bg-strategy/10">
  Conteúdo Estratégico
</Card>
```

---

## Componentes

### Botões

#### Primário (Aurora Primary)
Para ações principais e CTAs:

```tsx
import { AuroraButton } from "@/components/ui/aurora-button";

<AuroraButton>Salvar</AuroraButton>
<AuroraButton glow>Criar Novo</AuroraButton>
<AuroraButton disabled>Processando...</AuroraButton>
```

#### Secundário (Outline)
Para ações secundárias:

```tsx
<Button variant="outline" className="border-aurora-primary text-aurora-primary hover:bg-aurora-primary/10">
  Cancelar
</Button>
```

#### Ghost
Para ações sutis:

```tsx
<Button variant="ghost">Ver Mais</Button>
```

#### Destrutivo
Para ações de remoção/exclusão:

```tsx
<Button variant="destructive">Deletar</Button>
```

### Cards

#### Card com Categoria
```tsx
<Card className="border-l-4 border-l-aurora-primary bg-aurora-primary/10">
  <CardHeader>
    <CardTitle className="text-aurora-primary">Título</CardTitle>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
</Card>
```

#### Card Elevado
```tsx
<Card className="surface-elevated hover:surface-overlay transition-all">
  Conteúdo
</Card>
```

### Badges

#### Badge de Status
```tsx
<Badge className="bg-aurora-primary/20 text-aurora-primary border-aurora-primary/50">
  Ativo
</Badge>
```

#### Badge de Categoria
```tsx
<Badge className="bg-revenue/20 text-revenue">Receita</Badge>
<Badge className="bg-operational/20 text-operational">Operacional</Badge>
<Badge className="bg-strategy/20 text-strategy">Estratégia</Badge>
```

### Inputs

#### Input com Aurora Focus
```tsx
<Input 
  placeholder="Digite aqui..." 
  className="aurora-focus"
/>
```

#### Textarea
```tsx
<Textarea 
  placeholder="Descrição..." 
  className="aurora-focus"
/>
```

### Progress Indicators

#### Progress Bar
```tsx
<Progress 
  value={75} 
  className="bg-neutral-800 [&>div]:bg-aurora-primary"
/>
```

#### Spinner
```tsx
<div className="animate-spin h-8 w-8 border-4 border-aurora-primary border-t-transparent rounded-full" />
```

---

## Estados Interativos

### Hover
```tsx
// Escurecer
className="hover:bg-aurora-primary-dark"

// Glow
className="hover:shadow-aurora"

// Scale
className="hover:scale-105 transition-transform"

// Combinado
className="hover:bg-aurora-primary-dark hover:shadow-lg hover:-translate-y-0.5 transition-all"
```

### Active/Checked
```tsx
// Checkbox/Radio
className="data-[state=checked]:bg-aurora-primary"

// Tab ativa
className={isActive ? "bg-aurora-primary text-white" : "text-muted-foreground"}
```

### Focus
```tsx
// Aurora Focus Ring
className="aurora-focus"

// Ou manualmente
className="focus-visible:ring-2 focus-visible:ring-aurora-primary focus-visible:ring-offset-2"
```

### Disabled
```tsx
<Button disabled className="opacity-50 cursor-not-allowed">
  Desabilitado
</Button>
```

---

## Tipografia

### Hierarquia de Texto
```tsx
// Display (títulos principais)
<h1 className="text-display">Título Principal</h1>

// Headings
<h2 className="text-heading-1">Título H1</h2>
<h3 className="text-heading-2">Título H2</h3>
<h4 className="text-heading-3">Título H3</h4>

// Body
<p className="text-body">Texto normal</p>
<p className="text-body-small">Texto pequeno</p>

// Caption
<span className="text-caption">Legenda</span>

// Label
<label className="text-label">Rótulo de campo</label>
```

### Cores de Texto
```tsx
<p className="text-primary">Texto primário</p>
<p className="text-secondary">Texto secundário</p>
<p className="text-muted">Texto esmaecido</p>
<p className="text-aurora-primary">Texto destacado</p>
```

---

## Layout e Surfaces

### Sistema de Elevação
```tsx
// Base (fundo principal)
<div className="surface-base">...</div>

// Elevado (cards, panels)
<div className="surface-elevated">...</div>

// Overlay (dropdowns, popovers)
<div className="surface-overlay">...</div>

// Modal (dialogs, modals)
<div className="surface-modal">...</div>
```

### Sombras Aurora
```tsx
// Sombra básica
<Card className="shadow-aurora">...</Card>

// Sombra forte
<Card className="shadow-aurora-strong">...</Card>

// Sombra com hover
<Card className="shadow-md hover:shadow-aurora transition-shadow">...</Card>
```

---

## Animações

### Transições
```tsx
// Transição base
className="transition-all duration-200"

// Transição suave
className="transition-colors duration-300"

// Bounce
className="transition-bounce"
```

### Animações Prontas
```tsx
// Fade in
className="animate-fade-in"

// Scale in
className="animate-scale-in"

// Float
className="animate-float"

// Aurora glow
className="animate-aurora-glow"

// Blob (fundo animado)
className="animate-blob"
```

---

## Gráficos (Recharts)

### Cores de Gráficos
```tsx
// Único
colors={['hsl(var(--aurora-primary))']}

// Múltiplos (use variáveis do sistema)
colors={[
  'hsl(var(--aurora-primary))',
  'hsl(var(--revenue))',
  'hsl(var(--operational))',
  'hsl(var(--strategy))'
]}
```

### Exemplo Completo
```tsx
<BarChart data={data}>
  <Bar 
    dataKey="value" 
    fill="hsl(var(--aurora-primary))"
    radius={[8, 8, 0, 0]}
  />
</BarChart>
```

---

## Regras de Uso

### ✅ Faça

- Use `AuroraButton` para ações primárias
- Use variáveis CSS do design system (`aurora-primary`, `revenue`, etc.)
- Mantenha consistência visual em toda a plataforma
- Use o sistema de elevação para hierarquia visual
- Aplique `aurora-focus` em inputs e elementos interativos

### ❌ Não Faça

- ❌ Não use cores hardcoded (`#0ABAB5`, `#00FFFF`, etc.)
- ❌ Não crie variantes de botão customizadas
- ❌ Não use `bg-white` ou `text-black` diretamente
- ❌ Não ignore o sistema de sombras Aurora
- ❌ Não misture estilos de diferentes design systems

---

## Exemplos de Páginas

### Dashboard Card
```tsx
<Card className="surface-elevated hover:surface-overlay transition-all">
  <CardHeader>
    <CardTitle className="text-heading-3 flex items-center gap-2">
      <TrendingUp className="h-5 w-5 text-aurora-primary" />
      Estatísticas
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-body-small text-muted">Última atualização há 5 min</p>
    <div className="mt-4 space-y-2">
      <Progress value={75} className="bg-neutral-800 [&>div]:bg-aurora-primary" />
    </div>
  </CardContent>
  <CardFooter>
    <AuroraButton className="w-full">Ver Detalhes</AuroraButton>
  </CardFooter>
</Card>
```

### Form Section
```tsx
<div className="content-section">
  <div className="content-section-header">
    <h3 className="text-heading-2">Informações Básicas</h3>
  </div>
  
  <div className="space-y-4">
    <FormField>
      <FormLabel className="text-label">Nome</FormLabel>
      <Input placeholder="Digite o nome..." className="aurora-focus" />
    </FormField>
    
    <FormField>
      <FormLabel className="text-label">Descrição</FormLabel>
      <Textarea placeholder="Descreva..." className="aurora-focus" />
    </FormField>
    
    <div className="flex gap-3 justify-end">
      <Button variant="outline">Cancelar</Button>
      <AuroraButton>Salvar</AuroraButton>
    </div>
  </div>
</div>
```

---

## Migração de Código Legado

Se encontrar cores hardcoded, use esta tabela de conversão:

| Hardcoded | Substituir por |
|-----------|----------------|
| `#0ABAB5` | `aurora-primary` |
| `bg-[#0ABAB5]` | `bg-aurora-primary` |
| `text-[#0ABAB5]` | `text-aurora-primary` |
| `border-[#0ABAB5]` | `border-aurora-primary` |
| `bg-[#0ABAB5]/10` | `bg-aurora-primary/10` |
| `hover:bg-[#0ABAB5]/90` | `hover:bg-aurora-primary-dark` |

---

## Contato e Suporte

Para dúvidas ou sugestões sobre o Aurora Design System, entre em contato com a equipe de desenvolvimento.

**Última atualização:** 2025-10-16
