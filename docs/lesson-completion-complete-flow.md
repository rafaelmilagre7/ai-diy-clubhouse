# Fluxo Completo de Conclusão de Aula

## 📋 Visão Geral

Este documento descreve o fluxo completo e refatorado para marcar uma aula como concluída, incluindo avaliação NPS e atualização de progresso.

## 🎯 Objetivo

Quando o usuário clica em "Marcar como Concluída":
1. ✅ Aula é salva como concluída no banco de dados
2. ✅ Modal NPS abre automaticamente
3. ✅ Usuário avalia a aula (nota + comentário opcional)
4. ✅ Avaliação é salva no banco
5. ✅ Progresso do curso é atualizado
6. ✅ Usuário vê confirmações visuais em cada etapa
7. ✅ Sistema navega para próxima aula (se houver)

---

## 🔄 Fluxo Detalhado

### **PASSO 1: Clique no Botão**

**Arquivo:** `src/components/learning/member/LessonNavigationBar.tsx`

```typescript
<Button onClick={onComplete} disabled={isUpdating || isCompleted}>
  Marcar como Concluída
</Button>
```

**Log:** Nenhum (é apenas UI)

---

### **PASSO 2: Handler do Componente**

**Arquivo:** `src/components/learning/member/LessonContent.tsx`

```typescript
const handleCompleteLesson = async () => {
  console.log('[LESSON-CONTENT] 🎯 Solicitando conclusão da aula');
  await onComplete(); // Chama o hook
  console.log('[LESSON-CONTENT] ✅ Conclusão bem-sucedida - abrindo modal NPS');
  setCompletionDialogOpen(true); // Abre modal NPS
}
```

**Logs esperados:**
```
[LESSON-CONTENT] 🎯 Solicitando conclusão da aula
[LESSON-CONTENT] ✅ Conclusão bem-sucedida - abrindo modal NPS
```

---

### **PASSO 3: Hook de Progresso**

**Arquivo:** `src/hooks/learning/useLessonProgress.ts`

```typescript
const completeLesson = async (): Promise<void> => {
  console.log("[LESSON-PROGRESS] 🎯 Iniciando conclusão da aula");
  
  const loadingId = showModernLoading("Concluindo aula...");
  
  try {
    await updateProgressMutation.mutateAsync(true);
    dismissModernToast(loadingId);
    console.log("[LESSON-PROGRESS] ✅ Aula concluída - retornando sucesso");
  } catch (error) {
    dismissModernToast(loadingId);
    console.error("[LESSON-PROGRESS] ❌ Erro ao concluir:", error);
    showModernError("Erro ao concluir aula", errorMessage);
    throw error;
  }
}
```

**Toasts exibidos:**
1. 🔵 Loading: "Concluindo aula..."
2. ✅ Sucesso: (nenhum aqui, sucesso é no mutation)
3. ❌ Erro: "Erro ao concluir aula" (se falhar)

**Logs esperados:**
```
[LESSON-PROGRESS] 🎯 Iniciando conclusão da aula
[LESSON-PROGRESS] 🎯 Salvando progresso: { lessonId, completed: true }
[LESSON-PROGRESS] ✅ Progresso salvo com sucesso
[LESSON-PROGRESS] ✅ Aula concluída - retornando sucesso
```

---

### **PASSO 4: Salvamento no Banco**

**Arquivo:** `src/hooks/learning/useLessonProgress.ts` (mutation)

```typescript
const updateProgressMutation = useMutation({
  mutationFn: async (completed: boolean) => {
    const { data, error } = await supabase
      .from("learning_progress")
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        progress_percentage: completed ? 100 : 5,
        completed_at: completed ? timestamp : null,
        ...
      })
      .select()
      .single();
      
    if (error) throw error;
    return { ...data, completed };
  },
  onSuccess: async (result) => {
    setIsCompleted(result.completed);
    // Invalidar caches relacionados
    await queryClient.invalidateQueries({ queryKey: ["learning-lesson-progress"] });
    await queryClient.invalidateQueries({ queryKey: ["course-details"] });
  }
})
```

**Tabela atualizada:** `learning_progress`

**Campos atualizados:**
- `progress_percentage` = 100
- `completed_at` = timestamp atual
- `updated_at` = timestamp atual

**Trigger automático:** `ensure_completed_at_consistency` garante consistência

---

### **PASSO 5: Modal NPS Abre**

**Arquivo:** `src/components/learning/completion/LessonCompletionModal.tsx`

```typescript
<LessonCompletionModal
  isOpen={completionDialogOpen}
  setIsOpen={setCompletionDialogOpen}
  lesson={lesson}
  onNext={handleNavigateToNext}
  nextLesson={nextLesson}
/>
```

**UI exibida:**
- 🎉 Ícone de celebração
- 📝 Título: "Parabéns!"
- 📄 Descrição: "Você concluiu a aula [nome]"
- 📊 Formulário NPS (dentro do modal)

---

### **PASSO 6: Usuário Avalia (NPS)**

**Arquivo:** `src/components/learning/nps/LessonNPSForm.tsx`

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('[LESSON-NPS-FORM] 🎯 Enviando avaliação:', { score, hasFeedback });
  
  submitNPS(score, feedback); // Envia para o banco
  
  if (onCompleted) {
    console.log('[LESSON-NPS-FORM] ✅ Chamando onCompleted');
    onCompleted(); // Chama callback do modal
  }
}
```

**Logs esperados:**
```
[LESSON-NPS-FORM] 🎯 Enviando avaliação: { score: 9, hasFeedback: true }
[LESSON-NPS] 🎯 Enviando NPS: { score: 9, feedback: "Ótima aula..." }
[LESSON-NPS] ✅ NPS salvo com sucesso
[LESSON-NPS] ✅ Mutation onSuccess
[LESSON-NPS-FORM] ✅ Chamando onCompleted
```

---

### **PASSO 7: Salvamento do NPS**

**Arquivo:** `src/hooks/learning/useLessonNPS.ts`

```typescript
const submitNPSMutation = useMutation({
  mutationFn: async ({ score, feedback }) => {
    const { data, error } = await supabase
      .from('learning_lesson_nps')
      .insert({
        lesson_id: lessonId,
        user_id: user.id,
        score,
        feedback: feedback || null
      })
      .select()
      .single();
      
    if (error) throw error;
    console.log('[LESSON-NPS] ✅ NPS salvo com sucesso:', data);
    return data;
  },
  onSuccess: () => {
    console.log('[LESSON-NPS] ✅ Mutation onSuccess');
    toast.success('Sua avaliação foi enviada com sucesso!');
  }
})
```

**Tabela atualizada:** `learning_lesson_nps`

**Campos inseridos:**
- `lesson_id`
- `user_id`
- `score` (0-10)
- `feedback` (opcional)
- `created_at` (automático)

**Toast exibido:** ✅ "Sua avaliação foi enviada com sucesso!"

---

### **PASSO 8: Feedback Visual e Navegação**

**Arquivo:** `src/components/learning/completion/LessonCompletionModal.tsx`

```typescript
const handleNPSCompleted = () => {
  console.log('[LESSON-COMPLETION-MODAL] ✅ NPS enviado com sucesso');
  setNpsSubmitted(true); // Muda UI para mensagem de sucesso
  
  setTimeout(() => {
    console.log('[LESSON-COMPLETION-MODAL] 🔄 Fechando modal e navegando');
    setIsOpen(false);
    if (onNext && nextLesson) {
      onNext(); // Navega para próxima aula
    }
  }, 1500);
}
```

**UI atualizada:**
- ✅ Ícone de check animado
- 📝 Mensagem: "Avaliação enviada com sucesso!"
- 🔄 "Redirecionando para a próxima aula..."

**Logs esperados:**
```
[LESSON-COMPLETION-MODAL] ✅ NPS enviado com sucesso
[LESSON-COMPLETION-MODAL] 🔄 Fechando modal e navegando
```

---

## 📊 Resumo de Estados

### **Estados do Botão "Marcar como Concluída"**

1. **Normal** (não concluída):
   - Texto: "Marcar como Concluída"
   - Ícone: CheckCircle
   - Cor: Primary gradient
   - Habilitado: ✅

2. **Salvando** (`isUpdating = true`):
   - Texto: "Salvando..."
   - Ícone: Loader2 (girando)
   - Cor: Primary opacity 70%
   - Habilitado: ❌

3. **Concluída** (`isCompleted = true`):
   - Texto: "Aula Concluída"
   - Ícone: CheckCircle
   - Cor: Verde operacional
   - Habilitado: ❌

---

## 🗄️ Tabelas Afetadas

### 1. `learning_progress`

**Operação:** UPSERT

**Campos:**
```sql
{
  user_id: UUID,
  lesson_id: UUID,
  progress_percentage: 100,
  completed_at: TIMESTAMP,
  updated_at: TIMESTAMP,
  started_at: TIMESTAMP (mantém original),
  last_position_seconds: NUMBER (mantém),
  video_progress: JSONB (mantém)
}
```

**Constraint removida:** `check_completed_consistency` (estava bloqueando updates)

**Trigger ativo:** `ensure_completed_at_consistency`
- Garante que se `progress_percentage >= 100`, então `completed_at` é preenchido
- Garante que se `progress_percentage < 100`, então `completed_at` é NULL

---

### 2. `learning_lesson_nps`

**Operação:** INSERT (ou UPDATE se já existir)

**Campos:**
```sql
{
  id: UUID (auto),
  lesson_id: UUID,
  user_id: UUID,
  score: INTEGER (0-10),
  feedback: TEXT (nullable),
  created_at: TIMESTAMP (auto),
  updated_at: TIMESTAMP (auto)
}
```

**Constraint:** Unique(lesson_id, user_id) - um NPS por usuário por aula

---

## 🔍 Como Debugar

### **1. Console Logs**

Buscar por esses prefixos no console:
- `[LESSON-CONTENT]` - Fluxo no componente
- `[LESSON-PROGRESS]` - Hook de progresso
- `[LESSON-NPS-FORM]` - Formulário NPS
- `[LESSON-NPS]` - Hook NPS
- `[LESSON-COMPLETION-MODAL]` - Modal de conclusão

### **2. Queries SQL para Validação**

**Verificar se aula foi marcada como concluída:**
```sql
SELECT 
  lp.lesson_id,
  ll.title,
  lp.progress_percentage,
  lp.completed_at,
  lp.updated_at
FROM learning_progress lp
JOIN learning_lessons ll ON lp.lesson_id = ll.id
WHERE lp.user_id = '[USER_ID]'
  AND lp.lesson_id = '[LESSON_ID]'
```

**Verificar se NPS foi salvo:**
```sql
SELECT 
  nps.lesson_id,
  ll.title,
  nps.score,
  nps.feedback,
  nps.created_at
FROM learning_lesson_nps nps
JOIN learning_lessons ll ON nps.lesson_id = ll.id
WHERE nps.user_id = '[USER_ID]'
  AND nps.lesson_id = '[LESSON_ID]'
```

**Verificar progresso do curso:**
```sql
SELECT 
  c.title as course_title,
  COUNT(DISTINCT ll.id) as total_lessons,
  COUNT(DISTINCT CASE WHEN lp.progress_percentage >= 100 THEN ll.id END) as completed_lessons,
  ROUND(
    (COUNT(DISTINCT CASE WHEN lp.progress_percentage >= 100 THEN ll.id END)::numeric / 
     COUNT(DISTINCT ll.id)::numeric) * 100, 
    2
  ) as progress_percentage
FROM learning_courses c
JOIN learning_modules lm ON lm.course_id = c.id
JOIN learning_lessons ll ON ll.module_id = lm.id
LEFT JOIN learning_progress lp ON lp.lesson_id = ll.id AND lp.user_id = '[USER_ID]'
WHERE c.id = '[COURSE_ID]'
GROUP BY c.id, c.title
```

---

## ⚠️ Problemas Comuns

### **Problema 1: Modal não abre**

**Causa:** `completeLesson` não retorna Promise resolvida

**Solução:** Verificar que:
1. ✅ `completeLesson` é `async` e retorna `Promise<void>`
2. ✅ `await onComplete()` está aguardando corretamente
3. ✅ Não há `throw` não tratado no hook

**Log esperado antes do modal abrir:**
```
[LESSON-CONTENT] ✅ Conclusão bem-sucedida - abrindo modal NPS
```

---

### **Problema 2: Aula não salva no banco**

**Causa:** Erro na mutation ou constraint violada

**Logs para verificar:**
```
[LESSON-PROGRESS] ❌ Erro ao concluir: [mensagem]
```

**Verificar:**
1. ✅ Usuário está autenticado
2. ✅ `lessonId` é válido
3. ✅ Trigger `ensure_completed_at_consistency` está ativo
4. ✅ Constraint `check_completed_consistency` foi removida

---

### **Problema 3: NPS não salva**

**Causa:** Rate limit ou usuário já avaliou

**Logs para verificar:**
```
[LESSON-NPS] ❌ Erro ao enviar avaliação: [mensagem]
```

**Toast exibido:** ❌ "Erro: [mensagem]"

**Verificar:**
1. ✅ Função `check_nps_rate_limit` existe
2. ✅ Usuário não enviou NPS hoje
3. ✅ Unique constraint não está violada

---

### **Problema 4: Progresso não atualiza na UI**

**Causa:** Cache não foi invalidado

**Solução:** Verificar que esses queries foram invalidados:
```typescript
await queryClient.invalidateQueries({ queryKey: ["learning-lesson-progress"] });
await queryClient.invalidateQueries({ queryKey: ["learning-user-progress"] });
await queryClient.invalidateQueries({ queryKey: ["course-details"] });
```

---

## ✅ Checklist de Validação

Após clicar em "Marcar como Concluída", validar:

- [ ] 1. Toast "Concluindo aula..." aparece
- [ ] 2. Toast desaparece após salvamento
- [ ] 3. Modal NPS abre automaticamente
- [ ] 4. Consegue selecionar nota (0-10)
- [ ] 5. Campo de feedback aparece após selecionar nota
- [ ] 6. Botão "Enviar avaliação" fica habilitado
- [ ] 7. Ao clicar, toast "Enviando avaliação..." aparece
- [ ] 8. Toast de sucesso "Sua avaliação foi enviada" aparece
- [ ] 9. Modal mostra "Avaliação enviada com sucesso!"
- [ ] 10. Após 1.5s, modal fecha e navega para próxima aula
- [ ] 11. Botão "Marcar como Concluída" fica verde e desabilitado
- [ ] 12. Progresso do curso atualiza (ex: 1/10 → 2/10)
- [ ] 13. No banco: `progress_percentage = 100` e `completed_at` preenchido
- [ ] 14. No banco: registro em `learning_lesson_nps` criado

---

## 🎨 Feedback Visual

### **Toasts:**
1. 🔵 Loading: "Concluindo aula..."
2. ✅ Sucesso NPS: "Sua avaliação foi enviada com sucesso!"
3. ❌ Erro: "Erro ao concluir aula" ou "Erro: [mensagem]"

### **Modal:**
1. 🎉 Header com animação de celebração
2. 📝 "Parabéns! Você concluiu a aula [nome]"
3. 📊 Formulário NPS limpo e intuitivo
4. ✅ Mensagem de sucesso após envio
5. 🔄 Redirecionamento automático

### **Botão:**
1. Normal: Gradient azul vibrante
2. Salvando: Opacity 70% + spinner
3. Concluída: Verde operacional + check

---

## 📚 Arquivos Envolvidos

1. **UI/Componentes:**
   - `LessonNavigationBar.tsx` - Botão principal
   - `LessonContent.tsx` - Handler de conclusão
   - `LessonCompletionModal.tsx` - Modal de NPS
   - `LessonNPSForm.tsx` - Formulário de avaliação

2. **Lógica/Hooks:**
   - `useLessonProgress.ts` - Gerencia progresso
   - `useLessonNPS.ts` - Gerencia NPS

3. **Utilitários:**
   - `toast-helpers.ts` - Toasts modernos
   - `lessonProgressLogger.ts` - Logging estruturado

4. **Banco de Dados:**
   - Tabela: `learning_progress`
   - Tabela: `learning_lesson_nps`
   - Trigger: `ensure_completed_at_consistency`

---

## 🚀 Melhorias Futuras

- [ ] Adicionar animação confetti ao abrir modal
- [ ] Permitir pular avaliação NPS (opcional)
- [ ] Mostrar conquistas/badges ao completar aulas
- [ ] Analytics detalhado de conclusão
- [ ] Retry automático com exponential backoff
- [ ] Offline support com sync quando voltar online

---

**Última atualização:** 2025-10-29
**Versão:** 2.0 (Refatorado completo)
