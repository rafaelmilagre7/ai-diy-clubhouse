
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
├── AdminRoutes.tsx     # Rotas administrativas completas  
├── AuthRoutes.tsx      # Autenticação (sem conflitos)
├── LearningRoutes.tsx  # Sistema LMS
├── CommunityRoutes.tsx # Comunidade e fórum
├── NetworkingRoutes.tsx # Networking com guards
├── SolutionsRoutes.tsx # Catálogo de soluções
├── ToolsRoutes.tsx     # Ferramentas
├── BenefitsRoutes.tsx  # Benefícios
├── OnboardingRoutes.tsx # Onboarding
├── FormacaoRoutes.tsx  # Sistema LMS admin
├── ProfileRoutes.tsx   # Perfil do usuário
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
4. **SmartFeatureGuard** - Features específicas (networking, implementation_trail)

### Exemplo de Uso
```typescript
<Route path="/admin/*" element={
  <AdminProtectedRoutes>
    <AdminRoutes />
  </AdminProtectedRoutes>
} />
```

## 🔄 Mapeamento de Rotas ATUALIZADO

### Rotas Públicas
- `/` - Redirect baseado em auth status
- `/login` - Página de login (ModernLogin)
- `/convite/:token` - Sistema de convites
- `/auth/*` - Reset de senha e outras funções auth

### Rotas Protegidas (Member)
- `/dashboard` - Dashboard principal
- `/learning/*` - Sistema LMS
- `/comunidade/*` - Fórum e comunidade  
- `/networking/*` - Sistema de networking (com guard)
- `/solutions/*` - Catálogo de soluções
- `/tools/*` - Ferramentas
- `/benefits/*` - Benefícios
- `/implementation-trail` - Trilha de IA (com guard)
- `/profile/*` - Perfil do usuário
- `/onboarding-new/*` - Sistema de onboarding

### Rotas Administrativas Completas
- `/admin` - Dashboard administrativo
- `/admin/users` - Gerenciamento de usuários
- `/admin/solutions` - Gerenciamento de soluções
- `/admin/tools` - Gerenciamento de ferramentas
- `/admin/events` - Gerenciamento de eventos
- `/admin/roles` - Gerenciamento de papéis
- `/admin/onboarding` - Análise de onboarding
- `/admin/onboarding-reset` - Reset de onboarding
- `/admin/invites` - Gerenciamento de convites
- `/admin/community` - Moderação da comunidade
- `/admin/diagnostics` - Diagnósticos do sistema

### Rotas de Formação
- `/formacao/*` - Gestão LMS (role formacao)

## ✅ Status Atual - CORRIGIDO

- [x] Conflito de rotas auth resolvido
- [x] AdminRoutes implementado completamente
- [x] Componentes duplicados removidos
- [x] Imports otimizados
- [x] Guards funcionando corretamente
- [x] Redirecionamentos validados
- [x] 404 handling implementado

## 🚫 O que NÃO Fazer

- ❌ Criar arrays de rotas (`RouteObject[]`)
- ❌ Múltiplos sistemas de roteamento
- ❌ Rotas duplicadas em arquivos diferentes
- ❌ Misturar padrões array-based e component-based
- ❌ Criar componentes routing duplicados

## 🔧 Troubleshooting

### Build funcionando ✅
- Todos os imports resolvidos
- Conflitos de rotas eliminados
- Componentes duplicados removidos

### Performance ✅
- Lazy loading via `React.Suspense`
- Guards otimizados
- Redirecionamentos eficientes

---

**Última atualização**: Dezembro 2024  
**Status**: Sistema completamente implementado e funcional ✅
