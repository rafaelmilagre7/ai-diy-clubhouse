# Fase 2 - Sistema de Notificações de Engagement

## Implementação Completa ✅

### Notificações Implementadas

1. **📂 Novo Módulo em Curso Inscrito** - Automático via trigger
2. **📢 Comentário Oficial em Sugestão** - Automático via trigger (quando admin comenta)
3. **👤 Menção na Comunidade** - Automático via trigger (quando usa @username)
4. **🎖️ Certificado Disponível** - Automático via trigger
5. **📅 Lembretes de Eventos** - Semi-automático via cron job

---

## Configuração de Lembretes de Eventos

### Edge Function: `process-event-reminders`

A função foi criada em `supabase/functions/process-event-reminders/index.ts` e está configurada no `supabase/config.toml`.

### Como Funciona

1. Quando um evento é criado, triggers automáticos criam lembretes para todos os usuários
2. A edge function `process-event-reminders` processa lembretes pendentes e envia notificações
3. Lembretes são enviados em dois momentos:
   - **24 horas antes** do evento (prioridade normal)
   - **1 hora antes** do evento (prioridade alta)

### Configuração do Cron Job (Recomendado)

**Opção 1: Supabase Platform Cron (Recomendado)**

No dashboard do Supabase, vá em:
1. Database → Cron Jobs
2. Clique em "New Cron Job"
3. Configure:

```sql
-- Nome: Process Event Reminders
-- Intervalo: Every 15 minutes (*/15 * * * *)
-- Comando:
SELECT net.http_post(
  url := 'https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/process-event-reminders',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
  body := '{}'::jsonb
);
```

**Opção 2: GitHub Actions (Alternativa)**

Criar workflow em `.github/workflows/process-reminders.yml`:

```yaml
name: Process Event Reminders

on:
  schedule:
    # Executar a cada 15 minutos
    - cron: '*/15 * * * *'

jobs:
  process-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST \
            'https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/process-event-reminders' \
            -H 'Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}' \
            -H 'Content-Type: application/json'
```

**Opção 3: Vercel Cron (Se hospedar no Vercel)**

Criar endpoint em `pages/api/cron/process-reminders.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verificar secret do cron
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const response = await fetch(
    'https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/process-event-reminders',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const data = await response.json();
  res.status(200).json(data);
}
```

E adicionar em `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/process-reminders",
    "schedule": "*/15 * * * *"
  }]
}
```

---

## Teste Manual

Para testar manualmente a função de lembretes:

```bash
# Via curl
curl -X POST \
  'https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/process-event-reminders' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'

# Via Supabase SQL Editor
SELECT process_event_reminders();
```

---

## Monitoramento

### Logs da Edge Function

Acesse os logs em:
https://supabase.com/dashboard/project/zotzvtepvpnkcoobdubt/functions/process-event-reminders/logs

### Verificar Lembretes Pendentes

```sql
-- Ver lembretes ainda não enviados
SELECT er.*, e.title, e.start_time
FROM event_reminders er
JOIN events e ON e.id = er.event_id
WHERE er.sent_at IS NULL
ORDER BY e.start_time;

-- Ver estatísticas de lembretes
SELECT 
  reminder_type,
  COUNT(*) as total,
  COUNT(sent_at) as sent,
  COUNT(*) - COUNT(sent_at) as pending
FROM event_reminders
GROUP BY reminder_type;
```

---

## Recursos do Design System

Todas as notificações seguem o Design System:

- **Ícones**: Cada tipo tem emoji específico (📂, 📢, 👤, 🎖️, 📅, ⏰)
- **Cores**: Usando tokens semânticos (`aurora-primary`, `status-error`, etc.)
- **Animações**: `animate-pulse-subtle`, `animate-scale-in`, `shadow-glow`
- **Agrupamento**: Notificações similares são agrupadas automaticamente
- **Sons**: Som de notificação para eventos importantes
- **Toasts**: Feedback visual com ações rápidas

---

## Próximos Passos

**Fase 3 - Gamificação (Opcional)**:
- Milestone de popularidade em tópico
- Threshold de votos em sugestão
- Lembrete de curso não finalizado
- Aniversário de conexão

**Melhorias Futuras**:
- Preferências de usuário (quais notificações receber)
- Digest diário/semanal por email
- Centro de notificações completo (página dedicada)
- Analytics de engajamento com notificações
