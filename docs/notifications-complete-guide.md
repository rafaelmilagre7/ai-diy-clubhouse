# Sistema de Notificações Automáticas - Guia Completo

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Fase 1: Notificações Críticas](#fase-1-notificações-críticas)
- [Fase 2: Notificações de Engagement](#fase-2-notificações-de-engagement)
- [Configuração](#configuração)
- [Monitoramento](#monitoramento)
- [Design System](#design-system)
- [Testes](#testes)

---

## Visão Geral

Sistema completo de notificações automáticas implementado em duas fases, seguindo rigorosamente o Design System da plataforma.

### Tecnologias

- **Backend**: PostgreSQL Triggers + Edge Functions
- **Frontend**: React + TanStack Query + Realtime
- **Design**: Tailwind CSS com tokens semânticos
- **Agendamento**: pg_cron + pg_net

### Características

✅ **Automático**: Triggers no banco detectam eventos e criam notificações  
✅ **Real-time**: WebSocket do Supabase para notificações instantâneas  
✅ **Agrupamento**: Notificações similares são agrupadas automaticamente  
✅ **Som**: Efeito sonoro para notificações importantes  
✅ **Toast**: Feedback visual com ações rápidas  
✅ **Design System**: 100% seguindo tokens semânticos  

---

## Fase 1: Notificações Críticas

### 1. 🎓 Novo Curso Publicado

**Trigger**: `trigger_notify_new_course` em `learning_courses`  
**Quando**: Curso é publicado (`published = true`)  
**Quem recebe**: Todos os usuários  
**Prioridade**: Alta  

```sql
-- Exemplo de dados da notificação
{
  "type": "new_course",
  "title": "🎓 Novo Curso Disponível!",
  "message": "O curso \"Marketing Digital Avançado\" acabou de ser publicado.",
  "category": "learning",
  "priority": "high",
  "action_url": "/learning/courses/[id]",
  "data": {
    "entity_id": "uuid",
    "entity_type": "course",
    "course_title": "Marketing Digital Avançado",
    "preview": "Aprenda estratégias avançadas..."
  }
}
```

### 2. 📚 Nova Aula em Curso Inscrito

**Trigger**: `trigger_notify_new_lesson` em `learning_lessons`  
**Quando**: Nova aula é adicionada a um curso publicado  
**Quem recebe**: Usuários com progresso no curso  
**Prioridade**: Normal  

### 3. 💡 Nova Solução Cadastrada

**Trigger**: `trigger_notify_new_solution` em `solutions`  
**Quando**: Nova solução é cadastrada e ativada  
**Quem recebe**: Todos os usuários  
**Prioridade**: Alta  

### 4. 📋 Mudança de Status em Sugestão

**Trigger**: `trigger_notify_suggestion_status` em `suggestions`  
**Quando**: Status da sugestão muda  
**Quem recebe**: Autor da sugestão  
**Prioridade**: Alta (se "completed" ou "in_development"), Normal (outros)  

**Status disponíveis**:
- `new` → Nova
- `under_review` → Em Análise
- `in_development` → Em Desenvolvimento
- `completed` → Implementada
- `declined` → Recusada

### 5. ✅ Tópico da Comunidade Resolvido

**Trigger**: `trigger_notify_topic_solved` em `community_topics`  
**Quando**: Tópico é marcado como resolvido  
**Quem recebe**: Autor do tópico  
**Prioridade**: Alta  

---

## Fase 2: Notificações de Engagement

### 1. 📂 Novo Módulo em Curso Inscrito

**Trigger**: `trigger_notify_new_module` em `learning_modules`  
**Quando**: Novo módulo é adicionado a um curso publicado  
**Quem recebe**: Usuários com progresso no curso  
**Prioridade**: Normal  

### 2. 📢 Comentário Oficial em Sugestão

**Trigger**: `trigger_notify_official_comment` em `suggestion_comments`  
**Quando**: Admin comenta em uma sugestão  
**Quem recebe**: Autor da sugestão  
**Prioridade**: Alta  

### 3. 👤 Menção na Comunidade

**Trigger**: `trigger_notify_mention` em `community_posts`  
**Quando**: Usuário é mencionado com @username  
**Quem recebe**: Usuário mencionado  
**Prioridade**: Normal  

**Formato**: `@username` no conteúdo do post

### 4. 🎖️ Certificado Disponível

**Trigger**: `trigger_notify_certificate` em `solution_certificates`  
**Quando**: Certificado é gerado para o usuário  
**Quem recebe**: Dono do certificado  
**Prioridade**: Alta  

### 5. 📅⏰ Lembretes de Eventos

**Trigger**: Processado via cron job  
**Quando**: 24h e 1h antes do evento  
**Quem recebe**: Todos os usuários (podem ser personalizados)  
**Prioridade**: Normal (24h) / Alta (1h)  

**Edge Function**: `process-event-reminders`  
**Cron Job**: `process-event-reminders-every-15min`  
**Frequência**: A cada 15 minutos  

---

## Configuração

### 1. Extensões Necessárias

As extensões já foram habilitadas na migration:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
```

### 2. Cron Job

O cron job foi criado automaticamente:

```sql
SELECT cron.schedule(
  'process-event-reminders-every-15min',
  '*/15 * * * *',
  $$ ... $$
);
```

**Verificar status do cron job**:

```sql
SELECT * FROM cron.job WHERE jobname = 'process-event-reminders-every-15min';
```

### 3. Edge Function

Localizada em: `supabase/functions/process-event-reminders/index.ts`

**Teste manual**:

```bash
curl -X POST \
  'https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/process-event-reminders' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

---

## Monitoramento

### Dashboard Admin

Acesse: `/admin` (Dashboard principal)

O componente `NotificationHealthMonitor` mostra:
- Total de notificações
- Notificações não lidas
- Notificações das últimas 24h
- Lembretes de eventos pendentes
- Status do cron job

### Estatísticas Detalhadas

Acesse: `/admin/notifications/stats`

Visualize:
- Notificações por tipo
- Notificações por categoria
- Notificações por prioridade
- Total / Não lidas / Últimas 24h
- Data da última notificação criada

### Queries SQL Úteis

**Ver todas as notificações não lidas**:

```sql
SELECT type, COUNT(*) as count
FROM notifications
WHERE is_read = false
GROUP BY type
ORDER BY count DESC;
```

**Ver lembretes pendentes**:

```sql
SELECT 
  er.reminder_type,
  e.title,
  e.start_time,
  COUNT(*) as pending_count
FROM event_reminders er
JOIN events e ON e.id = er.event_id
WHERE er.sent_at IS NULL
GROUP BY er.reminder_type, e.title, e.start_time
ORDER BY e.start_time;
```

**Verificar saúde do sistema**:

```sql
SELECT get_notifications_health();
```

**Ver logs do cron job**:

```sql
SELECT * 
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'process-event-reminders-every-15min')
ORDER BY start_time DESC
LIMIT 10;
```

---

## Design System

### Cores e Tokens

Todas as notificações seguem o Design System:

| Categoria | Token Principal | Background | Border |
|-----------|----------------|------------|--------|
| Learning | `aurora-primary` | `aurora-primary/10` | `aurora-primary/30` |
| Solutions | `aurora-secondary` | `aurora-secondary/10` | `aurora-secondary/30` |
| Community | `gradient-primary` | `gradient-primary/10` | `gradient-primary/30` |
| Suggestions | `status-info` | `status-info/10` | `status-info/30` |
| Events | `status-warning` | `status-warning/10` | `status-warning/30` |
| Certificates | `status-success` | `status-success/10` | `status-success/30` |
| System | `textSecondary` | `textSecondary/10` | `textSecondary/30` |

### Ícones por Tipo

| Tipo | Ícone | Categoria |
|------|-------|-----------|
| comment_liked | 👍 | Comentários |
| comment_replied | 💬 | Comentários |
| new_course | 🎓 | Learning |
| new_lesson | 📚 | Learning |
| new_module | 📂 | Learning |
| new_solution | 💡 | Soluções |
| suggestion_status_change | 📋 | Sugestões |
| official_suggestion_comment | 📢 | Sugestões |
| topic_solved | ✅ | Comunidade |
| community_reply | 💬 | Comunidade |
| community_mention | 👤 | Comunidade |
| event_reminder_24h | 📅 | Eventos |
| event_reminder_1h | ⏰ | Eventos |
| certificate_available | 🎖️ | Certificados |

### Animações

```css
/* Pulso sutil para notificações não lidas */
.animate-pulse-subtle {
  animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Scale in para novos elementos */
.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}

/* Brilho para elementos importantes */
.shadow-glow-sm {
  box-shadow: 0 0 20px hsl(var(--aurora-primary) / 0.3);
}

/* Heart pop para curtidas */
.animate-heart-pop {
  animation: heart-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

---

## Testes

### 1. Testar Notificação Manualmente

Via SQL (como admin):

```sql
SELECT test_notification_system();

-- Ou para usuário específico
SELECT test_notification_system('user-uuid-here', 'test');
```

Via Interface (como admin):
1. Acesse `/admin`
2. Clique em "🧪 Testar Notificação"
3. Verifique o sino de notificações

### 2. Testar Trigger Específico

**Novo Curso**:

```sql
INSERT INTO learning_courses (title, description, published)
VALUES ('Curso de Teste', 'Descrição do curso', true);
```

**Nova Solução**:

```sql
INSERT INTO solutions (title, description, category, is_active)
VALUES ('Solução de Teste', 'Descrição', 'Marketing', true);
```

**Mudança de Status em Sugestão**:

```sql
UPDATE suggestions
SET status = 'in_development'
WHERE id = 'uuid-da-sugestao';
```

### 3. Testar Lembretes de Eventos

```sql
-- Criar evento para daqui a 1 hora e 5 minutos
INSERT INTO events (title, start_time, end_time, created_by)
VALUES (
  'Evento Teste',
  now() + interval '1 hour 5 minutes',
  now() + interval '2 hours',
  auth.uid()
);

-- Aguardar o cron job processar (máximo 15 minutos)
-- Ou executar manualmente:
SELECT process_event_reminders();
```

### 4. Testar Agrupamento

Criar múltiplas notificações do mesmo tipo rapidamente:

```sql
-- Como service_role ou admin
DO $$
BEGIN
  FOR i IN 1..5 LOOP
    PERFORM create_notification(
      'user-uuid-here',
      'test',
      'Teste de Agrupamento',
      'Notificação ' || i,
      'system',
      'normal',
      NULL,
      '{}'::jsonb
    );
  END LOOP;
END $$;
```

---

## Próximos Passos Sugeridos

### Fase 3: Gamificação (Opcional)

- **Milestone de popularidade**: Tópico atinge X visualizações/respostas
- **Threshold de votos**: Sugestão atinge X votos
- **Lembrete de curso**: Usuário não acessa curso há X dias
- **Aniversário de conexão**: Conexão completa X meses/anos

### Melhorias Futuras

- **Preferências de usuário**: Controle fino de quais notificações receber
- **Digest por email**: Resumo diário/semanal das notificações
- **Centro de notificações**: Página dedicada com histórico completo
- **Analytics**: Dashboard de engajamento com notificações
- **Notificações push**: Web push notifications (PWA)
- **Webhooks**: Notificar sistemas externos

---

## Troubleshooting

### Problema: Cron job não está executando

**Verificar**:

```sql
SELECT * FROM cron.job WHERE jobname = 'process-event-reminders-every-15min';
```

**Se não existir**:

```sql
SELECT cron.schedule(
  'process-event-reminders-every-15min',
  '*/15 * * * *',
  $$...$$
);
```

### Problema: Notificações não aparecem em real-time

1. Verificar se o canal está subscrito no console do navegador
2. Verificar política RLS da tabela `notifications`
3. Verificar se o user_id está correto

### Problema: Edge function retorna erro

**Ver logs**:
https://supabase.com/dashboard/project/zotzvtepvpnkcoobdubt/functions/process-event-reminders/logs

**Testar manualmente**:

```bash
curl -X POST \
  'https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/process-event-reminders' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

---

## Suporte

- **Documentação Técnica**: `docs/notifications-phase2-setup.md`
- **Monitor de Saúde**: `/admin` → NotificationHealthMonitor
- **Estatísticas**: `/admin/notifications/stats`
- **Logs**: Supabase Dashboard → Edge Functions → Logs
