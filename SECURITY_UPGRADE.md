# 🔐 UPGRADE DE SEGURANÇA - CSP HARDENING

## ⚠️ VULNERABILIDADE CORRIGIDA

**Problema**: Content Security Policy permitia `'unsafe-inline'` e `'unsafe-eval'`, facilitando ataques XSS.

**Solução**: Implementação de CSP segura usando nonces criptográficos ao invés de `unsafe-inline`.

## 🛡️ MUDANÇAS IMPLEMENTADAS

### 1. **Nova Arquitetura CSP**
- ✅ **Removido `'unsafe-inline'`** para scripts
- ✅ **Removido `'unsafe-eval'`** em produção  
- ✅ **Implementado sistema de nonces** para scripts dinâmicos
- ✅ **Configurações específicas** para desenvolvimento vs produção

### 2. **Edge Function para Headers HTTP**
- ✅ **`/supabase/functions/security-headers`** - Gera CSP e headers seguros
- ✅ **Nonces criptográficos** gerados server-side
- ✅ **Headers HTTP adequados** (X-Frame-Options, HSTS, etc.)

### 3. **Arquivos Criados/Modificados**

#### 🆕 NOVOS ARQUIVOS:
- `src/utils/security/secureCSP.ts` - CSP segura com nonces
- `src/hooks/security/useSecureHeaders.ts` - Hook para edge function
- `supabase/functions/security-headers/index.ts` - Edge function
- `src/utils/security/legacyCSPCleanup.ts` - Limpeza de CSP antigas

#### 🔄 ARQUIVOS DEPRECIADOS:
- `src/utils/security/contentSecurityPolicy.ts` - Marcado como depreciado
- `src/hooks/seo/useSecurityHeaders.ts` - Marcado como depreciado

#### ♻️ ARQUIVOS ATUALIZADOS:
- `src/components/security/SecurityProvider.tsx` - Usa nova CSP segura
- `supabase/config.toml` - Configuração da edge function

## 📋 CONFIGURAÇÃO DE CSP

### **Produção (Segura):**
```
script-src 'self' 'nonce-XXX' https://cdn.gpteng.co https://*.supabase.co
style-src 'self' https://fonts.googleapis.com
object-src 'none'
base-uri 'self'
upgrade-insecure-requests
block-all-mixed-content
```

### **Desenvolvimento (Relaxada):**
```
script-src 'self' 'unsafe-eval' http://localhost:*
style-src 'self' 'unsafe-inline' http://localhost:*
```

## 🚀 COMO USAR

### **1. Em Componentes React:**
```typescript
import { useCSPNonce } from '@/utils/security/secureCSP';

const MyComponent = () => {
  const nonce = useCSPNonce();
  
  return <script nonce={nonce}>/* código seguro */</script>;
};
```

### **2. Para Scripts Dinâmicos:**
```typescript
import { createScriptWithNonce } from '@/utils/security/secureCSP';

const script = createScriptWithNonce('https://example.com/script.js');
document.head.appendChild(script);
```

### **3. Monitoramento de Violações:**
```typescript
// Automaticamente configurado via SecurityProvider
// Logs aparecem no console em desenvolvimento
// Podem ser integrados com Sentry/LogRocket em produção
```

## 📊 IMPACTO DE SEGURANÇA

| Métrica | Antes | Depois |
|---------|-------|--------|
| **Proteção XSS** | ⚠️ Baixa | ✅ Alta |
| **Scripts Inline** | ⚠️ Permitidos | ✅ Bloqueados |
| **Eval()** | ⚠️ Permitido | ✅ Bloqueado* |
| **Monitoramento** | ❌ Básico | ✅ Avançado |

*Permitido apenas em desenvolvimento para Vite HMR

## 🔍 MONITORAMENTO

### **Violações CSP são detectadas e logadas:**
- Console em desenvolvimento
- Sistema de auditoria em produção
- Classificação automática de severidade (low/medium/high/critical)

### **Tipos de Violações Monitoradas:**
- ✅ **Scripts inline** (Critical)
- ✅ **Uso de eval()** (Critical)  
- ✅ **Scripts externos** não autorizados (High)
- ✅ **Estilos inline** não autorizados (Medium)

## ⚡ PERFORMANCE

### **Impacto Mínimo:**
- Nonces são gerados uma vez por sessão
- Edge function executa rapidamente
- CSP é aplicada apenas uma vez no carregamento

### **Benefícios:**
- Proteção robusta contra XSS
- Headers HTTP adequados
- Monitoramento de segurança
- Compatibilidade com desenvolvimento local

## 🚨 TROUBLESHOOTING

### **Erro: "Script blocked by CSP"**
1. Verificar se script tem nonce correto
2. Confirmar se domínio está na lista permitida
3. Usar `createScriptWithNonce()` para scripts dinâmicos

### **Erro: "Style blocked by CSP"**  
1. Em produção, usar classes CSS ao invés de estilos inline
2. Em desenvolvimento, unsafe-inline é permitido

### **Edge Function não responde**
1. Verificar se função está deployada
2. Confirmar configuração em `supabase/config.toml`
3. Logs da função em Supabase Dashboard

## 📚 REFERÊNCIAS

- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Google CSP Evaluator](https://csp-evaluator.withgoogle.com/)

---

**Status**: ✅ Implementado  
**Severidade Original**: 🔴 Alta  
**Severidade Atual**: 🟢 Baixa