
# Remoção da Trilha de Implementação - Plano de Execução

## Status: FASE 1 - PREPARAÇÃO ✅

### Visão Geral
Remoção completa da funcionalidade "Trilha de Implementação" seguindo o mesmo padrão usado para Networking.

### Arquivos Mapeados para Remoção

#### Páginas Principais (2 arquivos)
- `src/pages/member/ImplementationTrailPage.tsx` ⚠️
- `src/pages/member/RedesignedImplementationTrailPage.tsx` ⚠️

#### Componentes da Trilha (15 arquivos)
- `src/components/implementation-trail/` (diretório completo)
- `src/components/implementation-trail/ImplementationTrailCreator.tsx`
- `src/components/implementation-trail/TrailDisplayContent.tsx`
- `src/components/implementation-trail/TrailSolutionsList.tsx`
- `src/components/implementation-trail/TrailLessonsList.tsx`
- `src/components/implementation-trail/TrailLessonCard.tsx`
- `src/components/implementation-trail/TrailSolutionsDisplay.tsx`
- `src/components/implementation-trail/TrailLoadingState.tsx`
- `src/components/implementation-trail/TrailErrorFallback.tsx`
- `src/components/implementation-trail/TrailEmptyState.tsx`
- `src/components/implementation-trail/redesigned/` (subdiretório)
- `src/components/implementation-trail/redesigned/RedesignedImplementationTrailPage.tsx`
- `src/components/implementation-trail/redesigned/TrailHeroSection.tsx`
- `src/components/implementation-trail/redesigned/TrailProgressDashboard.tsx`
- `src/components/implementation-trail/redesigned/InteractiveTrailCard.tsx`
- `src/components/implementation-trail/redesigned/TrailFiltersBar.tsx`
- `src/components/implementation-trail/redesigned/TrailWelcomePrompt.tsx`
- `src/components/implementation-trail/redesigned/TrailStatsOverview.tsx`

#### Hooks e Utilitários (8 arquivos)
- `src/hooks/implementation/useImplementationTrail.ts` ⚠️
- `src/hooks/implementation/useImplementationTrail.utils.ts`
- `src/hooks/implementation/useTrailEnrichment.ts`
- `src/hooks/implementation/useTrailSolutionsEnrichment.ts`
- `src/hooks/implementation/useTrailGuidedExperience.ts`
- `src/types/implementation-trail.ts` ⚠️
- `src/components/dashboard/ImplementationTrail.tsx` (componente do dashboard)
- `src/components/dashboard/TrailCard*.tsx` (cards relacionados)

#### Componentes do Dashboard (5 arquivos)
- `src/components/dashboard/ImplementationTrail.tsx`
- `src/components/dashboard/TrailCardLoader.tsx`
- `src/components/dashboard/TrailEmptyState.tsx`
- `src/components/dashboard/TrailCardList.tsx`
- `src/components/dashboard/TrailCardHeader.tsx`

#### Integrações (4 arquivos)
- `src/routes/MemberRoutes.tsx` - Rota `/implementation-trail`
- `src/components/layout/member/MemberSidebarNav.tsx` - Item de navegação
- `src/components/layout/member/navigation/MemberSidebarNavItems.tsx` - Item de navegação
- `src/hooks/auth/useSmartFeatureAccess.ts` - Sistema de acesso

### Backend Preservado
- **Tabelas DB**: `implementation_trails`, `implementation_profiles` 
- **Edge Function**: `generate-smart-trail`
- **Dados do usuário**: Mantidos para rollback futuro

### Plano de Fases

#### ✅ FASE 1 - PREPARAÇÃO (ATUAL)
- [x] Mapear todos os arquivos envolvidos
- [x] Adicionar feature flag `implementation_trail` 
- [x] Documentar plano de remoção
- [x] Confirmar preservação do backend

#### 🔄 FASE 2 - DESATIVAÇÃO FUNCIONAL (5-8 min)
- [ ] Desativar feature flag (`enabled: false`)
- [ ] Remover item da navegação sidebar
- [ ] Comentar rota no MemberRoutes
- [ ] Comentar componente no Dashboard

#### 🔄 FASE 3 - LIMPEZA BACKEND (OPCIONAL)
- [ ] Remover Edge Function `generate-smart-trail`
- [ ] Manter tabelas DB para rollback

#### 🔄 FASE 4 - REMOÇÃO COMPLETA FRONTEND
- [ ] Deletar diretório `src/components/implementation-trail/`
- [ ] Deletar hooks `src/hooks/implementation/`
- [ ] Deletar tipos `src/types/implementation-trail.ts`
- [ ] Deletar páginas relacionadas
- [ ] Limpar componentes do dashboard
- [ ] Remover referências finais

### Estimativa de Tempo
- **Fase 1**: ✅ Concluída (5 min)
- **Fase 2**: 5-8 min (baixo risco)
- **Fase 3**: 3-5 min (opcional)
- **Fase 4**: 20-25 min (remoção completa)
- **Total**: 35-40 min

### Segurança e Rollback
- ✅ Feature flag permite desativação imediata
- ✅ Backend preservado para rollback
- ✅ Dados do usuário mantidos
- ✅ Zero impacto em outras funcionalidades

### Próximos Passos
Aguardando confirmação para proceder com **FASE 2 - DESATIVAÇÃO FUNCIONAL**.

---
**Log**: Fase 1 executada com sucesso em 2024-06-07
