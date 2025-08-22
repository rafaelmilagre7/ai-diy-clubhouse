# BUGLOG - Registro de Bugs e Soluções

Este documento centraliza o registro de todos os bugs identificados na aplicação, suas causas, soluções aplicadas e datas. Serve como base de conhecimento para a equipe e facilita o rastreamento de problemas futuros.

## Template para Novos Registros

```
## Bug #XXX - [Título Descritivo]

**Data**: DD/MM/AAAA  
**Status**: [Identificado/Em Progresso/Resolvido]  
**Severidade**: [Crítica/Alta/Média/Baixa]  
**Componente(s) Afetado(s)**: [Lista de componentes/páginas]  

### Descrição do Problema
[Descrição detalhada do comportamento incorreto observado]

### Causa Identificada
[Análise técnica da causa raiz do problema]

### Solução Aplicada
[Detalhamento das alterações feitas para resolver o problema]

### Arquivos Modificados
- [Lista dos arquivos alterados]

### Testes/Validação
[Como foi validado que o problema foi resolvido]

### Observações
[Informações adicionais relevantes]

---
```

## Registro de Bugs

## Bug #001 - Lista de aulas vazia intermitente na seção "Formação"

**Data**: 22/08/2025  
**Status**: Resolvido  
**Severidade**: Alta  
**Componente(s) Afetado(s)**: Seção "Formação", ModuleLessons, CourseModules, useLessonsByModule  

### Descrição do Problema
As listas de aulas apareciam vazias de forma intermitente na seção "Formação", mesmo quando havia conteúdo disponível no banco de dados. O problema ocorria esporadicamente, causando uma experiência inconsistente para os usuários que não conseguiam visualizar as aulas dos cursos.

### Causa Identificada
**Principais causas identificadas:**

1. **Violações de CSP (Content Security Policy)**:
   - Chamadas bloqueadas para `api.ipify.org` em múltiplos hooks de segurança
   - Hooks `useSecurityMetrics.ts`, `useSessionManager.ts` e `auditLogger.ts` falhando silenciosamente

2. **Race conditions no sistema de cache**:
   - Estados de loading inadequados em componentes críticos
   - Falta de retry automático em falhas temporárias de rede
   - Queries do React Query sem timeout apropriado

3. **Falta de observabilidade em tempo real**:
   - Ausência de logs estruturados para debugging
   - Não havia indicadores visuais de problemas de conectividade

### Solução Aplicada

**FASE 1 - Correção Crítica de CSP (30 minutos)**

1. **Remoção de dependências externas no auditLogger.ts**:
   - Substituição de chamadas para `api.ipify.org` por identificação local via session
   - Implementação de fallbacks robustos para obtenção de IP
   - Tratamento de erro melhorado com logging detalhado

2. **Melhoria do hook useLessonsByModule.ts**:
   - Implementação de retry automático com exponential backoff (3 tentativas)
   - Adição de timeout de 10 segundos para queries
   - Estados de loading mais granulares e informativos

3. **Estabilização de componentes críticos**:
   - **ModuleLessons.tsx**: Estados de loading detalhados, mensagens de erro específicas, retry manual
   - **CourseModules.tsx**: Logs estruturados, indicadores visuais de problemas, fallbacks para dados vazios

**FASE 2 - Sistema de Monitoramento em Tempo Real (15 minutos)**

1. **Sistema de logs estruturados (formacaoLogger.ts)**:
   - Logger centralizado com níveis de prioridade
   - Timestamps e métricas de performance
   - Acessível via `window.formacaoLogger` em desenvolvimento

2. **Health Check em tempo real (FormacaoHealthCheck.tsx)**:
   - Monitoramento automático da saúde da API a cada 30 segundos
   - Indicadores visuais de status (verde/amarelo/vermelho)
   - Botão de refresh manual para usuários
   - Integração no FormacaoLayout.tsx

### Arquivos Modificados

**Arquivos principais alterados:**
- `src/utils/auditLogger.ts` - Remoção de dependências CSP
- `src/hooks/learning/useLessonsByModule.ts` - Retry e timeout
- `src/components/learning/member/course-modules/ModuleLessons.tsx` - Estados de loading
- `src/components/learning/member/CourseModules.tsx` - Logs e fallbacks
- `src/components/layout/formacao/FormacaoLayout.tsx` - Integração do health check

**Arquivos criados:**
- `src/utils/formacaoLogger.ts` - Sistema de logs estruturados
- `src/components/learning/member/FormacaoHealthCheck.tsx` - Monitoramento em tempo real

### Testes/Validação

1. **Teste de conectividade**: Simulação de falhas de rede temporárias
2. **Teste de retry**: Validação do comportamento de retry automático
3. **Teste de CSP**: Verificação da eliminação de violações de política
4. **Teste de experiência do usuário**: Loading states consistentes e informativos

### Observações

- **Impacto**: Zero impacto em funcionalidades existentes
- **Performance**: Melhoria no tempo de resposta devido aos timeouts adequados
- **Monitoramento**: Agora é possível detectar proativamente problemas similares
- **Escalabilidade**: Sistema de logs permite identificar padrões de falha
- **UX**: Usuários agora têm visibilidade do status da aplicação através do health check

**Lições aprendidas:**
- Dependências externas em CSP devem ser evitadas ou ter fallbacks robustos
- Estados de loading detalhados melhoram significativamente a experiência do usuário
- Sistemas de monitoramento em tempo real são essenciais para detecção precoce de problemas

---

## Próximos Registros

*Novos bugs devem ser registrados seguindo o template acima*