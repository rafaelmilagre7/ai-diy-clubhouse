# Design System - Viver de IA

## 📊 Status de Normalização

**Normalização Concluída: 90%**

### Estatísticas
- ✅ **Valores Arbitrários**: 16 eliminados, 31 mantidos (justificados)
- ✅ **Transições**: 451 normalizadas (100%)
- ⚠️ **Cores Genéricas**: 390+ ocorrências identificadas para normalização futura
- ✅ **Utilities CSS**: 250+ utilities criadas

---

## 🎨 Sistema de Cores

### Cores Principais da Marca

#### Aurora Primary (Cor Principal)
```css
--aurora-primary: 178 93% 37%      /* #0ABAB5 - Ciano característico */
--aurora-primary-light: 178 93% 47%
--aurora-primary-dark: 178 93% 27%
```

**Uso**: Ações primárias, destaque de elementos importantes, CTAs principais

**Classes disponíveis**:
- `text-aurora-primary` / `bg-aurora-primary` / `border-aurora-primary`
- Opacidades: `/5`, `/10`, `/20`, `/30`, `/50`

#### Aurora Secondary & Accent
```css
--aurora-secondary: [definir]
--aurora-accent: [definir]
```

**Classes disponíveis**:
- `text-aurora-secondary` / `bg-aurora-secondary` / `border-aurora-secondary`
- `text-aurora-accent` / `bg-aurora-accent` / `border-aurora-accent`

---

### Sistema de Status (Semântico)

#### Success (Sucesso)
```css
--status-success: 142 71% 45%
--status-success-light: 142 71% 55%
--status-success-lighter: 142 71% 95%
--status-success-dark: 142 71% 35%
```

**Uso**: Operações bem-sucedidas, confirmações, estado ativo

**Classes**: `text-status-success`, `bg-status-success`, `border-status-success`

#### Error (Erro)
```css
--status-error: 0 84% 60%
--status-error-light: 0 84% 70%
--status-error-lighter: 0 84% 95%
--status-error-dark: 0 84% 50%
```

**Uso**: Erros, avisos críticos, ações destrutivas

**Classes**: `text-status-error`, `bg-status-error`, `border-status-error`

#### Warning (Aviso)
```css
--status-warning: 38 92% 50%
--status-warning-light: 38 92% 60%
--status-warning-lighter: 38 92% 95%
--status-warning-dark: 38 92% 40%
```

**Uso**: Avisos, atenção necessária, pendências

**Classes**: `text-status-warning`, `bg-status-warning`, `border-status-warning`

#### Info (Informação)
```css
--status-info: 199 89% 48%
--status-info-light: 199 89% 58%
--status-info-lighter: 199 89% 95%
--status-info-dark: 199 89% 38%
```

**Uso**: Informações, dicas, notificações neutras

**Classes**: `text-status-info`, `bg-status-info`, `border-status-info`

#### Neutral (Neutro)
```css
--status-neutral: 240 6% 50%
--status-neutral-light: 240 6% 60%
--status-neutral-lighter: 240 6% 95%
--status-neutral-dark: 240 6% 40%
```

**Uso**: Estado inativo, desabilitado, neutro

**Classes**: `text-status-neutral`, `bg-status-neutral`, `border-status-neutral`

---

### Cores por Trilha

#### Revenue (Receita)
```css
--revenue: 38 92% 50%          /* Âmbar/Ouro */
--revenue-light: 38 92% 60%
--revenue-lighter: 38 92% 90%
--revenue-dark: 38 92% 40%
```

**Uso**: Trilha de Revenue, métricas financeiras

**Classes**: `text-revenue`, `bg-revenue`, `border-revenue`

#### Operational (Operacional)
```css
--operational: 142 71% 45%     /* Verde */
--operational-light: 142 71% 55%
--operational-lighter: 142 71% 90%
--operational-dark: 142 71% 35%
```

**Uso**: Trilha Operacional, eficiência, processos

**Classes**: `text-operational`, `bg-operational`, `border-operational`

#### Strategy (Estratégia)
```css
--strategy: 262 52% 47%        /* Roxo */
--strategy-light: 262 52% 57%
--strategy-lighter: 262 52% 90%
--strategy-dark: 262 52% 37%
```

**Uso**: Trilha de Estratégia, planejamento

**Classes**: `text-strategy`, `bg-strategy`, `border-strategy`

---

### Sistema de Prioridade

```css
--priority-low: 199 89% 48%        /* Azul claro */
--priority-normal: 38 92% 50%      /* Amarelo/Âmbar */
--priority-high: 25 95% 53%        /* Laranja */
--priority-urgent: 0 84% 60%       /* Vermelho */
```

**Classes**: `text-priority-{low|normal|high|urgent}`, `bg-priority-*`, `border-priority-*`

**Uso**: Níveis de prioridade em tarefas, alertas, notificações

---

### Sistema de Dificuldade

```css
--difficulty-beginner: 142 71% 45%     /* Verde */
--difficulty-intermediate: 38 92% 50%  /* Âmbar */
--difficulty-advanced: 25 95% 53%      /* Laranja */
--difficulty-expert: 262 52% 47%       /* Roxo */
```

**Classes**: `text-difficulty-{beginner|intermediate|advanced|expert}`, `bg-difficulty-*`, `border-difficulty-*`

**Uso**: Níveis de dificuldade em conteúdos, cursos, lições

---

### Sistema de Performance

```css
--performance-excellent: 142 71% 45%   /* Verde */
--performance-good: 199 89% 48%        /* Azul */
--performance-fair: 38 92% 50%         /* Âmbar */
--performance-poor: 0 84% 60%          /* Vermelho */
```

**Classes**: `text-performance-{excellent|good|fair|poor}`, `bg-performance-*`, `border-performance-*`

**Uso**: Métricas de desempenho, velocidade, eficiência

---

### Sistema de Severidade (Segurança)

```css
--severity-critical: 0 84% 60%         /* Vermelho */
--severity-high: 25 95% 53%            /* Laranja */
--severity-medium: 38 92% 50%          /* Âmbar */
--severity-low: 199 89% 48%            /* Azul */
--severity-info: 240 6% 50%            /* Cinza */
```

**Classes**: `text-severity-{critical|high|medium|low|info}`, `bg-severity-*`, `border-severity-*`

**Uso**: Alertas de segurança, vulnerabilidades, logs

---

### Sistema de Permissões

```css
--permission-granted: 142 71% 45%      /* Verde */
--permission-partial: 38 92% 50%       /* Âmbar */
--permission-denied: 0 84% 60%         /* Vermelho */
--permission-restricted: 240 6% 50%    /* Cinza */
```

**Classes**: `text-permission-{granted|partial|denied|restricted}`, `bg-permission-*`, `border-permission-*`

**Uso**: Controle de acesso, permissões de usuário

---

### Sistema de Saúde do Sistema

```css
--system-healthy: 142 71% 45%          /* Verde */
--system-warning: 38 92% 50%           /* Âmbar */
--system-critical: 0 84% 60%           /* Vermelho */
```

**Classes**: `text-system-{healthy|warning|critical}`, `bg-system-*`, `border-system-*`

**Uso**: Status do sistema, monitoramento, health checks

---

## 📏 Espaçamento

### Sistema Base (8px)
```typescript
spacing: {
  'xs': '0.25rem',  // 4px
  'sm': '0.5rem',   // 8px
  'md': '1rem',     // 16px
  'lg': '1.5rem',   // 24px
  'xl': '2rem',     // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
}
```

**Uso**: Margens, paddings, gaps

**Classes disponíveis**:
- `spacing-xs`, `spacing-sm`, `spacing-md`, `spacing-lg` (para gaps)
- Tailwind padrão: `m-md`, `p-lg`, `gap-xl`, etc.

---

## 📝 Tipografia

### Escala de Tamanhos
```typescript
fontSize: {
  '3xs': ['0.5625rem', { lineHeight: '0.7rem' }],    // 9px - eventos mínimos
  '2xs': ['0.625rem', { lineHeight: '0.75rem' }],    // 10px - badges pequenos
  'xs': ['0.75rem', { lineHeight: '1rem' }],         // 12px
  'sm': ['0.875rem', { lineHeight: '1.25rem' }],     // 14px
  'base': ['1rem', { lineHeight: '1.5rem' }],        // 16px
  'lg': ['1.125rem', { lineHeight: '1.75rem' }],     // 18px
  'xl': ['1.25rem', { lineHeight: '1.75rem' }],      // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],         // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],    // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],      // 36px
  'calendar': ['0.9rem', { lineHeight: '1.2rem' }],  // calendário
}
```

**Classes**: `text-3xs`, `text-2xs`, `text-xs`, ..., `text-4xl`, `text-calendar`

### Pesos de Fonte
```typescript
fontWeight: {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
}
```

**Classes**: `font-light`, `font-normal`, `font-medium`, `font-semibold`, `font-bold`, `font-extrabold`

### Utilities Semânticas
```css
.text-display     /* 2xl + bold + line-height 1.2 */
.text-heading     /* xl + semibold */
.text-body        /* base + normal */
.text-caption     /* sm + normal */
```

---

## ⏱️ Transições e Animações

### Durações Normalizadas
```typescript
transitionDuration: {
  fast: '150ms',      // Micro-interações
  base: '200ms',      // Padrão
  slow: '300ms',      // Transições complexas
  slower: '500ms',    // Animações longas
  slowest: '1000ms',  // Animações muito longas
}
```

**Classes**: `duration-fast`, `duration-base`, `duration-slow`, `duration-slower`, `duration-slowest`

### Timing Functions
```typescript
transitionTimingFunction: {
  'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
}
```

**Classes**: `ease-smooth`, `ease-bounce`

### Utilities
```css
.transition-smooth    /* all + base + smooth */
.transition-bounce    /* all + slow + bounce */
```

---

## 📐 Dimensões

### Alturas Semânticas
```typescript
height: {
  'chart-sm': '200px',
  'chart-md': '300px',
  'chart-lg': '400px',
  'chart-xl': '500px',
  'scroll-sm': '220px',
  'scroll-md': '320px',
  'scroll-lg': '420px',
  'scroll-xl': '520px',
  'calendar': '700px',
  'event-row': '100px',
  'viewport-notification': 'calc(100vh - 140px)',
  // ... mais dimensões
}
```

### Larguras Semânticas
```typescript
width: {
  'select-sm': '140px',
  'select-md': '160px',
  'button-min': '120px',
  'table-sm': '200px',
  'table-md': '300px',
  'sidebar-collapsed': '70px',
  'trail-progress': '94%',
  // ... mais dimensões
}
```

### Min/Max Width
```typescript
minWidth: {
  'menu': '8rem',      // 128px - menus contextuais
  'menu-lg': '12rem',  // 192px - menus grandes
  'vote': '3rem',      // 48px - display de votos
}

maxWidth: {
  'chat-bubble': '70%',
  'chat-assistant': '80%',
  'viewport-95': '95vw',
  'progress-bar': '5rem',
  'trail-progress': '94%',
}
```

### Min Height
```typescript
minHeight: {
  'chart-sm': '200px',
  'viewport-onboarding': 'calc(100vh - 120px)',
  // ... mais dimensões
}
```

---

## 🎨 Gradientes

### Gradientes de Marca
```css
.bg-gradient-aurora          /* Aurora principal */
.bg-gradient-aurora-subtle   /* Aurora sutil */
.bg-gradient-primary         /* Primary gradient */
```

### Gradientes de Trilha
```css
.bg-gradient-revenue         /* Revenue gradient */
.bg-gradient-operational     /* Operational gradient */
.bg-gradient-strategy        /* Strategy gradient */
```

### Gradientes de Status
```css
.bg-gradient-success         /* Success gradient */
.bg-gradient-error           /* Error gradient */
.bg-gradient-warning         /* Warning gradient */
```

### Utilities CSS
```css
.gradient-success            /* background: var(--gradient-success) */
.gradient-error              /* background: var(--gradient-error) */
.gradient-warning            /* background: var(--gradient-warning) */
.gradient-info               /* background: var(--gradient-info) */
```

---

## 🧩 Componentes Padronizados

### StatusBadge
```tsx
import { StatusBadge } from '@/components/ui/status-badge';

<StatusBadge 
  status="success" // 'success' | 'error' | 'warning' | 'info' | 'neutral'
  statusVariant="lighter" // 'default' | 'light' | 'lighter'
>
  Conteúdo
</StatusBadge>
```

### PriorityBadge
```tsx
import { PriorityBadge } from '@/components/ui/PriorityBadge';

<PriorityBadge 
  priority="high" // 'high' | 'medium' | 'low'
  showIcon={true}
>
  Conteúdo
</PriorityBadge>
```

### AuroraButton
```tsx
import { AuroraButton } from '@/components/ui/aurora-button';

<AuroraButton glow={true}>
  Ação Principal
</AuroraButton>
```

### SolutionDifficultyBadge
```tsx
import { SolutionDifficultyBadge } from '@/components/admin/solutions/SolutionDifficultyBadge';

<SolutionDifficultyBadge 
  difficulty="advanced" // 'easy' | 'medium' | 'advanced'
/>
```

---

## 📦 Valores Arbitrários Justificados

### Radix UI (Framework - Mantidos)
- `--radix-accordion-content-height`
- `--radix-*` (variáveis dinâmicas do Radix)
- Posicionamentos modais: `left-[50%]`, `top-[50%]`, `translate-x-[-50%]`

### Aspect Ratios de Vídeo (Mantidos)
- `pb-[56.25%]` (16:9 aspect ratio para vídeos)

### Animações Especiais (Mantidos)
- `translate-x-[-100%]`, `translate-y-[300%]` (animações de shimmer)
- Posicionamentos absolutos específicos de design

### Props Dinâmicas (Mantidos)
- `w-[${column.width}]` (larguras dinâmicas via props)
- Valores calculados em runtime

---

## 🚨 Cores Genéricas - Normalização Futura

### Status Atual
- **390+ ocorrências** de cores Tailwind genéricas identificadas
- Principais: `bg-red-*`, `text-green-*`, `bg-blue-*`, `text-amber-*`
- **Localização**: Testes, páginas admin, componentes legados

### Plano de Ação
1. **Fase 1**: Substituir em componentes críticos (UI, common)
2. **Fase 2**: Normalizar páginas admin
3. **Fase 3**: Atualizar testes
4. **Fase 4**: Componentes de certificados (excluídos atualmente)

### Mapeamento de Substituições
```
bg-green-500  → bg-status-success
bg-red-500    → bg-status-error
bg-yellow-500 → bg-status-warning
bg-blue-500   → bg-status-info
bg-gray-500   → bg-status-neutral

text-green-600  → text-status-success
text-red-600    → text-status-error
text-amber-600  → text-status-warning
text-blue-600   → text-status-info
```

---

## 📚 Guia de Uso

### ✅ Boas Práticas

#### Use Tokens Semânticos
```tsx
// ✅ CORRETO
<div className="bg-status-success text-status-success-dark">

// ❌ INCORRETO
<div className="bg-green-500 text-green-700">
```

#### Use Utilities CSS
```tsx
// ✅ CORRETO
<div className="transition-smooth duration-base">

// ❌ INCORRETO
<div className="transition-all duration-200 ease-out">
```

#### Use Componentes Padronizados
```tsx
// ✅ CORRETO
<StatusBadge status="success">Ativo</StatusBadge>

// ❌ INCORRETO
<Badge className="bg-green-50 text-green-600 border-green-200">Ativo</Badge>
```

#### Use Dimensões Semânticas
```tsx
// ✅ CORRETO
<div className="h-chart-md w-table-sm">

// ❌ INCORRETO
<div className="h-[300px] w-[200px]">
```

### ⚠️ Quando Usar Valores Arbitrários

Apenas quando absolutamente necessário:
- Props dinâmicas: `width: ${dynamicValue}`
- Valores do framework (Radix)
- Aspect ratios específicos de mídia
- Animações complexas e únicas

---

## 🔄 Próximas Etapas

### Curto Prazo
- [ ] Normalizar cores genéricas em componentes críticos (UI, common)
- [ ] Criar variants adicionais nos componentes shadcn
- [ ] Adicionar mais utilities para aurora-secondary e aurora-accent

### Médio Prazo
- [ ] Normalizar cores em páginas admin
- [ ] Atualizar testes para usar tokens semânticos
- [ ] Criar Storybook para documentar componentes

### Longo Prazo
- [ ] Migrar componentes de certificados
- [ ] Sistema de temas dinâmicos
- [ ] Dark mode otimizado com tokens

---

## 📖 Referências

- **Arquivo de Tokens**: `tailwind.config.ts`
- **Utilities CSS**: `src/styles/design-tokens.css`
- **Base Styles**: `src/index.css`
- **Tema Hubla**: `src/styles/hubla-theme.css`

---

**Última Atualização**: Fase 9 - Normalização 90% Completa
**Próxima Revisão**: Após normalização de cores genéricas
