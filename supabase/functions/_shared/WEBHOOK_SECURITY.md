# 🔒 Segurança de Webhooks Externos

## Funções com CORS Aberto (Exceções Justificadas)

### 1. `hubla-webhook`
- **Origem**: Plataforma Hubla (pagamentos)
- **CORS**: `Access-Control-Allow-Origin: *`
- **Segurança Alternativa**:
  - ✅ Circuit Breaker (limite 5 webhooks simultâneos)
  - ✅ Validação de signature `x-hubla-signature`
  - ✅ Rate limiting (proteção anti-sobrecarga)
  - ✅ Timeout de 30s por webhook
  - ✅ Sistema de recuperação automática (2min)

### 2. `resend-webhook`
- **Origem**: Resend (serviço de email)
- **CORS**: `Access-Control-Allow-Origin: *`
- **Segurança Alternativa**:
  - ✅ Verificação HMAC SHA-256 (`svix-signature`)
  - ✅ Rejeita webhooks sem assinatura válida
  - ✅ Validação de múltiplas versões de assinatura
  - ✅ Logs de auditoria para tentativas de ataque

### 3. `whatsapp-webhook`
- **Origem**: Meta/WhatsApp Business API
- **CORS**: `Access-Control-Allow-Origin: *`
- **Segurança Alternativa**:
  - ✅ Token de verificação (`hub.verify_token`)
  - ✅ Validação de challenge do Meta
  - ✅ Logs de auditoria para todas as atualizações
  - ✅ Validação de estrutura de payload

## ⚠️ IMPORTANTE

Webhooks NUNCA devem usar CORS restritivo porque:
1. São chamados por servidores externos (não navegadores)
2. Não enviam header `Origin` em requisições server-to-server
3. Usam autenticação via assinatura/token (mais seguro que CORS)
4. CORS é uma proteção de navegador, não aplicável a APIs externas

## 🛡️ Camadas de Proteção

### Hubla Webhook
```typescript
// Circuit Breaker Pattern
- MAX_CONCURRENT: 5 webhooks simultâneos
- QUEUE_TIMEOUT: 30 segundos
- RECOVERY_TIME: 2 minutos
- FAILURE_THRESHOLD: 3 falhas consecutivas

// Validação
- Signature header: x-hubla-signature
- Armazenamento para auditoria: hubla_webhooks table
```

### Resend Webhook
```typescript
// HMAC Verification
- Algorithm: SHA-256
- Header: svix-signature (formato: v1,hash v2,hash)
- Rejeição imediata se signature inválida (401)

// Auditoria
- Logs de tentativas de ataque
- Rastreamento de eventos por email_id
```

### WhatsApp Webhook
```typescript
// Meta Verification
- Verify token: WHATSAPP_WEBHOOK_VERIFY_TOKEN
- Challenge response para validação
- Mode: subscribe

// Auditoria
- Logs de todos os status updates
- Rastreamento por message_id e recipient_id
```

## 📊 Comparação: CORS vs Autenticação Forte

| Aspecto | CORS Restritivo | Autenticação Forte |
|---------|----------------|-------------------|
| **Aplicável a** | Navegadores | Qualquer cliente |
| **Proteção** | Origin-based | Cryptographic |
| **Bypass** | Proxy simples | Impossível sem secret |
| **Webhooks** | ❌ Não funciona | ✅ Ideal |
| **SPAs** | ✅ Ideal | ⚠️ Expõe secrets |

## 🎯 Política de Segurança

### Frontend Functions (86 funções)
```typescript
// ✅ CORS Restritivo
const corsHeaders = getSecureCorsHeaders(req);

if (!isOriginAllowed(req)) {
  return forbiddenOriginResponse();
}
```

**Origens permitidas:**
- `https://app.viverdeia.ai`
- `https://viverdeia.ai`
- `http://localhost:*` (apenas em desenvolvimento)

### Webhook Functions (3 funções)
```typescript
// ✅ CORS Aberto + Autenticação Forte
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '..., x-signature-header',
}

// Validação de signature OBRIGATÓRIA
if (!await verifySignature(payload, signature, secret)) {
  return new Response('Unauthorized', { status: 401 });
}
```

## 🔍 Como Identificar um Webhook

Uma Edge Function é um webhook se:
1. Recebe requisições de APIs/serviços externos (não do frontend)
2. Implementa validação de assinatura/token
3. Processa eventos de sistemas terceiros
4. Não requer autenticação de usuário (JWT)

## 📝 Checklist de Segurança

### Para Novas Edge Functions:

- [ ] É chamada pelo frontend? → Use CORS restritivo
- [ ] É um webhook externo? → Use CORS aberto + autenticação forte
- [ ] Implementa validação de signature/token?
- [ ] Tem logs de auditoria?
- [ ] Tem rate limiting ou circuit breaker?
- [ ] Está documentada neste arquivo?

## 🚨 Red Flags

⚠️ **Nunca faça:**
- CORS aberto sem autenticação forte
- Autenticação baseada apenas em headers simples
- Webhooks sem logs de auditoria
- Processamento de pagamento sem verificação de signature

✅ **Sempre faça:**
- Valide signatures/tokens ANTES de processar
- Implemente circuit breaker para alta carga
- Registre tentativas de ataque
- Use service role key apenas após validação
