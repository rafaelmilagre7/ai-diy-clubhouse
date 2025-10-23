# 🚀 GUIA DE ATIVAÇÃO DO SISTEMA REALTIME

## ✅ STATUS ATUAL

**Implementado:** 100% (TODAS as 4 fases)  
**Ativo:** Apenas Fase 1 (Notificações)  
**Pendente Ativação:** Fases 2, 3 e 4

---

## 📦 O QUE FOI IMPLEMENTADO

### ✅ Fase 1: Notificações (ATIVA)
- ✅ Hook `useSimpleNotifications`
- ✅ Toast + Som + Notificações Desktop
- ✅ Badge contador em tempo real
- ✅ SQL configurado
- ✅ **FUNCIONANDO PARA TODOS OS USUÁRIOS**

### ✅ Fase 2: Presença Online (IMPLEMENTADA - INATIVA)
- ✅ Hook `useSimplePresence`
- ✅ Componente `OnlineIndicator`
- ✅ Componente `OnlineUsersList`
- ✅ Componente `LiveUpdateIndicator`
- ⚠️ **PRONTA MAS DESATIVADA** (aguardando ativação)

### ✅ Fase 3: Chat Realtime (IMPLEMENTADA - INATIVA)
- ✅ Hook `useRealtimeDirectMessages`
- ✅ Som de mensagens
- ✅ Invalidação de queries
- ✅ SQL configurado (direct_messages + conversations)
- ⚠️ **PRONTA MAS DESATIVADA** (aguardando ativação)

### ✅ Fase 4: Live Updates (IMPLEMENTADA - INATIVA)
- ✅ Hook `useRealtimeLiveUpdates` (genérico)
- ✅ Hooks especializados:
  - `useRealtimeComments`
  - `useRealtimeLikes`
  - `useRealtimeViews`
- ✅ SQL configurado (profiles, suggestions, suggestion_votes)
- ⚠️ **PRONTA MAS DESATIVADA** (aguardando ativação)

---

## 🎮 COMO ATIVAR CADA FASE

### Arquivo: `src/App.tsx`

```tsx
<RealtimeProviderV2
  enableNotifications={true}   // Fase 1: ATIVA ✅
  enablePresence={false}       // Fase 2: MUDE PARA true ⬅️
  enableChat={false}           // Fase 3: MUDE PARA true ⬅️
  enableSound={true}
  enableDesktopNotifications={true}
/>
```

### Ativação Gradual (Recomendado):

#### 1️⃣ ATIVAR FASE 2 (Presença Online)
```tsx
<RealtimeProviderV2
  enableNotifications={true}
  enablePresence={true}  // ⬅️ MUDAR AQUI
  enableChat={false}
  enableSound={true}
  enableDesktopNotifications={true}
/>
```

**O que vai acontecer:**
- ✅ Sistema de presença será ativado
- ✅ Usuários verão quem está online
- ✅ Bolinhas verde/cinza nos avatares
- ✅ Contagem de pessoas online

**Como testar:**
1. Abrir app em 2 abas diferentes
2. Verificar se aparece "2 pessoas online"
3. Fechar uma aba e ver se atualiza para "1 pessoa online"
4. Verificar no console: "✅ Canal de presença conectado"

**Monitorar por:** 24-48 horas
**Se estável:** Continuar para Fase 3

---

#### 2️⃣ ATIVAR FASE 3 (Chat Realtime)
```tsx
<RealtimeProviderV2
  enableNotifications={true}
  enablePresence={true}
  enableChat={true}  // ⬅️ MUDAR AQUI
  enableSound={true}
  enableDesktopNotifications={true}
/>
```

**O que vai acontecer:**
- ✅ Mensagens aparecerão instantaneamente
- ✅ Som ao receber mensagens
- ✅ Read receipts em tempo real
- ✅ Fim do polling (menos carga no servidor)

**Como testar:**
1. Abrir chat entre 2 usuários
2. Enviar mensagem de um lado
3. Verificar se aparece INSTANTANEAMENTE do outro lado
4. Verificar no console: "✅ Canal de chat conectado"
5. Verificar no console: "💬 Nova mensagem recebida"

**Monitorar por:** 24-48 horas
**Se estável:** Continuar para Fase 4

---

#### 3️⃣ ATIVAR FASE 4 (Live Updates)
**Atenção:** Esta fase requer integração manual nos componentes!

**Passo 1:** Ativar o provider (não tem feature flag específica)

**Passo 2:** Adicionar nos componentes que precisam:

```tsx
// Exemplo: Comentários em tempo real
import { useRealtimeComments } from '@/hooks/realtime/useRealtimeLiveUpdates';

function CommentsSection({ resourceId }) {
  // Ativa live updates para esta resource
  const { isConnected } = useRealtimeComments(resourceId);
  
  // ... resto do componente
}
```

```tsx
// Exemplo: Curtidas em tempo real
import { useRealtimeLikes } from '@/hooks/realtime/useRealtimeLiveUpdates';

function LikesButton({ resourceId }) {
  const { isConnected } = useRealtimeLikes(resourceId);
  
  // ... resto do componente
}
```

**O que vai acontecer:**
- ✅ Curtidas aparecem instantaneamente para todos
- ✅ Comentários aparecem em tempo real
- ✅ Views são atualizadas ao vivo
- ✅ Status de sugestões atualiza automaticamente

**Como testar:**
1. Abrir um post em 2 abas
2. Curtir em uma aba
3. Verificar se atualiza na outra aba instantaneamente
4. Comentar e verificar se aparece automaticamente

**Monitorar por:** 1 semana

---

## 🔍 MONITORAMENTO

### Console Logs para Verificar:

**Fase 1 (Notificações):**
```
🔌 Conectando ao canal: notifications:${userId}
📡 Status do canal: SUBSCRIBED
✅ Canal conectado com sucesso
📬 Nova notificação recebida: {...}
```

**Fase 2 (Presença):**
```
🔌 Conectando ao canal de presença: presence:online-users
📡 Status presença: SUBSCRIBED
✅ Canal de presença conectado
✅ Presença rastreada: {...}
🔄 Presença sincronizada: X usuários
💓 Heartbeat enviado
```

**Fase 3 (Chat):**
```
🔌 Conectando ao canal de chat: chat:${userId}
📡 Status chat: SUBSCRIBED
✅ Canal de chat conectado
💬 Nova mensagem recebida: {...}
📖 Mensagem atualizada: {...}
```

**Fase 4 (Live Updates):**
```
🔌 Conectando ao canal de live updates: live-updates:${userId}
📡 Status live updates: SUBSCRIBED
✅ Canal de live updates conectado
📊 Update em [tabela] (INSERT): {...}
```

### Métricas de Performance:

**Verificar no DevTools:**
- **CPU Idle:** < 15%
- **WebSockets Ativos:**
  - Fase 1: 1 por usuário
  - Fase 2: 2 por usuário (notifications + presence)
  - Fase 3: 3 por usuário (+ chat)
  - Fase 4: 3-4 por usuário (+ live updates compartilhado)
- **Reconexões:** 0 (apenas inicial)
- **Latência:** < 3s para notificações

**🚨 SINAIS DE PROBLEMA:**
- ❌ CPU > 30% em idle
- ❌ Múltiplas reconexões (> 5 por minuto)
- ❌ Logs de "CHANNEL_ERROR"
- ❌ Mensagens não chegando

**Se detectar problemas:**
1. Desativar última fase ativada
2. Verificar console logs
3. Verificar DevTools → Network → WebSocket
4. Reportar erro com logs

---

## 🎯 CRONOGRAMA RECOMENDADO

### Semana 1
- **Seg-Ter:** Ativar Fase 2 (Presença)
- **Qua-Sex:** Monitorar e coletar feedback

### Semana 2
- **Seg-Ter:** Ativar Fase 3 (Chat)
- **Qua-Sex:** Monitorar e coletar feedback

### Semana 3
- **Seg-Ter:** Integrar Fase 4 (Live Updates) nos componentes
- **Qua-Sex:** Monitorar e coletar feedback

### Semana 4
- **Monitoramento contínuo**
- **Ajustes finos**
- **Documentação final**

---

## 🔙 ROLLBACK DE EMERGÊNCIA

Se algo der muito errado em qualquer fase:

**1. Rollback Imediato (< 1 minuto):**
```tsx
// No src/App.tsx, desativar a fase problemática:
<RealtimeProviderV2
  enableNotifications={true}   // Manter
  enablePresence={false}       // ⬅️ DESATIVAR SE FOR O PROBLEMA
  enableChat={false}           // ⬅️ DESATIVAR SE FOR O PROBLEMA
  enableSound={true}
  enableDesktopNotifications={true}
/>
```

**2. Rollback Total (voltar apenas Fase 1):**
```tsx
<RealtimeProviderV2
  enableNotifications={true}   // Apenas Fase 1
  enablePresence={false}
  enableChat={false}
  enableSound={true}
  enableDesktopNotifications={true}
/>
```

**3. Rollback Completo (desativar TUDO):**
```tsx
<RealtimeProviderV2
  enableNotifications={false}  // Desativar tudo
  enablePresence={false}
  enableChat={false}
  enableSound={false}
  enableDesktopNotifications={false}
/>
```

**Sistema voltará a funcionar com polling (como estava antes)**

---

## 📊 TABELAS HABILITADAS NO BANCO

✅ Configurado via SQL migration:
- `notifications` - Fase 1
- `direct_messages` - Fase 3
- `conversations` - Fase 3
- `profiles` - Fase 4
- `suggestions` - Fase 4 (se existir)
- `suggestion_votes` - Fase 4 (se existir)

**Verificar no Supabase SQL Editor:**
```sql
SELECT tablename, schemaname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
```

---

## ✅ CHECKLIST FINAL

### Antes de Ativar Fase 2:
- [ ] Fase 1 está estável há pelo menos 24h
- [ ] CPU < 15% em idle
- [ ] Sem logs de erro no console
- [ ] Notificações chegando em < 3s
- [ ] Zero reconexões anormais

### Antes de Ativar Fase 3:
- [ ] Fase 2 está estável há pelo menos 24h
- [ ] Presença online funcionando corretamente
- [ ] Heartbeat funcionando (💓 no console a cada 30s)
- [ ] Bolinhas verde/cinza aparecendo corretamente
- [ ] CPU ainda < 15%

### Antes de Ativar Fase 4:
- [ ] Fase 3 está estável há pelo menos 24h
- [ ] Chat instantâneo funcionando
- [ ] Som de mensagens funcionando
- [ ] Read receipts funcionando
- [ ] CPU ainda < 15%
- [ ] Componentes identificados para integração

---

## 🎉 SUCESSO COMPLETO

Quando todas as 4 fases estiverem ativas e estáveis:

```
✅ Notificações instantâneas
✅ Presença online funcionando
✅ Chat em tempo real
✅ Live updates funcionando
✅ CPU < 15%
✅ Latência < 3s
✅ Zero loops ou travamentos
✅ 1000+ usuários satisfeitos
```

**SISTEMA 100% COMPLETO E FUNCIONANDO! 🚀**

---

**Gerado em:** 23 de Outubro de 2025  
**Versão do Sistema:** 2.0  
**Status:** Pronto para ativação gradual
