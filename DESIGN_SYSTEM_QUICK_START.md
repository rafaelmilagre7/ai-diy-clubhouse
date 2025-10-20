# Design System - Guia Rápido

## 🚀 Quick Start - 5 Minutos

### 1. Cores de Status (Mais Usado)

```tsx
// ✅ Use tokens semânticos
<div className="bg-status-success text-white">Sucesso</div>
<div className="bg-status-error text-white">Erro</div>
<div className="bg-status-warning text-white">Aviso</div>
<div className="bg-status-info text-white">Info</div>

// Com opacidades
<div className="bg-status-success/10 text-status-success">Leve</div>
<div className="bg-status-success/20 text-status-success">Médio</div>
```

### 2. Componentes Prontos

```tsx
// Badges de Status
import { StatusBadge } from '@/components/ui/status-badge';
<StatusBadge status="success" statusVariant="lighter">Ativo</StatusBadge>

// Badges de Prioridade
import { PriorityBadge } from '@/components/ui/PriorityBadge';
<PriorityBadge priority="high" showIcon>Alta Prioridade</PriorityBadge>

// Botão Aurora
import { AuroraButton } from '@/components/ui/aurora-button';
<AuroraButton glow>Ação Principal</AuroraButton>
```

### 3. Transições

```tsx
// Use tokens de duração
<div className="transition-smooth duration-base hover:scale-105">
<div className="transition-colors duration-slow">
<div className="transition-all duration-fast">
```

### 4. Espaçamento

```tsx
// Use sistema 8px
<div className="p-md gap-lg m-xl">     // 16px, 24px, 32px
<div className="spacing-sm">           // gap: 8px
```

### 5. Tipografia

```tsx
// Tamanhos normalizados
<h1 className="text-4xl font-bold">
<h2 className="text-2xl font-semibold">
<p className="text-base font-normal">
<small className="text-xs text-muted-foreground">

// Ou use utilities semânticas
<h1 className="text-display">
<h2 className="text-heading">
<p className="text-body">
<small className="text-caption">
```

---

## 🎨 Cheat Sheet de Cores

### Status (Mais Usado)
| Token | Hex | Uso |
|-------|-----|-----|
| `status-success` | Verde | ✅ Sucesso, ativo, confirmado |
| `status-error` | Vermelho | ❌ Erro, crítico, destrutivo |
| `status-warning` | Âmbar | ⚠️ Aviso, atenção, pendente |
| `status-info` | Azul | ℹ️ Informação, dica, neutro |
| `status-neutral` | Cinza | ⚪ Inativo, desabilitado |

### Trilhas
| Token | Cor | Uso |
|-------|-----|-----|
| `revenue` | Âmbar/Ouro | 💰 Trilha Revenue |
| `operational` | Verde | ⚙️ Trilha Operacional |
| `strategy` | Roxo | 🎯 Trilha Estratégia |

### Marca
| Token | Cor | Uso |
|-------|-----|-----|
| `aurora-primary` | Ciano (#0ABAB5) | 🎨 Cor principal da marca |

---

## 🔄 Migração Rápida

### De Cores Tailwind para Tokens

```tsx
// ANTES (❌)
className="bg-green-500 text-white"
className="bg-red-100 text-red-700"
className="bg-blue-50 border-blue-200"

// DEPOIS (✅)
className="bg-status-success text-white"
className="bg-status-error/10 text-status-error"
className="bg-status-info/5 border-status-info/20"
```

### De Valores Arbitrários para Tokens

```tsx
// ANTES (❌)
className="duration-200 w-[300px] text-[14px]"

// DEPOIS (✅)
className="duration-base w-table-md text-sm"
```

### De Classes Inline para Componentes

```tsx
// ANTES (❌)
<Badge className="bg-green-50 text-green-600 border-green-200">
  Ativo
</Badge>

// DEPOIS (✅)
<StatusBadge status="success" statusVariant="lighter">
  Ativo
</StatusBadge>
```

---

## 🎯 Casos de Uso Comuns

### 1. Card com Status
```tsx
<Card className="surface-elevated hover:shadow-aurora transition-smooth duration-base">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Título</CardTitle>
      <StatusBadge status="success">Ativo</StatusBadge>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-body text-muted-foreground">Conteúdo</p>
  </CardContent>
</Card>
```

### 2. Alerta de Erro
```tsx
<div className="p-md bg-status-error/10 border-status-error/30 border rounded-lg">
  <div className="flex items-center gap-sm">
    <XCircle className="h-5 w-5 text-status-error" />
    <p className="text-sm text-status-error">Erro ao processar</p>
  </div>
</div>
```

### 3. Badge de Prioridade
```tsx
<div className="flex items-center gap-sm">
  <PriorityBadge priority="high" showIcon />
  <PriorityBadge priority="medium" showIcon />
  <PriorityBadge priority="low" showIcon />
</div>
```

### 4. Botão Aurora Principal
```tsx
<AuroraButton 
  glow 
  size="lg"
  className="w-full"
  onClick={handleAction}
>
  <Sparkles className="mr-2 h-4 w-4" />
  Começar Agora
</AuroraButton>
```

### 5. Lista com Status
```tsx
{items.map(item => (
  <div 
    key={item.id}
    className="flex items-center justify-between p-md border-b hover:bg-muted/30 transition-colors duration-base"
  >
    <span className="text-body">{item.name}</span>
    <StatusBadge 
      status={item.active ? "success" : "neutral"}
      statusVariant="lighter"
    >
      {item.active ? "Ativo" : "Inativo"}
    </StatusBadge>
  </div>
))}
```

### 6. Chart com Cores de Trilha
```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <Line 
      dataKey="revenue" 
      stroke="hsl(var(--revenue))" 
      strokeWidth={2}
    />
    <Line 
      dataKey="operational" 
      stroke="hsl(var(--operational))" 
      strokeWidth={2}
    />
  </LineChart>
</ResponsiveContainer>
```

---

## ⚡ Performance Tips

### 1. Use Utilities CSS (Mais Rápido)
```tsx
// ✅ Utilities pré-compiladas
<div className="transition-smooth">

// ❌ Classes inline customizadas
<div className="transition-all duration-200 ease-out">
```

### 2. Prefira Componentes Padronizados
```tsx
// ✅ Componente otimizado
<StatusBadge status="success">

// ❌ Badge customizado toda vez
<Badge className="bg-status-success/10...">
```

### 3. Use Tokens Semânticos
```tsx
// ✅ Tokens CSS variables
className="bg-status-success"

// ❌ Cores hardcoded
className="bg-[#10b981]"
```

---

## 🐛 Troubleshooting

### Cor não aparece?
1. Verifique se o token existe no `tailwind.config.ts`
2. Certifique-se que está usando HSL: `hsl(var(--token))`
3. Verifique se a utility está no `design-tokens.css`

### Transição não funciona?
1. Use `transition-{property}` antes de `duration-*`
2. Exemplo: `transition-all duration-base`

### Dimensão não disponível?
1. Verifique no `tailwind.config.ts` se existe
2. Se for valor único, considere adicionar ao config
3. Se for muito específico, use valor arbitrário: `w-[125px]`

---

## 📚 Recursos

- **Documentação Completa**: `DESIGN_SYSTEM.md`
- **Tokens**: `tailwind.config.ts`
- **Utilities**: `src/styles/design-tokens.css`
- **Componentes**: `src/components/ui/`

---

## 🆘 Precisa de Ajuda?

1. Consulte `DESIGN_SYSTEM.md` para referência completa
2. Veja exemplos de uso nos componentes existentes
3. Use o autocomplete do VSCode/IDE para descobrir tokens disponíveis
4. Em dúvida? Use `StatusBadge` e `PriorityBadge` - cobrem 80% dos casos!

---

**Última Atualização**: Fase 9 Completa
