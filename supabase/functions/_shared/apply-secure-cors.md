# 🔧 Guia de Aplicação do CORS Seguro

## Status Atual

### ✅ Funções Já Atualizadas (9)
1. `admin-update-profile`
2. `process-connection-anniversaries`
3. `process-solution-reminders`
4. `upload-profile-picture`
5. `run-integration-test`
6. `get-assistant-messages`
7. `process-course-reminders`
8. `update_invite_send_stats`
9. `_shared/secureCors.ts` (módulo base)

### ⚠️ Webhooks (3) - CORS Aberto Justificado
1. `hubla-webhook` - Circuit breaker + signature validation
2. `resend-webhook` - HMAC SHA-256 verification
3. `whatsapp-webhook` - Token verification

### ⏳ Funções Pendentes (~80)

Todas as demais edge functions precisam ser atualizadas manualmente seguindo o padrão abaixo.

---

## 📋 Checklist de Atualização

Para cada edge function pendente:

### 1. Atualizar Import
```typescript
// ❌ ANTES
import { corsHeaders } from '../_shared/cors.ts';

// ✅ DEPOIS
import { getSecureCorsHeaders, isOriginAllowed, forbiddenOriginResponse } 
  from '../_shared/secureCors.ts';
```

### 2. Alterar Declaração de corsHeaders
```typescript
// ❌ ANTES
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ✅ DEPOIS
Deno.serve(async (req) => {
  const corsHeaders = getSecureCorsHeaders(req);
  // ...
});
```

### 3. Adicionar Validação de Origem
```typescript
// ❌ ANTES
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}

// Processar requisição...

// ✅ DEPOIS
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}

// 🔒 VALIDAÇÃO CORS: Bloquear origens não confiáveis
if (!isOriginAllowed(req)) {
  console.warn('[SECURITY] Origem não autorizada bloqueada:', req.headers.get('origin'));
  return forbiddenOriginResponse();
}

// Processar requisição...
```

---

## 📝 Exemplo Completo

### Antes (Vulnerável)
```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Processar requisição...
    const { data } = await supabase.from('users').select();

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
```

### Depois (Seguro)
```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';
import { getSecureCorsHeaders, isOriginAllowed, forbiddenOriginResponse } 
  from '../_shared/secureCors.ts';

serve(async (req: Request) => {
  const corsHeaders = getSecureCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 🔒 VALIDAÇÃO CORS: Bloquear origens não confiáveis
  if (!isOriginAllowed(req)) {
    console.warn('[SECURITY] Origem não autorizada bloqueada:', req.headers.get('origin'));
    return forbiddenOriginResponse();
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Processar requisição...
    const { data } = await supabase.from('users').select();

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
```

---

## 🎯 Funções Prioritárias

Atualize estas primeiro (alto impacto de segurança):

### 🔴 Críticas (1-10)
1. `admin-delete-user` - Pode deletar usuários
2. `process-invite` - Processa convites
3. `send-invite-email` - Envia emails
4. `generate-builder-solution` - Gera soluções de IA
5. `validate-credentials` - Valida credenciais
6. `admin-delete-invite` - Deleta convites
7. `auth-rate-limiter` - Controle de rate limiting
8. `batch-send-invites` - Envio em massa
9. `broadcast-notification` - Notificações broadcast
10. `admin-cleanup-wagner` - Limpeza administrativa

### 🟡 Importantes (11-20)
11. `send-whatsapp-invite` - WhatsApp
12. `send-connection-email` - Emails de conexão
13. `send-invite-whatsapp` - Convites WhatsApp
14. `batch-generate-matches` - Matches em lote
15. `calculate-ai-compatibility` - Cálculos de IA
16. `dashboard-users` - Dashboard de usuários
17. `dashboard-business` - Dashboard de negócios
18. `import-csv-data` - Importação de dados
19. `migrate-lesson-images` - Migração de imagens
20. `sync-master-members-csv` - Sincronização CSV

### 🟢 Médias (21+)
- Todas as demais funções de `generate-*`
- Todas as funções de `dashboard-*`
- Todas as funções de `ai-*`
- Funções de teste e debug

---

## ✅ Validação

Após atualizar cada função, teste:

### 1. Origem Legítima (deve funcionar)
```bash
curl -X POST "https://SEU_PROJETO.supabase.co/functions/v1/FUNCAO" \
  -H "Origin: https://app.viverdeia.ai" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"test": true}'

# Esperado: 200 OK (ou erro de validação, mas não 403)
```

### 2. Origem Maliciosa (deve bloquear)
```bash
curl -X POST "https://SEU_PROJETO.supabase.co/functions/v1/FUNCAO" \
  -H "Origin: https://site-malicioso.com" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"test": true}'

# Esperado: 403 Forbidden
# Response: {"error": "Origin not allowed"}
```

### 3. Verificar Logs
```bash
supabase functions logs FUNCAO --tail

# Deve aparecer:
# [SECURITY] Origem não autorizada bloqueada: https://site-malicioso.com
```

---

## 📊 Progresso

Atualize este contador conforme avança:

```
[████████░░░░░░░░░░░░░░░░░░░░] 9/89 (10%)

✅ Concluídas: 9
⏳ Pendentes: 80
⚠️ Exceções (webhooks): 3
```

---

## 🚀 Automação (Opcional)

Se quiser automatizar parte do processo, use este script bash:

```bash
#!/bin/bash

# Lista de funções a atualizar (edite conforme necessário)
FUNCTIONS=(
  "admin-delete-user"
  "process-invite"
  "send-invite-email"
  # ... adicione mais
)

for func in "${FUNCTIONS[@]}"; do
  echo "🔄 Atualizando: $func"
  
  FILE="supabase/functions/$func/index.ts"
  
  if [ ! -f "$FILE" ]; then
    echo "⚠️  Arquivo não encontrado: $FILE"
    continue
  fi
  
  # Backup
  cp "$FILE" "$FILE.backup"
  
  # Substituir import (simplificado - ajuste conforme necessário)
  sed -i "s|from '../_shared/cors.ts'|from '../_shared/secureCors.ts'|g" "$FILE"
  
  echo "✅ Atualizado: $func"
done

echo "🏁 Concluído!"
```

**Importante**: Este script é um exemplo básico. Você DEVE revisar cada função manualmente.

---

## 🆘 Troubleshooting

### Erro: "Cannot find module 'secureCors.ts'"
```typescript
// Verifique o caminho relativo
import { ... } from '../_shared/secureCors.ts';  // Para funções no root
import { ... } from '../../_shared/secureCors.ts'; // Se houver subpastas
```

### Erro: "corsHeaders is not defined"
```typescript
// Certifique-se de declarar dentro do Deno.serve
Deno.serve(async (req) => {
  const corsHeaders = getSecureCorsHeaders(req);  // ✅ Aqui
  // ...
});
```

### Requisições bloqueadas em localhost
```bash
# Ative o modo dev
export DEV_MODE=true
# ou
export ENVIRONMENT=development
```

---

**Última atualização**: 2025-10-31
