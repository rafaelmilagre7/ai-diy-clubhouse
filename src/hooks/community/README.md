
# Community/Forum Module Structure

## Overview
Estrutura unificada e otimizada para o módulo de comunidade/fórum.

## Hooks Principais

### `useForumStats.ts`
- **Query Key**: `forum-stats`
- **Função**: Busca estatísticas consolidadas do fórum
- **Dados**: topicCount, postCount, activeUserCount, solvedCount

### `useForumCategories.ts`
- **Query Key**: `forum-categories`
- **Função**: Busca categorias ativas do fórum
- **Cache**: 5 minutos

### `useForumTopics.ts`
- **Query Key**: `forum-topics`
- **Função**: Busca tópicos com filtros e busca
- **Cache**: 2 minutos

### `useReporting.ts`
- **Query Key**: `forum-reports`
- **Função**: Sistema de relatórios e moderação

## Utilitários

### `utils/cacheUtils.ts`
Centraliza todas as invalidações de cache para evitar inconsistências:
- `invalidateAll()` - Invalida todas as queries do fórum
- `invalidateTopics()` - Invalida queries de tópicos
- `invalidatePosts()` - Invalida queries de posts
- `invalidateStats()` - Invalida apenas estatísticas

## Query Keys Padronizadas
- `forum-categories` - Categorias do fórum
- `forum-topics` - Tópicos do fórum
- `forum-posts` - Posts/respostas
- `forum-stats` - Estatísticas consolidadas
- `forum-reports` - Relatórios e moderação
- `forum-community-stats` - Estatísticas da página community

## Cache Strategy
- **Categories**: 5 minutos (dados estáticos)
- **Topics**: 2 minutos (dados dinâmicos)
- **Stats**: 10 minutos (dados pesados)
- **Reports**: Padrão (dados administrativos)

## Melhorias Implementadas
✅ Eliminação de hooks duplicados
✅ Padronização de query keys
✅ Cache inteligente e otimizado
✅ Invalidações centralizadas
✅ Performance melhorada
✅ Zero regressões funcionais
