
# Sistema de Rotas Unificado - Viver de IA

## 📋 Visão Geral

Este diretório contém o **sistema unificado de roteamento** da plataforma Viver de IA. 

**⚠️ IMPORTANTE**: Este é o **ÚNICO** sistema de rotas da aplicação. NÃO criar sistemas alternativos.

## 🏗️ Arquitetura

### Ponto de Entrada
- **`src/routes/index.tsx`** - Router principal da aplicação
- **`src/App.tsx`** - Importa apenas `AppRoutes` de `index.tsx`

### Convenções Obrigatórias

#### 1. Naming Convention
```typescript
// ✅ CORRETO
export const AdminRoutes = () => { ... }
export const LearningRoutes = () => { ... }

// ❌ INCORRETO  
export const adminRoutes = [ ... ]
export default function Routes() { ... }
```

#### 2. File Structure
```
src/routes/
├── index.tsx           # Router principal
├── AdminRoutes.tsx     # Rotas administrativas  
├── AuthRoutes.tsx      # Autenticação
├── LearningRoutes.tsx  # Sistema LMS
└── README.md           # Esta documentação
```

#### 3. Component Pattern
```typescript
// ✅ PADRÃO OBRIGATÓRIO
import React from 'react';
import { Routes, Route } from 'react-router-dom';

export const NomeRoutes = () => {
  return (
    <Routes>
      <Route path="subpath" element={<Component />} />
      <Route index element={<DefaultComponent />} />
    </Routes>
  );
};
```

## 🛡️ Guards de Acesso

### Hierarquia de Proteção
1. **ProtectedRoutes** - Usuário autenticado
2. **AdminProtectedRoutes** - Role admin
3. **FormacaoProtectedRoutes** - Role formacao
4. **SmartFeatureGuard** - Features específicas

### Exemplo de Uso
```typescript
<Route path="/admin/*" element={
  <AdminProtectedRoutes>
    <AdminRoutes />
  </AdminProtectedRoutes>
} />
```

## 📝 Checklist para Novas Rotas

Antes de criar/modificar rotas, verificar:

- [ ] A rota já existe em outro arquivo?
- [ ] Está seguindo o padrão component-based?
- [ ] Tem os guards de acesso apropriados?
- [ ] Está documentada neste README?
- [ ] Foi testada em dev environment?

## 🚫 O que NÃO Fazer

- ❌ Criar arrays de rotas (`RouteObject[]`)
- ❌ Múltiplos sistemas de roteamento
- ❌ Rotas duplicadas em arquivos diferentes
- ❌ Importar rotas de `src/components/routing/`
- ❌ Misturar padrões array-based e component-based

## 🔄 Mapeamento de Rotas

### Rotas Públicas
- `/` - Redirect baseado em auth status
- `/login` - Página de login
- `/convite/:token` - Sistema de convites

### Rotas Protegidas (Member)
- `/dashboard` - Dashboard principal
- `/learning/*` - Sistema LMS
- `/comunidade/*` - Fórum e comunidade  
- `/networking/*` - Sistema de networking
- `/solutions/*` - Catálogo de soluções
- `/tools/*` - Ferramentas e benefícios
- `/profile/*` - Perfil do usuário

### Rotas Administrativas
- `/admin/*` - Painel administrativo
- `/formacao/*` - Gestão LMS (role formacao)

## 🔧 Troubleshooting

### Erro: "has no exported member"
```
// ❌ Problema
import { routeArray } from './RouteFile'

// ✅ Solução  
import { RouteComponent } from './RouteFile'
```

### Rota não encontrada
1. Verificar se está em `src/routes/index.tsx`
2. Verificar guards de acesso
3. Verificar hierarquia de rotas aninhadas

## 🚀 Performance

- Todas as rotas usam lazy loading via `React.Suspense`
- Components são carregados sob demanda
- Guards executam verificações eficientes

---

**Última atualização**: December 2024  
**Responsável**: Sistema Unificado de Rotas
