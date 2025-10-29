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

### Tabela `learning_progress`

```sql
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  lesson_id UUID NOT NULL REFERENCES learning_lessons,
  progress_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  
  -- Constraint de consistência
  CONSTRAINT check_completed_consistency CHECK (
    (progress_percentage >= 100 AND completed_at IS NOT NULL) OR
    (progress_percentage < 100 AND completed_at IS NULL)
  ),
  
  -- Índices otimizados
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_learning_progress_completion 
ON learning_progress(user_id, progress_percentage)
WHERE progress_percentage >= 100;
```

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
