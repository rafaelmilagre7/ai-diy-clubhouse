# ⚡ Implementação Completa de Notificações Realtime

## 📊 O que foi implementado

### 1. **Infraestrutura Base** ✅

#### `useRealtimeConnection`
Hook fundamental para gerenciar conexões WebSocket com Supabase:
- ✅ Conexão via Supabase Realtime (WebSockets)
- ✅ Canais individuais por usuário
- ✅ Heartbeat a cada 30 segundos para manter conexão
- ✅ Reconexão automática com backoff exponencial
- ✅ Monitoramento de status (conectado/desconectado/reconectando)
- ✅ Logging detalhado para debugging

**Características:**
- Heartbeat automático: mantém conexão ativa
- Backoff exponencial: 1s → 2s → 4s → ... até 30s
- Cleanup automático ao desmontar componente
- Status em tempo real da conexão

### 2. **Notificações Instantâneas** ✅

#### `useRealtimeNotifications`
Sistema completo de notificações em tempo real:
- ✅ Toast animado quando nova notificação chega
- ✅ Som opcional (configurável) em `/sounds/notification.mp3`
- ✅ Badge counter atualizado automaticamente
- ✅ Preview completo da notificação no toast
- ✅ Notificações desktop (com permissão)
- ✅ Ação "Ver" para marcar como lida

**Eventos detectados:**
- `INSERT`: Nova notificação → toast + som + desktop
- `UPDATE`: Notificação atualizada → invalidar cache
- `DELETE`: Notificação removida → invalidar cache

**Configuração:**
```typescript
useRealtimeNotifications({
  enableSound: true,
  enableDesktopNotifications: true,
  onNotification: (notif) => console.log(notif),
});
```

### 3. **Indicadores de Presença** ✅

#### `usePresence`
Sistema de presença online/offline:
- ✅ Status online/offline dos usuários
- ✅ "Última vez online" com timestamp
- ✅ Atualização automática a cada 30 segundos
- ✅ Sincronização entre todos os clientes
- ✅ Helpers para verificar status

#### `OnlineIndicator` Component
Bolinha verde/cinza indicando status:
- ✅ Tamanhos: sm, md, lg
- ✅ Tooltip com "Online agora" ou "Visto há X"
- ✅ Animação suave
- ✅ Cores do design system

#### `OnlineUsersList` Component
Lista completa de quem está online:
- ✅ Avatar + nome
- ✅ Indicador de online
- ✅ Badge com contagem total
- ✅ Scroll para muitos usuários
- ✅ Animação de pulso no badge

**API:**
```typescript
const {
  isUserOnline,
  getUserLastSeen,
  getOnlineUsersList,
  getOnlineCount,
  updatePresence,
} = usePresence();
```

### 4. **Badge de Notificações** ✅

#### `RealtimeNotificationsBadge`
Ícone de sino com contador:
- ✅ Badge vermelho com contagem de não lidas
- ✅ Atualização em tempo real via WebSocket
- ✅ Indicador verde de conexão (bolinha pulsante)
- ✅ Animação ao receber novas notificações
- ✅ Fallback para polling a cada 30s

### 5. **Provider Global** ✅

#### `RealtimeProvider`
Contexto global para gerenciar realtime:
- ✅ Configuração centralizada
- ✅ Habilitar/desabilitar notificações e presença
- ✅ Configurar som e notificações desktop
- ✅ Acesso via hook `useRealtime()`

## 🚀 Como usar

### 1. Configurar SQL para Realtime

Execute este SQL no Supabase para habilitar realtime:

```sql
-- Habilitar realtime na tabela notifications
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Verificar se está habilitado
SELECT schemaname, tablename, rulename
FROM pg_rules
WHERE tablename = 'notifications';
```

### 2. Adicionar Provider na aplicação

Em `src/App.tsx` ou `src/main.tsx`:

```tsx
import { RealtimeProvider } from '@/contexts/RealtimeProvider';

function App() {
  return (
    <RealtimeProvider
      enableNotifications={true}
      enablePresence={true}
      enableSound={true}
      enableDesktopNotifications={true}
    >
      {/* Resto da aplicação */}
    </RealtimeProvider>
  );
}
```

### 3. Usar Badge de Notificações

Em qualquer componente (ex: Header):

```tsx
import { RealtimeNotificationsBadge } from '@/components/realtime/RealtimeNotificationsBadge';

function Header() {
  return (
    <div>
      <RealtimeNotificationsBadge 
        onClick={() => {
          // Abrir painel de notificações
        }}
      />
    </div>
  );
}
```

### 4. Mostrar Indicador de Online

Em cards de usuários, perfis, etc:

```tsx
import { OnlineIndicator } from '@/components/realtime/OnlineIndicator';
import { Avatar } from '@/components/ui/avatar';

function UserCard({ user }) {
  return (
    <div className="relative">
      <Avatar src={user.avatar} />
      <OnlineIndicator 
        userId={user.id}
        size="md"
        className="absolute bottom-0 right-0"
      />
    </div>
  );
}
```

### 5. Mostrar Lista de Online

Em sidebar, networking, etc:

```tsx
import { OnlineUsersList } from '@/components/realtime/OnlineUsersList';

function NetworkingSidebar() {
  return (
    <div>
      <OnlineUsersList />
    </div>
  );
}
```

### 6. Usar hooks diretamente

Para casos avançados:

```tsx
import { usePresence } from '@/hooks/realtime/usePresence';

function MyComponent() {
  const { 
    isUserOnline, 
    getOnlineCount,
    updatePresence 
  } = usePresence();

  const online = isUserOnline('user-id-123');
  const total = getOnlineCount();

  return (
    <div>
      <p>Usuário está: {online ? 'Online' : 'Offline'}</p>
      <p>Total online: {total}</p>
    </div>
  );
}
```

## 🎨 Recursos Visuais

### Toast de Notificação
Quando uma notificação chega:
- ✅ Emoji da categoria (💡, 🤝, 🏆, etc)
- ✅ Título da notificação
- ✅ Descrição/mensagem
- ✅ Botão "Ver" para marcar como lida
- ✅ Duração de 5 segundos
- ✅ Som de notificação (se habilitado)

### Badge de Contador
No ícone de sino:
- ✅ Badge vermelho com número
- ✅ Máximo "99+"
- ✅ Animação zoom-in ao aparecer
- ✅ Bolinha verde pulsante (conexão ativa)

### Indicador de Online
Bolinha no avatar:
- ✅ Verde = online agora
- ✅ Cinza = offline
- ✅ Tooltip com última vez vista
- ✅ Atualização em tempo real

### Lista de Online
Card com usuários online:
- ✅ Avatar + nome
- ✅ Indicador de status
- ✅ Badge com contagem
- ✅ Scroll para muitos usuários
- ✅ Hover effect nos cards

## 🔊 Som de Notificação

O sistema usa `/sounds/notification.mp3`. Opções:

1. **Gerar online:**
   - https://notificationsounds.com/
   - https://freesound.org/

2. **Usar biblioteca:**
   ```bash
   npm install notification-sounds
   ```

3. **Desabilitar som:**
   ```tsx
   <RealtimeProvider enableSound={false}>
   ```

## 🖥️ Notificações Desktop

### Pedir Permissão:
O sistema pede automaticamente ao montar. Para forçar:

```typescript
if ('Notification' in window) {
  Notification.requestPermission();
}
```

### Status da permissão:
- `default`: Ainda não pediu
- `granted`: Permitido
- `denied`: Negado

## 📊 Monitoramento e Debug

### Logs no Console:
Todos os logs começam com emojis para fácil identificação:

- `🔌 [REALTIME]` - Conexão
- `🫀 [REALTIME]` - Heartbeat
- `💓 [REALTIME]` - Heartbeat iniciado
- `💔 [REALTIME]` - Heartbeat parado
- `🔄 [REALTIME]` - Reconexão
- `🔔 [REALTIME]` - Nova notificação
- `👤 [PRESENCE]` - Presença atualizada
- `👋 [PRESENCE]` - Join/Leave
- `✅ [...]` - Sucesso
- `❌ [...]` - Erro
- `⚠️ [...]` - Aviso

### Verificar Status:
```typescript
const { status } = useRealtimeConnection({ channelName: 'test' });

console.log({
  isConnected: status.isConnected,
  isReconnecting: status.isReconnecting,
  lastHeartbeat: status.lastHeartbeat,
  reconnectAttempts: status.reconnectAttempts,
});
```

## 🔧 Configurações Avançadas

### Customizar Heartbeat:
```typescript
useRealtimeConnection({
  channelName: 'my-channel',
  heartbeatInterval: 60000, // 60 segundos
});
```

### Callbacks customizados:
```typescript
useRealtimeNotifications({
  onNotification: (notif) => {
    // Lógica customizada
    console.log('Nova notificação:', notif);
    
    // Enviar para analytics
    analytics.track('notification_received', notif);
  },
});
```

### Presença com dados extras:
```typescript
const { updatePresence } = usePresence();

updatePresence({
  status: 'Em reunião',
  custom_field: 'valor',
});
```

## 🐛 Troubleshooting

**Notificações não aparecem:**
- Verificar se tabela `notifications` tem REPLICA IDENTITY FULL
- Verificar se está na publication: `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';`
- Verificar logs no console
- Verificar se `user_id` está correto no filter

**Som não toca:**
- Verificar se arquivo existe em `/public/sounds/notification.mp3`
- Verificar volume do navegador
- Alguns navegadores bloqueiam autoplay de áudio

**Indicador de online não atualiza:**
- Verificar se `RealtimeProvider` está envolvendo a aplicação
- Verificar logs de `[PRESENCE]`
- Verificar conexão no status

**Badge não atualiza:**
- Verificar query `unread-count`
- Verificar invalidações do React Query
- Verificar logs de `[REALTIME]`

## 📈 Próximos Passos

Para completar a fase 2:

1. **Chat em Tempo Real** (2.4):
   - [ ] Criar tabela `messages`
   - [ ] Hook `useRealtimeChat`
   - [ ] Indicador "digitando..."
   - [ ] Confirmação de leitura

2. **Atualizações ao Vivo** (2.5):
   - [ ] Comentários em tempo real
   - [ ] Likes/reações atualizados
   - [ ] Contador de visualizações
   - [ ] Status de aprovação instantâneo

3. **Otimizações**:
   - [ ] Debounce em presença
   - [ ] Throttle em atualizações frequentes
   - [ ] Compressão de dados
   - [ ] Lazy loading de presença

## 🎯 Checklist de Implementação

- [x] Infraestrutura Base (2.1)
  - [x] WebSockets com Supabase Realtime
  - [x] Canais por usuário
  - [x] Heartbeat automático
  - [x] Reconexão automática

- [x] Notificações Instantâneas (2.2)
  - [x] Toast animado
  - [x] Som opcional
  - [x] Badge counter
  - [x] Preview no toast

- [x] Indicadores de Presença (2.3)
  - [x] Status online/offline
  - [x] Última vez online
  - [x] Indicador visual (bolinha)
  - [x] Lista de online

- [ ] Chat em Tempo Real (2.4)
  - [ ] Mensagens instantâneas
  - [ ] Indicador "digitando..."
  - [ ] Confirmação de leitura
  - [ ] Notificação desktop

- [ ] Atualizações ao Vivo (2.5)
  - [ ] Comentários
  - [ ] Likes
  - [ ] Visualizações
  - [ ] Status
