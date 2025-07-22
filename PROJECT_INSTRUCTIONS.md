# Instruções Personalizadas do Projeto

## 🔒 Proteção do Módulo de Soluções

### Status: APROVADO PARA PRODUÇÃO ✅
A seção de soluções da plataforma está **aprovada e estável**. Antes de fazer qualquer alteração nesta seção, você deve:

1. **Verificar Necessidade**: Perguntar se a mudança é realmente necessária
2. **Avaliar Impacto**: Considerar se afeta funcionalidades existentes
3. **Confirmar com Usuário**: Obter aprovação para mudanças estruturais

### Arquivos Protegidos (Requerem Aprovação):
- `src/pages/member/SolutionDetails.tsx` - Página principal de soluções
- `src/hooks/useSolutionData.ts` - Hook de carregamento de dados
- `src/hooks/useSolutionInteractions.ts` - Hook de interações
- Componentes em `src/components/solution/` - Interface da solução
- Migrações relacionadas a soluções no Supabase

### Alterações Permitidas (Sem Aprovação):
- Melhorias de UI/UX que não quebram funcionalidades
- Correções de bugs menores
- Otimizações de performance
- Adição de validações não-breaking

### Processo para Mudanças Grandes:
1. Explicar a necessidade da mudança
2. Listar os arquivos/funcionalidades afetados
3. Aguardar aprovação do usuário
4. Implementar de forma incremental
5. Atualizar esta documentação

### Referência Completa:
Ver `SOLUTIONS_MODULE_STATUS.md` para detalhes técnicos completos do módulo aprovado.

---

## Outras Instruções do Projeto

### Linguagem
- Sempre responder em português brasileiro
- Usar linguagem menos técnica quando possível
- Manter comunicação clara e acessível

### Desenvolvimento
- Priorizar soluções incrementais vs grandes refatorações
- Sempre testar compatibilidade com dados existentes
- Manter princípios de segurança (RLS, autenticação)

---
**Última atualização:** 22/01/2025