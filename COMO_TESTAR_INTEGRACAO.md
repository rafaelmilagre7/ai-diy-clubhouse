# 🧪 COMO TESTAR A INTEGRAÇÃO RESEND + WEBHOOK

## 📋 FUNÇÃO DE TESTE CRIADA

Criei uma edge function especial **`test-resend-integration`** que:

1. ✅ Envia um email REAL via Resend
2. ✅ Aguarda 15 segundos para webhooks chegarem
3. ✅ Verifica se eventos foram registrados no banco
4. ✅ Gera relatório completo de validação
5. ✅ Limpa os dados de teste automaticamente

**Tudo no backend, sem mexer no frontend!**

---

## 🚀 COMO EXECUTAR O TESTE

### Opção 1: Via Navegador (Mais Fácil)

Abra esta URL no navegador:

```
https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/test-resend-integration
```

### Opção 2: Via cURL (Terminal)

```bash
curl https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/test-resend-integration
```

### Opção 3: Via Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/zotzvtepvpnkcoobdubt/functions/test-resend-integration
2. Clique em "Invoke" ou "Test"
3. Veja o resultado

---

## 📊 O QUE O TESTE FAZ

### Etapas do Teste:

```
1️⃣ Verificar configuração
   └─ RESEND_API_KEY configurado?
   └─ RESEND_WEBHOOK_SECRET configurado?

2️⃣ Criar convite de teste único
   └─ Email: test+[timestamp]@example.com
   └─ Token único para rastreamento

3️⃣ Enviar email via Resend
   └─ Envio real usando Resend API
   └─ Salvar email_id para rastreamento

4️⃣ Aguardar webhooks (15 segundos)
   └─ Tempo para Resend enviar os eventos

5️⃣ Verificar eventos no banco
   └─ Buscar eventos em invite_delivery_events
   └─ Confirmar se webhook funcionou

6️⃣ Limpar dados de teste
   └─ Remover convite e eventos criados
   └─ Deixar tudo limpo
```

---

## ✅ EXEMPLO DE RELATÓRIO DE SUCESSO

```json
{
  "success": true,
  "timestamp": "2025-10-21T22:45:30.123Z",
  "steps": [
    {
      "step": "1. Verificar configuração",
      "status": "success",
      "details": {
        "hasResendKey": true,
        "hasWebhookSecret": true
      },
      "duration": 5
    },
    {
      "step": "2. Criar convite de teste",
      "status": "success",
      "details": {
        "inviteId": "abc-123-def-456",
        "email": "test+1729545930@example.com"
      },
      "duration": 234
    },
    {
      "step": "3. Enviar email via Resend",
      "status": "success",
      "details": {
        "emailId": "re_abc123xyz",
        "recipient": "test+1729545930@example.com"
      },
      "duration": 1456
    },
    {
      "step": "4. Aguardar webhooks (15s)",
      "status": "success",
      "duration": 15000
    },
    {
      "step": "5. Verificar eventos no banco",
      "status": "success",
      "details": {
        "eventsCount": 2,
        "eventTypes": ["sent", "delivered"],
        "events": [
          {
            "type": "sent",
            "timestamp": "2025-10-21T22:45:32Z",
            "emailId": "re_abc123xyz"
          },
          {
            "type": "delivered",
            "timestamp": "2025-10-21T22:45:35Z",
            "emailId": "re_abc123xyz"
          }
        ]
      },
      "duration": 89
    },
    {
      "step": "6. Limpar dados de teste",
      "status": "success",
      "duration": 67
    }
  ],
  "summary": {
    "totalTests": 6,
    "passed": 6,
    "failed": 0,
    "webhookConfigured": true,
    "eventsReceived": ["sent", "delivered"]
  },
  "message": "🎉 SUCESSO! Integração Resend + Webhook funcionando perfeitamente!",
  "recommendations": [
    "✅ Integração funcionando perfeitamente!",
    "✅ Webhook configurado corretamente",
    "✅ Eventos sendo rastreados em tempo real"
  ]
}
```

---

## ⚠️ EXEMPLO DE RELATÓRIO COM FALHA

Se o webhook NÃO estiver configurado:

```json
{
  "success": false,
  "summary": {
    "totalTests": 6,
    "passed": 5,
    "failed": 1,
    "webhookConfigured": true,
    "eventsReceived": []
  },
  "message": "⚠️ ATENÇÃO! Alguns testes falharam. Verifique os detalhes.",
  "recommendations": [
    "⚠️ NENHUM EVENTO recebido - Verifique se o webhook está configurado no Resend",
    "   → URL: https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/resend-webhook",
    "   → Eventos: email.sent, email.delivered, email.opened, etc."
  ]
}
```

---

## 🔍 COMO INTERPRETAR OS RESULTADOS

### ✅ TUDO CERTO se você ver:

```json
{
  "success": true,
  "summary": {
    "passed": 6,
    "failed": 0,
    "eventsReceived": ["sent", "delivered"]
  }
}
```

**Significado:** Webhook está funcionando! Eventos estão sendo rastreados!

---

### ⚠️ PROBLEMA se você ver:

```json
{
  "success": false,
  "summary": {
    "eventsReceived": []
  }
}
```

**Significado:** Email foi enviado, mas webhook não recebeu eventos.

**Soluções possíveis:**
1. Verificar se configurou o webhook no Resend
2. Verificar se a URL está correta
3. Verificar logs do webhook no Supabase

---

## 📊 MONITORAR LOGS EM TEMPO REAL

Para ver o que está acontecendo durante o teste:

1. **Logs da função de teste:**
   https://supabase.com/dashboard/project/zotzvtepvpnkcoobdubt/functions/test-resend-integration/logs

2. **Logs do webhook:**
   https://supabase.com/dashboard/project/zotzvtepvpnkcoobdubt/functions/resend-webhook/logs

3. **Logs do Resend:**
   https://resend.com/webhooks (aba "Logs" do seu webhook)

---

## 🎯 VALIDAÇÕES ÚNICAS

A função cria dados únicos para cada teste:

- **Email único:** `test+[timestamp]@example.com`
- **Token único:** `test_token_[timestamp]`
- **Identificação:** Cada teste tem timestamp diferente

**Por quê?** Para garantir que não há conflito entre testes consecutivos.

---

## 🧹 LIMPEZA AUTOMÁTICA

O teste **sempre limpa** os dados ao final:

```sql
-- Remove eventos de teste
DELETE FROM invite_delivery_events WHERE invite_id = 'test_id';

-- Remove convite de teste
DELETE FROM invites WHERE id = 'test_id';
```

**Seu banco fica limpo!** Sem lixo de testes.

---

## 🚀 EXECUTE AGORA

Basta abrir esta URL:

```
https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/test-resend-integration
```

**Aguarde ~20 segundos** e você terá o relatório completo! 📊

---

## 📞 INTERPRETAÇÃO DOS RESULTADOS

### ✅ Se `"success": true`
→ **Parabéns!** Tudo funcionando perfeitamente!

### ⚠️ Se `"success": false`
→ Veja as **recommendations** no relatório
→ Verifique qual teste falhou nos **steps**
→ Corrija o problema e teste novamente

---

## 🎉 PRONTO!

Sistema de testes automáticos criado! Agora você pode validar a integração completa sem tocar no frontend. 🚀
