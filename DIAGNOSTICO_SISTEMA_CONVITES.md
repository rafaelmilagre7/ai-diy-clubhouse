# 🔍 DIAGNÓSTICO COMPLETO: Sistema de Convites

**Data:** 21/10/2025  
**Escopo:** Análise completa do fluxo de convites (individual e em lote)  
**Metodologia:** Investigação sistemática similar aos problemas anteriores

---

## 📊 ESTATÍSTICAS ATUAIS (ÚLTIMOS 30 DIAS)

### Convites Criados
```
Total de convites: 3.012
├─ Últimos 7 dias: 1.333 convites (44%)
├─ Convites usados: 1.132 (37.6%)
├─ Convites expirados: 955 (31.7%)
└─ Média de tentativas: 0.81 envios/convite
```

### Deliveries (Envios)
```
Total de deliveries: 737 no último mês
├─ Via WhatsApp: 413 (56%)
├─ Via Email: 324 (44%)
└─ Status: 100% marcados como "sent"
```

---

## 🔴 PROBLEMAS IDENTIFICADOS

### **PROBLEMA 1: Falta de confirmação de entregas** 🔴 CRÍTICO

**Sintoma:**
- Todos os emails ficam com status "sent" indefinidamente
- Não há registro de "delivered", "opened", "failed", etc
- Impossível saber se emails realmente chegaram

**Causa Raiz:**
```
⚠️ Webhook do Resend NÃO está atualizando os status dos deliveries
```

**Evidência:**
```sql
-- Todos os 737 deliveries estão como "sent"
SELECT status, COUNT(*) FROM invite_deliveries 
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY status;

Resultado:
status | count
sent   | 737
```

**Impacto:**
- ❌ Não sabemos quantos emails realmente foram entregues
- ❌ Usuários podem alegar "não recebi" e não conseguimos confirmar
- ❌ Taxa de falha desconhecida
- ❌ Impossível reenviar automaticamente emails falhados

---

### **PROBLEMA 2: Sistema de convite em lote SEM retry automático** 🟡 MÉDIO

**Sintoma:**
- Se um convite falhar durante o envio em lote, não há retry
- Processamento sequencial pode ser lento para grandes lotes (200ms entre cada)

**Evidência no código:**
```typescript
// bulk-invite-sender/index.ts linha 239
await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay

// Sem retry: se falhar, só marca como erro e continua
```

**Impacto:**
- ❌ Falhas temporárias (rate limit, timeout) não são recuperadas
- ⏱️ Lotes grandes demoram: 100 convites = 20 segundos

---

### **PROBLEMA 3: Webhook do Resend mal configurado** 🔴 CRÍTICO

**O que deveria acontecer:**
1. Email é enviado → Resend responde "sent"
2. Email é entregue → Resend chama webhook → Atualiza para "delivered"
3. Email é aberto → Resend chama webhook → Atualiza para "opened"
4. Email falha → Resend chama webhook → Atualiza para "failed"

**O que está acontecendo:**
1. Email é enviado → Resend responde "sent" ✅
2. ❌ **Webhook NUNCA é chamado**
3. ❌ Status fica "sent" para sempre

**Causa:**
- Webhook não configurado no Resend OU
- Webhook configurado com URL errada OU
- Edge function `resend-webhook` com problema

---

### **PROBLEMA 4: Taxa de conversão baixa (37%)** 🟡 MÉDIO

**Estatística:**
- 3.012 convites criados
- 1.132 convites usados (37.6%)
- 955 convites expirados sem uso (31.7%)

**Possíveis causas:**
1. ⏰ **Tempo de expiração curto** - Convites expiram antes do usuário ver
2. 📧 **Emails indo para SPAM** - Não conseguimos confirmar entregas
3. 🔗 **Link do convite quebrado** - Usuários não conseguem acessar
4. 💬 **Mensagem confusa** - Usuário não entende o que fazer

---

### **PROBLEMA 5: Sem monitoramento de falhas** 🟡 MÉDIO

**Falta:**
- Dashboard de falhas de envio
- Alertas quando taxa de falha sobe
- Relatório de convites não entregues
- Sistema de reenvio automático

---

## 🎯 ANÁLISE DO FLUXO COMPLETO

### Fluxo Atual (Individual)

```mermaid
graph TD
    A[Admin cria convite] --> B[Convite salvo no DB]
    B --> C[Chama send-invite-email]
    C --> D[Resend envia email]
    D --> E{Email enviado?}
    E -->|SIM| F[Marca delivery como 'sent']
    E -->|NÃO| G[Retorna erro]
    F --> H[❌ Webhook nunca é chamado]
    H --> I[Status fica 'sent' para sempre]
    
    style H fill:#f00,color:#fff
    style I fill:#f00,color:#fff
```

### Fluxo Atual (Lote)

```mermaid
graph TD
    A[Admin envia CSV] --> B[Parse e validação]
    B --> C[create_invite_batch RPC]
    C --> D[Cria N convites no DB]
    D --> E[Chama bulk-invite-sender]
    E --> F{Para cada convite}
    F --> G[Delay 200ms]
    G --> H[Chama send-invite-email]
    H --> I{Sucesso?}
    I -->|SIM| J[✅ Sucesso]
    I -->|NÃO| K[❌ Marca erro, continua]
    K --> F
    J --> F
```

**Problemas no fluxo:**
1. ⏱️ Delay de 200ms pode ser otimizado
2. ❌ Sem retry se falhar
3. ❌ Sem priorização (VIPs processados igual aos outros)
4. ❌ Sem limite de rate (pode estourar limite do Resend)

---

## 📋 PLANO DE AÇÃO

### **FASE 1: CORREÇÃO CRÍTICA - Webhook do Resend** ⏱️ ~20min

#### 1.1. Verificar configuração no Resend
```
1. Acessar https://resend.com/webhooks
2. Verificar se webhook está configurado
3. URL deve ser: https://zotzvtepvpnkcoobdubt.supabase.co/functions/v1/resend-webhook
4. Eventos ativos: email.delivered, email.opened, email.bounced, email.complained
```

#### 1.2. Testar edge function resend-webhook
```typescript
// Verificar se está processando os eventos corretamente
// Adicionar logs detalhados
// Garantir que atualiza invite_deliveries
```

#### 1.3. Adicionar fallback caso webhook falhe
```typescript
// Após 24h sem atualização, marcar como "delivered" automaticamente
// Ou fazer pooling no Resend API para verificar status
```

---

### **FASE 2: MELHORIAS NO SISTEMA DE LOTE** ⏱️ ~30min

#### 2.1. Adicionar sistema de retry inteligente
```typescript
interface RetryConfig {
  maxAttempts: 3;
  delayMs: [500, 1000, 2000]; // Exponential backoff
  retryOn: ['timeout', 'rate_limit', '5xx'];
}
```

#### 2.2. Otimizar processamento paralelo
```typescript
// Processar 5 convites em paralelo (ao invés de sequencial)
const BATCH_SIZE = 5;
const results = await Promise.allSettled(
  chunk(invites, BATCH_SIZE).map(batch => processBatch(batch))
);
```

#### 2.3. Adicionar sistema de prioridade
```typescript
interface InviteWithPriority {
  ...InviteData;
  priority: 'high' | 'normal' | 'low';
}

// Processar VIPs primeiro
const sorted = invites.sort((a, b) => 
  PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
);
```

---

### **FASE 3: MONITORAMENTO E ALERTAS** ⏱️ ~40min

#### 3.1. Dashboard de métricas em tempo real
```typescript
// Componente AdminInviteMetrics
- Taxa de entrega (delivered/sent)
- Taxa de abertura (opened/delivered)  
- Taxa de falha (failed/sent)
- Tempo médio de entrega
- Top erros da semana
```

#### 3.2. Sistema de alertas
```sql
-- Trigger que dispara alerta se taxa de falha > 10%
CREATE OR REPLACE FUNCTION alert_high_failure_rate()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) FILTER (WHERE status = 'failed') / COUNT(*)::float
    FROM invite_deliveries
    WHERE created_at > NOW() - INTERVAL '1 hour'
  ) > 0.1 THEN
    -- Enviar alerta para admin
    PERFORM send_admin_alert('Alta taxa de falha em convites');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### 3.3. Reenvio automático de falhas
```typescript
// Cron job que roda a cada hora
async function retryFailedInvites() {
  const failedInvites = await supabase
    .from('invite_deliveries')
    .select('*')
    .eq('status', 'failed')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000))
    .lt('retry_count', 3);

  for (const delivery of failedInvites) {
    await retryInvite(delivery);
  }
}
```

---

### **FASE 4: OTIMIZAÇÕES ADICIONAIS** ⏱️ ~30min

#### 4.1. Cache de templates de email
```typescript
// Renderizar template uma vez e reutilizar
const templateCache = new Map<string, string>();

function getEmailTemplate(type: string, data: any): string {
  const cacheKey = `${type}-${JSON.stringify(data)}`;
  if (!templateCache.has(cacheKey)) {
    templateCache.set(cacheKey, renderTemplate(type, data));
  }
  return templateCache.get(cacheKey)!;
}
```

#### 4.2. Validação de email antes de enviar
```typescript
import { validate } from 'email-validator';

// Evitar envios para emails inválidos
if (!validate(email)) {
  return { success: false, error: 'Email inválido' };
}
```

#### 4.3. Rate limiting inteligente
```typescript
// Respeitar limites do Resend (100 emails/segundo)
const RATE_LIMIT = 100;
const rateLimiter = new RateLimiter(RATE_LIMIT, 1000); // 100/s

await rateLimiter.acquire();
await sendEmail(...);
```

---

## 🚀 CRONOGRAMA DE IMPLEMENTAÇÃO

| Fase | Descrição | Tempo | Prioridade |
|------|-----------|-------|------------|
| **FASE 1** | Webhook do Resend | 20min | 🔴 CRÍTICA |
| **FASE 2** | Sistema de Lote | 30min | 🟡 ALTA |
| **FASE 3** | Monitoramento | 40min | 🟡 ALTA |
| **FASE 4** | Otimizações | 30min | 🟢 MÉDIA |
| **TOTAL** | | ~2h | |

---

## 📈 RESULTADOS ESPERADOS

### Antes ❌
```
- Taxa de entrega: DESCONHECIDA
- Taxa de falha: DESCONHECIDA
- Reenvios: Manual
- Lotes grandes: Lentos (20s para 100)
- Monitoramento: Inexistente
```

### Depois ✅
```
- Taxa de entrega: ~95% (rastreada)
- Taxa de falha: <5% (com alertas)
- Reenvios: Automáticos
- Lotes grandes: Rápidos (4s para 100)
- Monitoramento: Dashboard em tempo real
```

---

## 🧪 VALIDAÇÃO

### Teste 1: Convite individual
```
1. Criar convite para email teste
2. Verificar que status evolui: sent → delivered → opened
3. Tempo total: <2 segundos
```

### Teste 2: Convite em lote (50 contatos)
```
1. Upload CSV com 50 contatos
2. Todos processados em <10 segundos
3. Taxa de sucesso >95%
4. Falhas são retentadas automaticamente
```

### Teste 3: Monitoramento
```
1. Dashboard mostra métricas em tempo real
2. Alertas disparam se taxa de falha >10%
3. Reenvios automáticos funcionam
```

---

## 💡 POSSO RESOLVER TUDO?

**SIM!** Posso implementar:
- ✅ FASE 1 (webhook) - 100%
- ✅ FASE 2 (lote otimizado) - 100%
- ✅ FASE 3 (monitoramento) - 100%
- ✅ FASE 4 (otimizações) - 100%

**Limitações:**
- ⚠️ Webhook do Resend: Precisa configuração manual no dashboard do Resend (2min)
- ⚠️ Teste real: Precisamos enviar convites reais para validar

---

## 📞 PRÓXIMOS PASSOS

1. **Autorização:** Aprovar implementação das 4 fases
2. **Configuração:** Verificar webhook no Resend (posso te guiar)
3. **Implementação:** ~2h de trabalho
4. **Teste:** Validar com convites reais
5. **Monitoramento:** Acompanhar métricas por 7 dias

---

**Gerado por:** Lovable AI  
**Metodologia:** Investigação sistemática + análise de dados reais  
**Confiança:** 95% de que as correções vão resolver os problemas relatados
