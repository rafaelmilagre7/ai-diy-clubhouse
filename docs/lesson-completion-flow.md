# Fluxo de Conclusão de Aulas

## 📋 Visão Geral

Este documento descreve o sistema de progresso e conclusão de aulas na plataforma de formação.

## 🎯 Estados de Progresso

O sistema utiliza uma abordagem **binária padronizada** com 3 estados:

| Estado | Valor | Descrição | `completed_at` |
|--------|-------|-----------|----------------|
| **NOT_STARTED** | 0% | Usuário nunca acessou a aula | `NULL` |
| **STARTED** | 5% | Usuário iniciou mas não concluiu | `NULL` |
| **COMPLETED** | 100% | Usuário concluiu a aula | `NOT NULL` |

### Verificação de Conclusão

```typescript
// ✅ CORRETO - Usar >= 100
const isCompleted = progress_percentage >= 100;

// ❌ ERRADO - Nunca usar === 100
const isCompleted = progress_percentage === 100;
```

## 🔄 Fluxo de Conclusão

### 1. Acesso Inicial à Aula
```
Usuário acessa aula
    ↓
Sistema verifica se existe progresso
    ↓
Se não existe → Cria registro com 5%
Se existe → Carrega estado atual
```

### 2. Conclusão da Aula
```
Usuário clica "Marcar como Concluída"
    ↓
Frontend: showModernLoading("Concluindo aula...")
    ↓
Backend: UPSERT learning_progress
  - progress_percentage = 100
  - completed_at = NOW()
  - updated_at = NOW()
    ↓
Se SUCESSO:
  ├─ dismissModernToast(loadingId)
  ├─ showModernSuccess("Aula concluída!")
  ├─ Invalida caches (lesson-progress, user-progress, course-details)
  ├─ Atualiza estado local (isCompleted = true)
  └─ Abre modal de NPS (APÓS salvamento confirmado)
    ↓
Se ERRO:
  ├─ dismissModernToast(loadingId)
  ├─ showModernError("Erro ao concluir aula")
  ├─ Retry automático (até 2x)
  └─ Modal NÃO abre
```

## 📊 Cálculo de Progresso do Curso

### Lógica de Cálculo

```typescript
const completedCount = userProgress.filter(
  p => allLessonIds.includes(p.lesson_id) && 
       p.progress_percentage >= 100  // ✅ Sempre >= 100
).length;

const courseProgress = Math.round(
  (completedCount / totalLessons) * 100
);
```

### Exemplo Prático

**Curso com 10 aulas:**
- 3 aulas com `progress_percentage = 100` ✅
- 2 aulas com `progress_percentage = 5` 
- 5 aulas com `progress_percentage = 0`

**Resultado:** 30% de progresso (3/10 * 100)

## 🗄️ Estrutura do Banco de Dados

```sql
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  lesson_id UUID REFERENCES learning_lessons NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT check_completed_consistency CHECK (
    (progress_percentage >= 100 AND completed_at IS NOT NULL)
    OR 
    (progress_percentage < 100 AND completed_at IS NULL)
  )
);

-- Trigger automático para garantir consistência
CREATE TRIGGER learning_progress_ensure_completed
  BEFORE INSERT OR UPDATE ON learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION ensure_completed_at_consistency();
```

## Troubleshooting

### Modal NPS não abre

**Sintomas:**
- Usuário clica em "Marcar como Concluída"
- Toast de sucesso aparece
- Modal NPS não abre

**Diagnóstico:**
1. Abrir console do navegador
2. Procurar por `[LESSON-CONTENT] ❌` ou `[LESSON-PROGRESS] ❌`
3. Verificar se há erros no Network tab (filtrar por `learning_progress`)

**Soluções:**
- Se erro de constraint: verificar que trigger `ensure_completed_at_consistency()` está ativo
- Se erro de RLS: verificar policies na tabela `learning_progress`
- Se erro de rede: tentar fazer logout e login novamente
- Se persistir: rodar query de monitoramento para verificar estado do banco

**Query de verificação:**
```sql
SELECT * FROM learning_progress 
WHERE user_id = '<user_id>' 
AND lesson_id = '<lesson_id>';
```

### Progresso não salva

**Sintomas:**
- Botão fica em "Salvando..." indefinidamente
- Toast de erro aparece
- Progresso não atualiza

**Diagnóstico:**
1. Console do navegador: procurar por `[LESSON-PROGRESS] ❌ Erro no UPSERT`
2. Network tab: verificar status da request para `/rest/v1/learning_progress`
3. Verificar response body do erro

**Soluções:**
- **Erro 401/403**: Problema de autenticação/autorização
  - Verificar RLS policies
  - Fazer logout e login novamente
- **Erro 409/Conflict**: Problema de concorrência
  - Sistema tentará retry automático (2x)
  - Se persistir, recarregar página
- **Erro 500**: Problema no servidor
  - Verificar logs do Supabase
  - Verificar se trigger está funcionando

### Toast de loading não aparece

**Sintomas:**
- Clica em "Marcar como Concluída"
- Não aparece feedback visual
- Console mostra "Modern toast not initialized"

**Soluções:**
1. Verificar que `ToastModernProvider` está no `App.tsx`
2. Verificar import correto de `showModernLoading`
3. Recarregar aplicação

### Progresso do curso não atualiza

**Sintomas:**
- Aula marcada como concluída
- Progresso do curso continua igual

**Diagnóstico:**
```sql
-- Verificar aulas concluídas do curso
SELECT 
  l.title,
  p.progress_percentage,
  p.completed_at
FROM learning_progress p
JOIN learning_lessons l ON p.lesson_id = l.id
WHERE l.module_id IN (
  SELECT id FROM learning_modules WHERE course_id = '<course_id>'
)
AND p.user_id = '<user_id>'
ORDER BY l.order_index;
```

**Soluções:**
- Verificar que cache foi invalidado (procurar por `[LESSON-PROGRESS] 🔄 Caches invalidados` no console)
- Forçar refresh: recarregar página
- Verificar cálculo em `useCourseStats.ts` usa `>= 100` e não `=== 100`

### Retry automático não funciona

**Sintomas:**
- Erro ao salvar
- Não tenta novamente automaticamente

**Diagnóstico:**
1. Console: verificar `[LESSON-CONTENT] 🔄 Retry`
2. Verificar se já atingiu MAX_RETRIES (2)

**Soluções:**
- Sistema tenta automaticamente até 2 vezes
- Se falhar 2 vezes, usuário precisa clicar novamente manualmente
- Verificar conexão de rede (DevTools > Network > Offline)

## Queries de Monitoramento

Ver arquivo: `docs/lesson-progress-monitoring.sql`

### Principais queries:

1. **Conclusões recentes (última hora)**
2. **Estados inconsistentes**
3. **Progresso por usuário**
4. **Estatísticas do curso**
5. **Performance de conclusões**

## 🔧 Utilitários Disponíveis

### `lessonProgressUtils.ts`

```typescript
import { 
  LESSON_PROGRESS, 
  isLessonCompleted,
  calculateCourseProgress 
} from '@/utils/lessonProgressUtils';

// Verificar se aula está concluída
const completed = isLessonCompleted(progress.progress_percentage);

// Calcular progresso do curso
const courseProgress = calculateCourseProgress(allLessonIds, userProgress);
```

## 🎨 Componentes

### `useLessonProgress` Hook

```typescript
const { 
  isCompleted,      // Boolean: aula concluída?
  progress,         // Number: 0, 5, ou 100
  completeLesson,   // Function: marcar como concluída (async)
  isUpdating        // Boolean: salvando progresso?
} = useLessonProgress({ lessonId });
```

### Uso em Componentes

```typescript
const handleComplete = async () => {
  try {
    await completeLesson(); // Aguarda salvamento
    // Sucesso: toast exibido automaticamente
    setModalOpen(true); // Modal só abre se salvou
  } catch (error) {
    // Erro: toast exibido automaticamente
    // Modal NÃO abre
  }
};
```

## 🐛 Troubleshooting

### Problema: "Aula não marca como concluída"

**Verificar:**
1. Console do navegador para erros
2. Query de monitoramento (ver abaixo)
3. Logs do Supabase

### Problema: "Progresso do curso incorreto"

**Verificar:**
1. Se está usando `>= 100` (não `=== 100`)
2. Se cache foi invalidado
3. Query de dados inconsistentes

## 📊 Queries de Monitoramento

### Verificar Estados Inconsistentes

```sql
-- Deve retornar 0 registros (indica integridade OK)
SELECT 
  user_id,
  lesson_id,
  progress_percentage,
  completed_at,
  CASE 
    WHEN progress_percentage >= 100 AND completed_at IS NULL 
      THEN 'BUG: Concluída sem data'
    WHEN progress_percentage < 100 AND completed_at IS NOT NULL 
      THEN 'BUG: Não concluída com data'
    ELSE 'OK'
  END as status
FROM learning_progress
WHERE 
  (progress_percentage >= 100 AND completed_at IS NULL)
  OR
  (progress_percentage < 100 AND completed_at IS NOT NULL);
```

### Progresso de um Usuário Específico

```sql
SELECT 
  lp.progress_percentage,
  lp.completed_at,
  lp.updated_at,
  ll.title as lesson_title,
  lm.title as module_title,
  lc.title as course_title
FROM learning_progress lp
JOIN learning_lessons ll ON lp.lesson_id = ll.id
JOIN learning_modules lm ON ll.module_id = lm.id
JOIN learning_courses lc ON lm.course_id = lc.id
WHERE lp.user_id = 'USER_ID_HERE'
ORDER BY lc.created_at, lm.order_index, ll.order_index;
```

### Estatísticas de Conclusão

```sql
SELECT 
  lc.title as curso,
  COUNT(DISTINCT ll.id) as total_aulas,
  COUNT(DISTINCT CASE WHEN lp.progress_percentage >= 100 THEN ll.id END) as aulas_concluidas,
  ROUND(
    COUNT(DISTINCT CASE WHEN lp.progress_percentage >= 100 THEN ll.id END) * 100.0 / 
    NULLIF(COUNT(DISTINCT ll.id), 0),
    2
  ) as percentual_conclusao
FROM learning_courses lc
LEFT JOIN learning_modules lm ON lc.id = lm.course_id
LEFT JOIN learning_lessons ll ON lm.id = ll.module_id
LEFT JOIN learning_progress lp ON ll.id = lp.lesson_id 
  AND lp.user_id = 'USER_ID_HERE'
GROUP BY lc.id, lc.title
ORDER BY lc.created_at;
```

## ✅ Checklist de Validação

Após implementação, validar:

- [ ] Aula marca como concluída ao clicar no botão
- [ ] Toast de loading aparece
- [ ] Toast de sucesso aparece após salvamento
- [ ] Modal de NPS abre APENAS após salvamento bem-sucedido
- [ ] Progresso do curso atualiza corretamente
- [ ] Sidebar mostra aula como concluída (ícone verde)
- [ ] Query de monitoramento retorna 0 inconsistências
- [ ] Retry automático funciona em caso de erro
- [ ] Toast de erro aparece se falhar após retries

## 📚 Referências

- **Hook Principal:** `src/hooks/learning/useLessonProgress.ts`
- **Utilitários:** `src/utils/lessonProgressUtils.ts`
- **Componente de Navegação:** `src/components/learning/member/LessonNavigationBar.tsx`
- **Toasts:** `src/lib/toast-helpers.ts`
