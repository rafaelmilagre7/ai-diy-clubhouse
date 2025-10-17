# 🎨 Design System - Viver de IA

Documentação completa do Design System da plataforma Viver de IA, baseado em CSS Variables e tokens semânticos para máxima consistência e manutenibilidade.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Paleta de Cores](#paleta-de-cores)
- [Tipografia](#tipografia)
- [Componentes de Gráficos](#componentes-de-gráficos)
- [Sombras e Elevações](#sombras-e-elevações)
- [Animações](#animações)
- [Boas Práticas](#boas-práticas)

---

## 🎯 Visão Geral

O Design System da plataforma utiliza **CSS Variables (Custom Properties)** para definir todos os tokens de design. Isso garante:

- ✅ **Consistência** total em toda a aplicação
- ✅ **Manutenibilidade** - uma mudança se propaga automaticamente
- ✅ **Temas** dark/light mode nativos
- ✅ **Performance** - zero hardcoded colors, tudo via CSS
- ✅ **Acessibilidade** - contraste controlado centralmente

---

## 🎨 Paleta de Cores

### Cores Principais da Marca

Nossa cor principal é o **Aurora Teal (#0ABAB5)**, representando inovação e tecnologia.

```css
/* Cor principal da marca */
--aurora-primary: 178 90% 38%;       /* #0ABAB5 */
--aurora-primary-light: 178 90% 50%; /* Variante clara */
--aurora-primary-dark: 178 90% 28%;  /* Variante escura */
```

**Uso em código:**

```tsx
// ❌ NUNCA fazer isso
<div className="bg-[#0ABAB5]">

// ✅ SEMPRE usar tokens semânticos
<div className="bg-aurora-primary">
<div style={{ backgroundColor: 'hsl(var(--aurora-primary))' }}>
```

### Cores de Sistema

```css
/* Cores de feedback */
--success: 142 76% 36%;      /* Verde */
--warning: 43 96% 56%;       /* Amarelo */
--destructive: 0 62.8% 30.6%; /* Vermelho */
--info: 221 83% 53%;         /* Azul */
```

### Superfícies e Elevação

Sistema de elevação progressiva para criar hierarquia visual:

```css
--surface-base: 216 28% 7%;      /* Fundo base */
--surface-elevated: 217 32% 10%; /* Cards */
--surface-overlay: 217 32% 13%;  /* Popovers */
--surface-modal: 217 32% 16%;    /* Modais */
```

**Uso:**

```tsx
// Cards simples
<Card className="bg-surface-elevated">

// Modais com elevação máxima
<Dialog className="bg-surface-modal">
```

### Hierarquia de Texto

```css
--text-primary: 0 0% 98%;    /* Títulos e texto principal */
--text-secondary: 0 0% 85%;  /* Subtítulos */
--text-muted: 0 0% 70%;      /* Texto secundário */
--text-disabled: 0 0% 50%;   /* Estados desabilitados */
```

**Classes utilitárias:**

```tsx
<h1 className="text-text-primary">Título Principal</h1>
<p className="text-text-secondary">Subtítulo</p>
<span className="text-text-muted">Informação auxiliar</span>
```

---

## 📝 Tipografia

### Famílias de Fonte

- **Inter** - Corpo de texto (body text)
- **Outfit** - Títulos e headings

### Escala Tipográfica

```tsx
// Display - Hero sections
<h1 className="text-display">Grande Título</h1>

// Headings
<h1 className="text-heading-1">Heading 1</h1>
<h2 className="text-heading-2">Heading 2</h2>
<h3 className="text-heading-3">Heading 3</h3>

// Body text
<p className="text-body-large">Texto grande</p>
<p className="text-body">Texto padrão</p>
<p className="text-body-small">Texto pequeno</p>

// Auxiliares
<label className="text-label">Label</label>
<span className="text-caption">Caption/Legenda</span>
```

---

## 📊 Componentes de Gráficos

### Paleta para Charts

Todos os gráficos utilizam `chartColors` de `src/lib/chart-utils.ts`:

```typescript
import { chartColors } from '@/lib/chart-utils';

// Paleta categórica (8 cores)
chartColors.categorical = [
  'hsl(var(--aurora-primary))',  // Teal
  'hsl(262 83% 58%)',            // Purple
  'hsl(142 76% 36%)',            // Green
  'hsl(48 96% 53%)',             // Amber
  'hsl(var(--destructive))',     // Red
  'hsl(221 83% 53%)',            // Blue
  'hsl(330 81% 60%)',            // Pink
  'hsl(25 95% 53%)',             // Orange
];
```

### Uso em Componentes de Chart

**❌ ERRADO - Cores hardcoded:**

```tsx
<BarChart 
  data={data}
  colors={['#0ABAB5', '#3B82F6', '#10B981']} // Nunca!
/>
```

**✅ CORRETO - Usar tokens:**

```tsx
import { chartColors } from '@/lib/chart-utils';

// Opção 1: Usar default (recomendado)
<BarChart data={data} />

// Opção 2: Personalizar com paleta do design system
<BarChart 
  data={data}
  colors={chartColors.categorical}
/>

// Opção 3: Paleta específica
<AreaChart
  data={data}
  colors={[
    'hsl(var(--aurora-primary))',
    'hsl(var(--aurora-primary-light))',
    'hsl(var(--aurora-primary-dark))'
  ]}
/>
```

### Gradientes para Área Charts

```typescript
chartColors.gradients = {
  primary: ['hsl(var(--aurora-primary))', 'hsl(var(--aurora-primary) / 0.3)'],
  success: ['hsl(142 76% 36%)', 'hsl(142 76% 36% / 0.3)'],
  warning: ['hsl(48 96% 53%)', 'hsl(48 96% 53% / 0.3)'],
};
```

---

## 🌟 Sombras e Elevações

### Sistema de Sombras Aurora

```css
--shadow-sm: 0 2px 4px hsl(216 28% 4% / 0.1);
--shadow-md: 0 4px 12px hsl(216 28% 4% / 0.15);
--shadow-lg: 0 8px 24px hsl(216 28% 4% / 0.2);
--shadow-xl: 0 12px 32px hsl(216 28% 4% / 0.25);
--shadow-aurora: 0 0 20px hsl(var(--primary) / 0.1);
--shadow-aurora-strong: 0 0 30px hsl(var(--primary) / 0.2);
```

**Uso em Tailwind:**

```tsx
<Card className="shadow-md">Card padrão</Card>
<Card className="shadow-aurora">Card com glow</Card>
<Button className="shadow-aurora-strong">Botão destaque</Button>
```

---

## 🎬 Animações

### Transições Padrão

```css
--transition-base: all 0.2s ease-out;
--transition-slow: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
--transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Animações Disponíveis

```tsx
// Entrada e saída
<div className="animate-fade-in">Fade in</div>
<div className="animate-scale-in">Scale in</div>

// Movimento
<div className="animate-float">Flutuação</div>
<div className="animate-blob">Movimento orgânico</div>

// Efeitos Aurora
<div className="aurora-pulse">Pulsação suave</div>
<div className="aurora-glow">Brilho animado</div>
<div className="aurora-shimmer">Shimmer effect</div>
```

---

## ✅ Boas Práticas

### DO ✅

1. **Sempre use variáveis CSS:**
   ```tsx
   className="bg-aurora-primary text-text-primary"
   ```

2. **Use tokens semânticos para gráficos:**
   ```tsx
   import { chartColors } from '@/lib/chart-utils';
   <BarChart colors={chartColors.categorical} />
   ```

3. **Aproveite classes utilitárias:**
   ```tsx
   className="surface-elevated interactive-hover"
   ```

4. **Mantenha consistência:**
   ```tsx
   // Se um componente usa aurora-primary, outros similares também devem usar
   ```

### DON'T ❌

1. **Nunca hardcode cores:**
   ```tsx
   // ❌ ERRADO
   style={{ color: '#0ABAB5' }}
   className="bg-[#0ABAB5]"
   ```

2. **Não crie variantes inline:**
   ```tsx
   // ❌ ERRADO
   style={{ backgroundColor: 'rgba(10, 186, 181, 0.5)' }}
   
   // ✅ CORRETO
   className="bg-aurora-primary/50"
   ```

3. **Não ignore a hierarquia de texto:**
   ```tsx
   // ❌ ERRADO
   <h1 className="text-gray-400">
   
   // ✅ CORRETO
   <h1 className="text-heading-1">
   ```

4. **Não misture abordagens:**
   ```tsx
   // ❌ ERRADO - inconsistente
   <Button style={{ backgroundColor: '#0ABAB5' }}>Salvar</Button>
   <Button className="bg-aurora-primary">Cancelar</Button>
   
   // ✅ CORRETO - consistente
   <Button className="bg-aurora-primary">Salvar</Button>
   <Button variant="outline">Cancelar</Button>
   ```

---

## 🔍 Extraindo Cores CSS em Runtime

Para casos onde bibliotecas externas precisam de valores hexadecimais:

```typescript
import { getCSSVariableColor, getDesignSystemColors } from '@/lib/chart-utils';

// Obter cor específica
const primaryColor = getCSSVariableColor('--aurora-primary');
// Resultado: "hsl(178 90% 38%)"

// Obter todas as cores do sistema
const colors = getDesignSystemColors();
// Resultado: { primary: "hsl(178 90% 38%)", success: "hsl(142 76% 36%)", ... }
```

**Exemplo prático (confetti):**

```typescript
const getConfettiColors = () => {
  const style = getComputedStyle(document.documentElement);
  const primary = style.getPropertyValue('--aurora-primary').trim();
  const destructive = style.getPropertyValue('--destructive').trim();
  
  return [
    primary ? `hsl(${primary})` : '#0ABAB5',
    destructive ? `hsl(${destructive})` : '#E11D48',
    // ... outras cores
  ];
};

confetti({ colors: getConfettiColors() });
```

---

## 📦 Arquivos Principais

- `src/styles/base.css` - Variáveis CSS e tokens base
- `src/styles/aurora-effects.css` - Animações e efeitos Aurora
- `tailwind.config.ts` - Mapeamento Tailwind → CSS Variables
- `src/lib/chart-utils.ts` - Paletas de cores para gráficos
- `src/components/admin/analytics/charts/chartTheme.ts` - Configurações de charts

---

## 🚀 Próximos Passos

Para manter o Design System saudável:

1. ✅ Revisar PRs para detectar cores hardcoded
2. ✅ Adicionar novos tokens em `base.css` quando necessário
3. ✅ Documentar novos componentes e padrões neste arquivo
4. ✅ Criar página `/style-guide` para referência visual rápida
5. ✅ Considerar ESLint rules para bloquear hexadecimais hardcoded

---

**Última atualização:** 2025-10-17
**Versão:** 1.0.0
**Mantido por:** Equipe Viver de IA
