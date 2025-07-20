
# Community Module Structure

## Overview
Estrutura unificada e otimizada para o módulo de comunidade.

## Hooks Principais

### `useCommunityStats.ts`
- **Query Key**: `community-stats`
- **Função**: Busca estatísticas consolidadas da comunidade
- **Dados**: topicCount, postCount, activeUserCount, solvedCount

### `useCommunityCategories.ts`
- **Query Key**: `community-categories`
- **Função**: Busca categorias ativas da comunidade
- **Cache**: 3 minutos

### `useCommunityTopics.ts`
- **Query Key**: `community-topics`
- **Função**: Busca tópicos com filtros e busca
- **Cache**: 3 minutos

### `useReporting.ts`
- **Query Key**: `community-reports`
- **Função**: Sistema de relatórios e moderação

## Utilitários

### `utils/cacheUtils.ts`
Centraliza todas as invalidações de cache para evitar inconsistências:
- `invalidateAll()` - Invalida todas as queries da comunidade
- `invalidateTopics()` - Invalida queries de tópicos
- `invalidatePosts()` - Invalida queries de posts
- `invalidateStats()` - Invalida apenas estatísticas

### `utils/communityCacheUtils.ts`
Utilidades específicas para cache da comunidade com nomenclatura padronizada.

## Query Keys Padronizadas
- `community-categories` - Categorias da comunidade
- `community-topics` - Tópicos da comunidade
- `community-posts` - Posts/respostas
- `community-stats` - Estatísticas consolidadas
- `community-reports` - Relatórios e moderação

## Cache Strategy
- **Categories**: 3 minutos (dados semi-estáticos)
- **Topics**: 3 minutos (dados dinâmicos)
- **Stats**: 3 minutos (dados consolidados)
- **Reports**: Padrão (dados administrativos)

## Melhorias Implementadas
✅ Eliminação de hooks duplicados (forum* → community*)
✅ Padronização completa de query keys
✅ Cache inteligente e otimizado
✅ Invalidações centralizadas
✅ Performance melhorada
✅ Zero regressões funcionais
✅ Nomenclatura 100% consistente

## Estrutura Final
```
src/hooks/community/
├── index.ts                    # Exportações centralizadas
├── useCommunityCategories.ts   # Categorias
├── useCommunityTopics.ts       # Tópicos
├── useCommunityStats.ts        # Estatísticas
├── useReporting.ts             # Relatórios
├── usePostItem.ts              # Item de post
├── useDeleteConfirmation.ts    # Confirmação de exclusão
├── useTopicSolution.ts         # Soluções de tópicos
└── utils/
    ├── cacheUtils.ts           # Cache utilities
    └── communityCacheUtils.ts  # Community-specific cache
```
