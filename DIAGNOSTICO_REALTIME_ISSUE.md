# 🔍 Diagnóstico: Problema com Sistema Realtime

## 🚨 Status Atual

**REALTIME TEMPORARIAMENTE DESABILITADO** para parar loops infinitos e diagnosticar.

## 📋 Descobertas

### 1. Estrutura Real do Banco
✅ Tabelas que **EXISTEM**:
- `notifications` - ✅ Com REPLICA IDENTITY FULL
- `conversations` - ✅ Com REPLICA IDENTITY FULL  
- `direct_messages` - ✅ Com REPLICA IDENTITY FULL
- `message_reactions` - ✅ Com REPLICA IDENTITY FULL
- `network_connections` - ✅ Com REPLICA IDENTITY FULL
- `profiles` - ✅ Com REPLICA IDENTITY FULL

❌ Tabelas que **NÃO EXISTEM** (mas hooks tentam usar):
- `messages` - NÃO EXISTE (usa `direct_messages`)
- `conversation_participants` - NÃO EXISTE (usa `participant_1_id` e `participant_2_id` em `conversations`)

### 2. Publicação Realtime
✅ Tabelas na publicação `supabase_realtime`:
- notifications ✅
- conversations ✅
- direct_messages ✅
- profiles ✅
- E muitas outras...

### 3. Problemas Identificados

#### A. Hooks Usando Tabelas Erradas
Os hooks de chat foram criados para tabelas que não existem:
- `useRealtimeChat` procura por `messages` (deveria ser `direct_messages`)
- `useRealtimeChat` procura por `conversation_participants` (não existe)

#### B. Loops de Reconexão
Logs mostram loops constantes:
```
🔌 Conectando...
📊 Status: CLOSED
⚠️ Canal fechado
🔄 Reconectando em 8000ms (tentativa 3)
```

#### C. Múltiplas Instâncias
Os logs mostram que as mensagens aparecem duplicadas, sugerindo que há múltiplas instâncias dos hooks rodando.

## 🎯 Causas Raiz

### 1. **Schema Mismatch**
Os hooks foram desenvolvidos assumindo um schema que não existe no banco.

### 2. **Dependências Circulares** (CORRIGIDAS PARCIALMENTE)
Fizemos correções mas ainda pode haver problemas:
- useEffect dependencies causando re-renders
- Callbacks sendo recriados constantemente

### 3. **Canal sendo Recriado**
O canal pode estar sendo recriado a cada render porque:
- O `channelName` está mudando
- Os handlers estão sendo recriados
- A conexão não está estável

## 💡 Solução Proposta

### Fase 1: Estabilizar o Básico (AGORA)
1. ✅ Desabilitar TUDO temporariamente
2. 🔄 Criar hook simples APENAS para notificações
3. 🔄 Testar se funciona SEM loops
4. 🔄 Se funcionar, adicionar presença
5. 🔄 Por último, adaptar chat para usar schema correto

### Fase 2: Reconstruir Chat (DEPOIS)
1. Adaptar para usar `direct_messages` ao invés de `messages`
2. Remover dependência de `conversation_participants`
3. Criar lógica para "digitando..." diferente (talvez usando presence API)

### Fase 3: Live Updates (POR ÚLTIMO)
1. Criar hooks para tabelas que realmente existem
2. Testar um por um

## 🧪 Plano de Teste

### Teste 1: Notificações Básicas
```typescript
// Hook minimalista
export function useBasicNotifications() {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase.channel(`notif-${user.id}`);
    
    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Nova notificação:', payload);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]); // APENAS user.id, nada mais
}
```

Se este hook funcionar SEM loops, o problema não é do Supabase, é da nossa implementação.

### Teste 2: Verificar Conexão
Abrir DevTools Network e ver se WebSocket fica aberto ou fecha/reabre.

## 🔧 Próximos Passos

1. **AGORA**: Testar sistema com realtime DESABILITADO
   - Verificar se aplicação fica rápida
   - Confirmar que loops pararam

2. **DEPOIS**: Implementar hook minimalista de notificações
   - Sem RealtimeProvider
   - Sem abstrações
   - Direto no componente

3. **SE FUNCIONAR**: Expandir gradualmente
   - Adicionar presença
   - Adaptar chat

4. **SE NÃO FUNCIONAR**: Problema é mais profundo
   - Verificar config Supabase
   - Verificar limitações Lovable
   - Considerar alternativa (polling?)

## ⏱️ Métricas de Sucesso

**Sistema deve ter**:
- ✅ CPU < 15% em idle
- ✅ 0 loops de reconexão (apenas 1 conexão por canal)
- ✅ WebSocket permanece aberto
- ✅ Notificações chegam em < 2s
- ✅ Sem travamentos

**Atualmente**:
- ❌ CPU 80-100%
- ❌ Centenas de reconexões/minuto
- ❌ WebSocket fecha/reabre constantemente
- ❌ Sistema travando

---

**Status**: 🔴 DIAGNOSTICANDO  
**Prioridade**: 🔴 CRÍTICA  
**Bloqueador**: Sistema inutilizável com realtime ativo
