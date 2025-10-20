# Floating Glass Card - Conceito 3

## 📐 Design System Integration

### Visão Geral
O **Floating Glass Card** é um componente de card premium que segue os princípios do Aurora Design System, utilizando glassmorfismo avançado, efeitos tecnológicos e animações sutis para criar uma experiência visual moderna e elegante.

## 🎨 Características Visuais

### 1. **Cover Image com Parallax**
- Background completo com a thumbnail da solução
- Efeito parallax no hover (zoom suave)
- Gradient overlay para garantir legibilidade
- Placeholder elegante quando não há imagem

### 2. **Glassmorphism Premium**
- Card flutuante com backdrop-filter blur(16px)
- Background semi-transparente (92%-85% opacity)
- Saturação aumentada (1.4x) para cores vibrantes
- Bordas com aurora-primary

### 3. **Efeitos Tecnológicos**

#### Scan Line
```css
animation: scan 3s linear infinite;
```
- Linha horizontal que percorre o card verticalmente
- Cor: aurora-primary com 60% opacity
- Simula efeito de scanner tecnológico

#### LED Corner Accents
- 4 cantos com bordas iluminadas
- Animação de glow no hover
- Cor: aurora-primary

#### Floating Particles
- 3 partículas animadas que flutuam verticalmente
- Delays variados para movimento orgânico
- Cor: aurora-primary com 60% opacity

### 4. **Hover Effects**
- **Card**: translateY(-8px) + shadow premium
- **Image**: scale(1.08) com parallax
- **Content**: translateY(-4px) + border glow
- **LED Corners**: intensificação do glow
- **Progress Bar**: expansão horizontal suave

## 🎯 Tokens do Design System Utilizados

### Cores Semânticas
```css
/* Background & Surface */
--card: base do card glassmórfico
--background: gradiente overlay
--foreground: texto principal

/* Aurora Primary */
--aurora-primary: cor principal (LED, particles, borders)
--aurora-primary-light: variação clara
--aurora-primary-dark: variação escura

/* Categorias */
--revenue: cor para categoria Receita
--operational: cor para categoria Operacional
--strategy: cor para categoria Estratégia
```

### Spacing System (8px base)
```css
padding: 1.25rem (20px) /* md */
gap: 0.5rem (8px) /* sm */
margin-bottom: 0.75rem (12px)
border-radius: 1rem (16px)
```

### Typography Scale
```css
/* Badge */ 
font-size: 0.75rem (12px) /* xs */

/* Título */
font-size: 1rem (16px) /* base */
font-weight: 600 /* semibold */

/* Descrição */
font-size: 0.875rem (14px) /* sm */
line-height: relaxed
```

### Transitions
```css
/* Card & Content */
transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

/* Image */
transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);

/* LED Corners */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

## 📦 Estrutura de Componentes

```
FloatingGlassCard
├── floating-glass-background (z-index: 1)
│   ├── floating-glass-image (parallax)
│   ├── floating-glass-overlay (gradient)
│   └── scan-line (animação)
│
├── floating-particles (z-index: 5)
│   ├── particle 1 (20%, delay 0s)
│   ├── particle 2 (60%, delay -2s)
│   └── particle 3 (80%, delay -4s)
│
└── floating-glass-content (z-index: 10)
    ├── led-corners (4 cantos)
    ├── Badge (categoria + ícone)
    ├── Título (h3)
    ├── Descrição (p)
    └── hover-indicator (progress bar)
```

## 🔧 Props Interface

```typescript
interface FloatingGlassCardProps {
  solution: Solution;  // Objeto com dados da solução
  onClick: () => void; // Callback de clique
}

// Solution interface
interface Solution {
  id: string;
  title: string;
  description: string;
  category: 'Receita' | 'Operacional' | 'Estratégia';
  thumbnail_url?: string;
  // ... outros campos
}
```

## 🎭 Estados do Componente

### Default State
- Card em posição normal
- Borders com 20% opacity
- LED corners sutis
- Particles em movimento

### Hover State
- Card eleva 8px
- Image zoom 1.08x
- Content eleva mais 4px
- Borders com 50% opacity
- LED corners com glow
- Progress bar expande

### Focus State
- Acessibilidade via teclado
- Outline aurora-primary
- Ring offset para separação visual

## 📱 Responsividade

### Desktop (>768px)
- Altura: 340px
- Padding: 1.25rem
- Bottom spacing: 16px

### Mobile (≤768px)
- Altura: 300px
- Padding: 1rem
- Bottom spacing: 12px

## ♿ Acessibilidade

- ✅ Keyboard navigation (Enter/Space)
- ✅ Role="button" para semântica
- ✅ TabIndex para foco
- ✅ Alt text em imagens
- ✅ Color contrast ratio adequado
- ✅ Focus visible states

## 🚀 Performance

### Otimizações
- `transform: translateZ(0)` para GPU acceleration
- `memo` no componente para evitar re-renders
- CSS animations nativas (não JS)
- Lazy loading de imagens
- will-change apenas em animações críticas

### Métricas Esperadas
- First Paint: <100ms
- Animation 60fps
- No layout shift
- Smooth transitions

## 🎨 Variações por Categoria

### Receita
```css
color: hsl(var(--revenue))
border: hsl(var(--revenue) / 0.3)
background: hsl(var(--revenue) / 0.1)
icon: TrendingUp
```

### Operacional
```css
color: hsl(var(--operational))
border: hsl(var(--operational) / 0.3)
background: hsl(var(--operational) / 0.1)
icon: Settings
```

### Estratégia
```css
color: hsl(var(--strategy))
border: hsl(var(--strategy) / 0.3)
background: hsl(var(--strategy) / 0.1)
icon: BarChart
```

## 📄 Uso no Código

```tsx
import { FloatingGlassCard } from '@/components/solution/FloatingGlassCard';

// No Dashboard
<FloatingGlassCard 
  solution={solution} 
  onClick={() => navigate(`/solutions/${solution.id}`)}
/>

// Com SolutionCard wrapper (mantém compatibilidade)
<SolutionCard 
  solution={solution} 
  onClick={handleClick}
/>
```

## 🔄 Compatibilidade

O componente é **100% compatível** com o código existente através do wrapper `SolutionCard`, mantendo a mesma interface de props e comportamento.

## 📊 Checklist de Design System

- ✅ Usa tokens semânticos (cores, spacing, typography)
- ✅ Segue padrões de animação (cubic-bezier)
- ✅ Implementa estados (default, hover, focus)
- ✅ Responsivo (mobile + desktop)
- ✅ Acessível (WCAG 2.1 Level AA)
- ✅ Performance otimizada (GPU, memoization)
- ✅ Documentado
- ✅ Reutilizável
- ✅ Manutenível

## 🎯 Próximos Passos

1. ✅ Implementar conceito base
2. ⏳ Testes de usabilidade
3. ⏳ A/B testing com conceito anterior
4. ⏳ Adicionar ao Storybook (se aplicável)
5. ⏳ Expandir para outras áreas (se aprovado)

---

**Versão**: 1.0.0  
**Última atualização**: 2025-10-20  
**Autor**: Aurora Design System Team
