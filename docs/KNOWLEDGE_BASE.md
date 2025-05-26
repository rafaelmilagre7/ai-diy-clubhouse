
# 📚 Knowledge Base - Plataforma Viver de IA

## 📋 Índice
1. [Visão Geral do Projeto](#visão-geral-do-projeto)
2. [Arquitetura Técnica](#arquitetura-técnica)
3. [Fluxos Principais de Usuário](#fluxos-principais-de-usuário)
4. [Permissões e Roles](#permissões-e-roles)
5. [Design System](#design-system)
6. [Armazenamento e Dados](#armazenamento-e-dados)
7. [Pontos de Atenção](#pontos-de-atenção)
8. [Links e Recursos Úteis](#links-e-recursos-úteis)

---

## 1. Visão Geral do Projeto

### Nome Oficial
**VIVER DE IA Club** - Plataforma de Implementação e Comunidade de Inteligência Artificial

### Propósito Principal
Democratizar o acesso à implementação de soluções de IA para empresas e profissionais, oferecendo:
- Soluções práticas e implementáveis de IA
- Comunidade ativa de profissionais
- Sistema de aprendizado estruturado (LMS)
- Ferramentas e recursos exclusivos

### Principais Funcionalidades
- **Dashboard Personalizado**: Acompanhamento de progresso e métricas
- **Trilha de Implementação**: Guias passo-a-passo para implementar soluções de IA
- **Sistema de Aprendizado (LMS)**: Cursos, módulos e aulas estruturadas
- **Comunidade**: Fórum de discussões, networking e suporte
- **Ferramentas**: Catálogo de ferramentas de IA com benefícios exclusivos
- **Sistema de Sugestões**: Canal para feedback e melhorias da plataforma
- **Painel Administrativo**: Gestão completa da plataforma

### Público-Alvo
- **Empresários** que querem implementar IA em seus negócios
- **Profissionais** interessados em se especializar em IA
- **Consultores** que oferecem serviços de implementação de IA
- **Desenvolvedores** trabalhando com soluções de IA

---

## 2. Arquitetura Técnica

### Frontend
- **Framework**: React 18 com TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Roteamento**: React Router v6
- **Estado**: Context API + React Query (TanStack Query)
- **Animações**: Framer Motion
- **Ícones**: Lucide React

### Backend
- **Plataforma**: Supabase (Backend-as-a-Service)
- **Database**: PostgreSQL
- **Autenticação**: Supabase Auth
- **API**: RESTful + RPC Functions
- **Realtime**: Supabase Realtime para atualizações em tempo real

### Banco de Dados
- **Tipo**: PostgreSQL (gerenciado pelo Supabase)
- **Row Level Security (RLS)**: Implementado em todas as tabelas sensíveis
- **Triggers**: Para automação de processos (ex: atualização de timestamps)
- **Functions**: Stored procedures para lógica complexa

### Integrações Principais
- **Supabase**: Backend completo, auth, database, storage
- **OpenAI**: Para funcionalidades de IA e assistentes
- **ImgBB**: Upload de imagens (fallback)
- **Resend**: Envio de emails transacionais
- **WhatsApp Business API**: Notificações via WhatsApp

---

## 3. Fluxos Principais de Usuário

### 3.1 Onboarding
1. **Registro**: Email/senha ou login social
2. **Perfil Pessoal**: Nome, contatos, localização
3. **Informações Profissionais**: Empresa, cargo, setor
4. **Contexto de Negócio**: Desafios, metas, KPIs
5. **Experiência com IA**: Nível de conhecimento, ferramentas usadas
6. **Personalização**: Preferências de conteúdo e networking
7. **Informações Complementares**: Como conheceu a plataforma, autorização para casos de estudo

### 3.2 Dashboard
- **Visão Geral**: KPIs de progresso, soluções ativas/concluídas
- **Soluções Recomendadas**: Baseadas no perfil do usuário
- **Atividade Recente**: Últimas ações e atualizações
- **Acesso Rápido**: Links para funcionalidades principais

### 3.3 Implementação de Soluções
1. **Catálogo de Soluções**: Filtros por categoria, dificuldade
2. **Detalhes da Solução**: Visão geral, módulos, ferramentas necessárias
3. **Implementação Guiada**: Módulos sequenciais com conteúdo rico
4. **Checklist de Progresso**: Acompanhamento de tarefas
5. **Certificação**: Emissão de certificados ao completar

### 3.4 Comunidade
- **Categorias de Discussão**: Organizadas por temas
- **Tópicos e Respostas**: Sistema de posts hierárquico
- **Sistema de Reações**: Upvotes, solved, etc.
- **Networking**: Conexões entre membros
- **Mensagens Diretas**: Chat privado entre usuários

### 3.5 Painel Admin
- **Gestão de Usuários**: Visualizar, editar roles, resetar senhas
- **Gestão de Conteúdo**: Criar/editar soluções, cursos, ferramentas
- **Analytics**: Métricas de uso, engajamento, completions
- **Moderação**: Gestão de posts, comentários, usuários
- **Configurações**: Roles, permissões, configurações globais

---

## 4. Permissões e Roles

### Roles Definidos

#### **Admin**
- **Identificação**: `role === 'admin'` ou emails `@viverdeia.ai`
- **Permissões**:
  - Acesso total ao painel administrativo
  - Gestão de usuários (criar, editar, deletar)
  - Criação e edição de conteúdo (soluções, cursos)
  - Moderação da comunidade
  - Visualização de analytics e métricas
  - Configuração de roles e permissões

#### **Formacao**
- **Identificação**: `role === 'formacao'`
- **Permissões**:
  - Acesso a conteúdos exclusivos de formação
  - Criação de cursos e materiais educativos
  - Moderação limitada da comunidade
  - Analytics básicos

#### **Member**
- **Identificação**: `role === 'member'` (padrão)
- **Permissões**:
  - Acesso completo às soluções públicas
  - Participação na comunidade
  - Sistema de aprendizado (LMS)
  - Ferramentas e benefícios
  - Networking com outros membros

### Sistema de Validação
- **Validação por Email**: Emails específicos recebem roles automáticos
- **Fallback Seguro**: Usuários sem role definido recebem `member`
- **Validação no Frontend**: Componentes `ProtectedRoute` para controle de acesso
- **Validação no Backend**: RLS policies no Supabase

---

## 5. Design System

### Paleta de Cores
```css
/* Cores Principais */
--viverblue: #0066FF;           /* Azul principal da marca */
--viverblue-dark: #0052CC;      /* Azul escuro */
--viverblue-light: #CCE5FF;     /* Azul claro */

/* Cores de Background */
--background: #0A0A0B;          /* Fundo principal (escuro) */
--surface: #151823;             /* Superfícies de conteúdo */
--surface-secondary: #1A1D2A;   /* Superfícies secundárias */

/* Cores de Texto */
--text-primary: #FFFFFF;        /* Texto principal */
--text-secondary: #A1A1AA;      /* Texto secundário */
--text-muted: #6B7280;          /* Texto desbotado */

/* Cores de Estado */
--success: #10B981;             /* Verde para sucesso */
--warning: #F59E0B;             /* Amarelo para avisos */
--error: #EF4444;               /* Vermelho para erros */
```

### Tipografia
- **Font Family**: Inter (Google Fonts)
- **Tamanhos**: Sistema baseado em Tailwind (text-sm, text-base, text-lg, etc.)
- **Pesos**: Regular (400), Medium (500), Semibold (600), Bold (700)

### Componentes Exclusivos
- **ModernDashboardHeader**: Header imersivo do dashboard
- **ProfileHeader**: Cabeçalho de perfil com avatar e estatísticas
- **SolutionCard**: Card para exibição de soluções
- **KpiGrid**: Grid de métricas e KPIs
- **ForumLayout**: Layout específico para o fórum
- **LearningProgress**: Componente de progresso de aprendizado

### Padrões de UI
- **Sidebar Collapsible**: Menu lateral retrátil
- **Dark Theme**: Tema escuro como padrão
- **Glassmorphism**: Efeitos de vidro em alguns componentes
- **Micro-interactions**: Animações sutis para feedback
- **Responsive Design**: Mobile-first approach

---

## 6. Armazenamento e Dados

### Tabelas Principais

#### **profiles**
```sql
- id (uuid, PK): ID do usuário (FK para auth.users)
- email (text): Email do usuário
- name (text): Nome completo
- avatar_url (text): URL da foto de perfil
- role (text): Papel do usuário (admin, member, formacao)
- role_id (uuid): FK para user_roles
- company_name (text): Nome da empresa
- industry (text): Setor de atuação
- current_position (text): Cargo atual
- created_at (timestamp): Data de criação
```

#### **solutions**
```sql
- id (uuid, PK): ID único da solução
- title (text): Título da solução
- description (text): Descrição detalhada
- category (enum): Categoria (Receita, Operacional, Estratégia)
- difficulty (enum): Dificuldade (Fácil, Médio, Difícil)
- slug (text): URL amigável
- published (boolean): Status de publicação
- estimated_time (integer): Tempo estimado em minutos
- tags (text[]): Array de tags
- created_at (timestamp): Data de criação
```

#### **modules**
```sql
- id (uuid, PK): ID único do módulo
- solution_id (uuid, FK): Referência à solução
- title (text): Título do módulo
- content (jsonb): Conteúdo estruturado
- module_order (integer): Ordem do módulo
- type (text): Tipo do módulo
- created_at (timestamp): Data de criação
```

#### **progress**
```sql
- id (uuid, PK): ID único do progresso
- user_id (uuid, FK): Referência ao usuário
- solution_id (uuid, FK): Referência à solução
- current_module (integer): Módulo atual
- is_completed (boolean): Status de conclusão
- completed_modules (integer[]): Módulos completados
- last_activity (timestamp): Última atividade
```

### Storage de Arquivos
- **Buckets Configurados**:
  - `learning_materials`: Materiais de curso
  - `course_images`: Imagens de cursos
  - `learning_videos`: Vídeos de aulas
  - `solution_files`: Arquivos de soluções
- **Upload Flow**: 
  1. Frontend: Upload via Supabase SDK
  2. Storage: Arquivo salvo no bucket
  3. Database: URL pública salva na tabela relevante
- **Permissions**: Políticas RLS para controle de acesso

---

## 7. Pontos de Atenção

### Áreas em Desenvolvimento
- **Sistema de Notificações**: Implementação parcial, precisa de refinamento
- **Analytics Avançados**: Métricas mais detalhadas para admins
- **Certificações**: Sistema de geração de certificados
- **Gamificação**: Badges, pontuações, rankings

### Riscos Técnicos
- **Performance**: Queries complexas podem impactar performance com crescimento da base
- **RLS Policies**: Políticas mal configuradas podem causar problemas de acesso
- **Storage Limits**: Monitorar uso de storage do Supabase
- **Rate Limiting**: APIs externas (OpenAI, WhatsApp) têm limites

### Riscos de UX
- **Onboarding Longo**: Processo pode ser extenso para alguns usuários
- **Complexidade**: Muitas funcionalidades podem confundir novos usuários
- **Mobile Experience**: Alguns componentes precisam de otimização mobile

### Debugging e Logs
- **Console Logs**: Abundantes para debugging em desenvolvimento
- **Error Boundaries**: Implementados para captura de erros React
- **Supabase Logs**: Monitoramento via dashboard do Supabase

---

## 8. Links e Recursos Úteis

### Ambientes
- **Produção**: [A ser definido após deploy]
- **Desenvolvimento**: `http://localhost:5173`

### Supabase
- **Project ID**: `zotzvtepvpnkcoobdubt`
- **URL**: `https://zotzvtepvpnkcoobdubt.supabase.co`
- **Dashboard**: [Supabase Dashboard](https://supabase.com/dashboard/project/zotzvtepvpnkcoobdubt)

### Repositórios e Documentação
- **Código Fonte**: Gerenciado via Lovable
- **Design System**: shadcn/ui + Tailwind CSS
- **Documentação Técnica**: Este documento

### Contatos dos Responsáveis
- **Rafael**: `rafael@viverdeia.ai` (Admin Principal)
- **Equipe de Desenvolvimento**: Via plataforma Lovable

### Recursos Externos
- **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **shadcn/ui**: [https://ui.shadcn.com/](https://ui.shadcn.com/)
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **React Query**: [https://tanstack.com/query/latest](https://tanstack.com/query/latest)

---

## 📝 Histórico de Atualizações

| Data | Versão | Alterações |
|------|--------|------------|
| 2025-01-26 | 1.0 | Versão inicial do Knowledge Base |

---

**💡 Dica**: Mantenha este documento atualizado conforme novas funcionalidades são implementadas ou alterações significativas são feitas na arquitetura.

**🔄 Última Atualização**: Janeiro 2025
