# 🎮 Fase 3: Notificações de Gamificação

## Visão Geral

A Fase 3 implementa notificações focadas em engajamento e gamificação, com marcos de conquista, lembretes inteligentes e celebrações de aniversários.

## 📊 Tipos de Notificações Implementadas

### 1. Marcos de Popularidade - Sugestões (suggestion_milestone)

**Trigger:** Quando sugestão atinge marcos de votos
**Prioridade:** Alta
**Ícone:** 🎯

**Marcos:**
- 10 votos
- 25 votos
- 50 votos
- 100+ votos

**Implementação:**
```sql
-- Trigger automático em suggestions.upvotes
CREATE TRIGGER trigger_suggestion_milestones
AFTER UPDATE OF upvotes ON public.suggestions
FOR EACH ROW
WHEN (NEW.upvotes > OLD.upvotes)
EXECUTE FUNCTION notify_suggestion_milestones();
```

**Tabela de Controle:** `suggestion_milestone_notifications`
- Previne notificações duplicadas
- Rastreia marcos já atingidos por sugestão

**Payload da Notificação:**
```json
{
  "milestone": "50_upvotes",
  "upvotes": 50,
  "title": "Título da sugestão"
}
```

### 2. Marcos de Popularidade - Tópicos (topic_milestone)

**Trigger:** Quando tópico atinge marcos de visualizações/respostas
**Prioridade:** Média
**Ícone:** 👥

**Marcos:**
- 50 visualizações
- 100 visualizações
- 10 respostas
- 25 respostas

**Implementação:**
```sql
-- Trigger automático em community_topics
CREATE TRIGGER trigger_topic_milestones
AFTER UPDATE OF views_count, replies_count ON public.community_topics
FOR EACH ROW
EXECUTE FUNCTION notify_topic_milestones();
```

**Tabela de Controle:** `topic_milestone_notifications`

**Payload da Notificação:**
```json
{
  "milestone": "100_views",
  "count": 100,
  "title": "Título do tópico"
}
```

### 3. Lembretes de Cursos Inacabados (course_reminder)

**Trigger:** Edge Function diária (09:00)
**Prioridade:** Baixa
**Ícone:** 📚

**Critérios:**
- Curso com `is_completed = false`
- Inativo há 7+ dias
- Não notificado nos últimos 14 dias

**Edge Function:** `process-course-reminders`
**Cron:** Diário às 09:00
```sql
SELECT cron.schedule(
  'process-course-reminders-daily',
  '0 9 * * *',
  ...
);
```

**Tabela de Controle:** `course_reminder_sent`
- UNIQUE(user_id, course_id)
- Previne spam de notificações

**Payload da Notificação:**
```json
{
  "title": "Nome do curso",
  "days_inactive": 10
}
```

**Limite:** Processa até 100 usuários por execução para performance

### 4. Lembretes de Soluções Inacabadas (solution_reminder)

**Trigger:** Edge Function diária (10:00)
**Prioridade:** Baixa
**Ícone:** 💡

**Critérios:**
- Solução com `is_completed = false`
- Inativa há 5+ dias
- Não notificada nos últimos 10 dias

**Edge Function:** `process-solution-reminders`
**Cron:** Diário às 10:00

**Tabela de Controle:** `solution_reminder_sent`

**Payload da Notificação:**
```json
{
  "title": "Nome da solução",
  "days_inactive": 7
}
```

### 5. Aniversários de Conexão (connection_anniversary)

**Trigger:** Edge Function diária (08:00)
**Prioridade:** Alta
**Ícone:** 🎉

**Marcos Celebrados:**
- 1 mês
- 3 meses
- 6 meses
- 1 ano
- 2 anos
- 3+ anos (a cada ano)

**Cálculo:**
```typescript
const months = Math.floor(days_connected / 30);
```

**Edge Function:** `process-connection-anniversaries`
**Cron:** Diário às 08:00

**Tabela de Controle:** `anniversary_notifications_sent`
- UNIQUE(user_id, milestone_type)
- Garante que cada marco é celebrado apenas uma vez

**Payload da Notificação:**
```json
{
  "milestone": "1_year",
  "months": 12,
  "days": 365
}
```

**Limite:** Processa até 500 usuários por execução

## 🎨 Design System

### Cores (Semantic Tokens)
```css
/* index.css */
--primary: [cor principal - conquistas]
--muted-foreground: [texto secundário - lembretes]
--accent: [destaque - aniversários]
```

### Ícones
- 🎯 Sugestão popular
- 👥 Tópico popular
- 📚 Curso inacabado
- 💡 Solução inacabada
- 🎉 Aniversário

### Animações
```css
/* Conquistas importantes */
.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}

@keyframes scale-in {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
```

### Toast Notifications
- **Alta prioridade:** `toast.success()` (conquistas, aniversários)
- **Baixa prioridade:** `toast.info()` (lembretes)

## 📈 Monitoramento

### View de Estatísticas
```sql
SELECT * FROM admin_gamification_stats;
```

Retorna:
- Total de notificações por tipo
- Itens únicos notificados
- Último envio
- Breakdown por marco

### Health Check
```typescript
// Dashboard Admin
<NotificationHealthMonitor />
```

Monitora:
- Notificações pendentes por tipo
- Taxa de engajamento
- Performance dos lembretes

## 🔧 Configuração

### 1. Executar Migration
```bash
# Automático via Lovable
supabase/migrations/20251020120000_phase3_gamification_notifications.sql
```

### 2. Verificar Cron Jobs
```sql
SELECT * FROM cron.job;
```

Deve mostrar:
- `process-course-reminders-daily` (09:00)
- `process-solution-reminders-daily` (10:00)
- `process-connection-anniversaries-daily` (08:00)

### 3. Testar Edge Functions

**Manualmente:**
```bash
curl -X POST https://[PROJECT_ID].supabase.co/functions/v1/process-course-reminders \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]"
```

**Via Dashboard:**
```sql
SELECT process_course_reminders();
SELECT process_solution_reminders();
SELECT process_connection_anniversaries();
```

## 🎯 Performance

### Otimizações Implementadas

1. **Índices Estratégicos:**
```sql
-- Cursos inacabados
CREATE INDEX idx_learning_progress_incomplete 
ON learning_progress(user_id, course_id, updated_at)
WHERE is_completed = false;

-- Soluções inacabadas
CREATE INDEX idx_progress_incomplete 
ON progress(user_id, solution_id, updated_at)
WHERE is_completed = false;

-- Aniversários
CREATE INDEX idx_profiles_created_at 
ON profiles(created_at)
WHERE created_at IS NOT NULL;
```

2. **Batch Processing:**
- Limite de 100 registros por execução (lembretes)
- Limite de 500 registros por execução (aniversários)

3. **Deduplicação:**
- Tabelas de controle com UNIQUE constraints
- EXISTS checks antes de criar notificações

## 🧪 Testes

### Teste Manual de Marcos

```sql
-- Testar marco de sugestão
UPDATE suggestions 
SET upvotes = 10 
WHERE id = '[SUGGESTION_ID]';

-- Verificar notificação criada
SELECT * FROM notifications 
WHERE type = 'suggestion_milestone' 
ORDER BY created_at DESC 
LIMIT 1;
```

### Teste Manual de Lembretes

```sql
-- Simular curso inativo
UPDATE learning_progress 
SET updated_at = now() - INTERVAL '10 days'
WHERE user_id = '[USER_ID]';

-- Processar lembretes
SELECT process_course_reminders();

-- Verificar notificação
SELECT * FROM notifications 
WHERE type = 'course_reminder' 
AND user_id = '[USER_ID]';
```

### Teste Manual de Aniversário

```sql
-- Simular perfil de 1 mês
UPDATE profiles 
SET created_at = now() - INTERVAL '30 days'
WHERE id = '[USER_ID]';

-- Processar aniversários
SELECT process_connection_anniversaries();

-- Verificar notificação
SELECT * FROM notifications 
WHERE type = 'connection_anniversary' 
AND user_id = '[USER_ID]';
```

## 🚀 Próximos Passos

1. **Análise de Engajamento:**
   - Taxa de retorno após lembretes
   - Impacto de marcos na retenção
   - Efetividade de aniversários

2. **Otimizações Futuras:**
   - Machine Learning para timing de lembretes
   - Personalização de frequência
   - A/B testing de mensagens

3. **Gamificação Avançada:**
   - Badges por conquistas
   - Leaderboards
   - Desafios semanais

## 📝 Notas Técnicas

- **RLS:** Todas as tabelas de controle têm RLS habilitado
- **SECURITY DEFINER:** Funções executam com permissões elevadas
- **Idempotência:** Sistema previne notificações duplicadas via controles
- **Logging:** Edge Functions logam todas operações para debugging
- **Rollback:** Migrations podem ser revertidas se necessário

## 🔗 Links Úteis

- [Edge Function Logs - Course Reminders](https://supabase.com/dashboard/project/zotzvtepvpnkcoobdubt/functions/process-course-reminders/logs)
- [Edge Function Logs - Solution Reminders](https://supabase.com/dashboard/project/zotzvtepvpnkcoobdubt/functions/process-solution-reminders/logs)
- [Edge Function Logs - Anniversaries](https://supabase.com/dashboard/project/zotzvtepvpnkcoobdubt/functions/process-connection-anniversaries/logs)
- [Cron Jobs Dashboard](https://supabase.com/dashboard/project/zotzvtepvpnkcoobdubt/database/cron-jobs)
