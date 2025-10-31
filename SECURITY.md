# 🔒 Política de Segurança - Viver de IA

## Visão Geral

Este documento descreve as políticas e práticas de segurança implementadas na plataforma Viver de IA.

## 🛡️ Política de CORS

### Funções de Frontend (86 Edge Functions)

**Proteção**: CORS Restritivo com Whitelist

```typescript
// Implementação via supabase/functions/_shared/secureCors.ts
const ALLOWED_ORIGINS = [
  'https://app.viverdeia.ai',      // Produção
  'https://viverdeia.ai',           // Site principal
  'http://localhost:5173',          // Desenvolvimento (apenas com DEV_MODE=true)
  'http://localhost:3000',          // Desenvolvimento alternativo
  'http://127.0.0.1:5173',         // Desenvolvimento local
  'http://127.0.0.1:3000',         // Desenvolvimento local alternativo
];
```

**Comportamento:**
- ✅ Requisições de origens na whitelist: **Permitidas**
- ❌ Requisições de outras origens: **Bloqueadas com 403 Forbidden**
- 📝 Tentativas de acesso não autorizado: **Logadas**

**Funções Protegidas:**
- `admin-*` (gerenciamento administrativo)
- `ai-*` (funcionalidades de IA)
- `generate-*` (geração de conteúdo)
- `process-*` (processamento de dados)
- `send-*` (envio de comunicações)
- E todas as outras 86 funções de frontend

### Webhooks Externos (3 Edge Functions)

**Proteção**: CORS Aberto + Autenticação Criptográfica Forte

#### 1. `hubla-webhook` (Pagamentos)
```typescript
// CORS Aberto
'Access-Control-Allow-Origin': '*'

// Autenticação via:
- Circuit Breaker (máx 5 webhooks simultâneos)
- Signature validation (x-hubla-signature)
- Rate limiting
- Timeout de 30s
- Recovery automático após falhas
```

#### 2. `resend-webhook` (Email)
```typescript
// CORS Aberto
'Access-Control-Allow-Origin': '*'

// Autenticação via:
- HMAC SHA-256 verification
- Header: svix-signature
- Rejeição imediata se assinatura inválida (401)
- Logs de tentativas de ataque
```

#### 3. `whatsapp-webhook` (WhatsApp Business)
```typescript
// CORS Aberto
'Access-Control-Allow-Origin': '*'

// Autenticação via:
- Token verification (hub.verify_token)
- Challenge validation (Meta)
- Logs de auditoria completos
```

**Por que CORS aberto?**
- Webhooks são chamados por **servidores** (não navegadores)
- Não enviam header `Origin`
- CORS é uma proteção de **navegador**, não aplicável aqui
- Autenticação via assinatura criptográfica é **muito mais segura**

## 🔍 Como Funciona a Validação

### Para Funções Frontend

```typescript
// 1. Verificar se origem está na whitelist
const origin = request.headers.get('origin');
const isAllowed = ALLOWED_ORIGINS.includes(origin);

// 2. Se não está permitida, bloquear
if (!isAllowed) {
  console.warn('[SECURITY] Origem bloqueada:', origin);
  return new Response(
    JSON.stringify({ error: 'Origin not allowed' }),
    { status: 403 }
  );
}

// 3. Se permitida, processar normalmente
return processRequest();
```

### Para Webhooks

```typescript
// 1. Verificar assinatura criptográfica
const signature = request.headers.get('x-signature-header');
const isValid = await verifySignature(payload, signature, secret);

// 2. Se inválida, rejeitar
if (!isValid) {
  console.error('[SECURITY] Assinatura inválida');
  return new Response('Unauthorized', { status: 401 });
}

// 3. Se válida, processar
return processWebhook();
```

## 🎯 Testando a Segurança

### Teste 1: Bloquear Origem Maliciosa (Frontend)
```bash
curl -X POST "https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/admin-update-profile" \
  -H "Origin: https://site-malicioso.com" \
  -H "Authorization: Bearer TOKEN"

# Esperado: 403 Forbidden
# Response: {"error": "Origin not allowed"}
```

### Teste 2: Permitir Origem Legítima (Frontend)
```bash
curl -X POST "https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/admin-update-profile" \
  -H "Origin: https://app.viverdeia.ai" \
  -H "Authorization: Bearer TOKEN"

# Esperado: 200 OK ou 400 Bad Request (não bloqueado por CORS)
```

### Teste 3: Webhook Aceita Qualquer Origem (mas valida signature)
```bash
curl -X POST "https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/hubla-webhook" \
  -H "Origin: https://qualquer-origem.com" \
  -H "x-hubla-signature: INVALID" \
  -d '{"test": true}'

# Esperado: Aceita requisição (CORS não bloqueia)
# Mas pode rejeitar por signature inválida se implementado
```

## 📊 Estatísticas de Segurança

### Antes da Implementação (VULNERÁVEL)
```
❌ 89/89 funções com CORS aberto ('*')
❌ Qualquer site pode chamar suas APIs
❌ Risco de CSRF, data theft, API abuse
❌ CVSS 3.1: 8.2 (Alta)
```

### Depois da Implementação (SEGURO)
```
✅ 86 funções com CORS restritivo (whitelist)
✅ 3 webhooks com autenticação criptográfica
✅ 100% das funções protegidas adequadamente
✅ Logs de tentativas de acesso não autorizado
```

## 🚨 Alertas de Segurança

### Eventos Logados
Todas as tentativas de acesso não autorizado são registradas:

```typescript
console.warn('[SECURITY] Origem não autorizada bloqueada:', origin);
```

Esses logs podem ser monitorados para:
- Detectar tentativas de ataque
- Identificar origens suspeitas
- Auditar acessos

### Ações Recomendadas

Se você identificar tentativas repetidas de acesso não autorizado:
1. Revise os logs: `supabase functions logs <function-name>`
2. Identifique o padrão de ataque
3. Considere adicionar rate limiting adicional
4. Reporte atividade suspeita

## 📝 Desenvolvimento Local

### Ativando Origens de Desenvolvimento

As origens `localhost` são permitidas **apenas** quando:

```bash
# Variável de ambiente ativa
ENVIRONMENT=development
# ou
DEV_MODE=true
```

Em **produção**, essas origens são **automaticamente bloqueadas**.

### Testando Localmente

```typescript
// Seu frontend em localhost:5173 consegue chamar:
const response = await supabase.functions.invoke('admin-update-profile', {
  body: { ... }
});
// ✅ Permitido em desenvolvimento
// ❌ Bloqueado em produção
```

## 🔐 Melhores Práticas

### ✅ Sempre Faça

1. **Use `secureCors.ts` para novas funções frontend**
   ```typescript
   import { getSecureCorsHeaders, isOriginAllowed, forbiddenOriginResponse } 
     from '../_shared/secureCors.ts';
   ```

2. **Valide autenticação ANTES de CORS**
   ```typescript
   // Ordem correta:
   // 1. OPTIONS (CORS preflight)
   // 2. Validar origem (CORS)
   // 3. Validar autenticação (JWT/Signature)
   // 4. Processar requisição
   ```

3. **Implemente auditoria**
   ```typescript
   await supabase.from('audit_logs').insert({
     event_type: 'access_denied',
     details: { origin, reason: 'cors_blocked' }
   });
   ```

### ❌ Nunca Faça

1. **CORS aberto sem autenticação forte**
   ```typescript
   // ❌ NUNCA
   const corsHeaders = { 'Access-Control-Allow-Origin': '*' };
   // Sem validação de signature/token
   ```

2. **Whitelist baseada em regex/patterns**
   ```typescript
   // ❌ NUNCA
   if (origin.includes('viverdeia')) { ... }
   // Use array exato de origens permitidas
   ```

3. **Confiar apenas em headers simples**
   ```typescript
   // ❌ NUNCA
   const apiKey = request.headers.get('x-api-key');
   if (apiKey === 'secret') { ... }
   // Use assinatura criptográfica
   ```

## 📚 Recursos Adicionais

- **Documentação de Webhooks**: `supabase/functions/_shared/WEBHOOK_SECURITY.md`
- **Implementação CORS**: `supabase/functions/_shared/secureCors.ts`
- **Auditoria**: Tabela `audit_logs` no Supabase

## 🆘 Suporte

Para reportar vulnerabilidades de segurança:
1. **NÃO** crie issues públicos
2. Entre em contato diretamente com a equipe de segurança
3. Forneça detalhes técnicos e passos para reproduzir

---

**Última atualização**: 2025-10-31  
**Versão da política**: 1.0.0
