# 🔊 Como Adicionar o Som de Notificação

O sistema de notificações realtime está configurado para tocar um som quando uma nova notificação chega. Para isso funcionar, você precisa adicionar um arquivo de áudio.

## 📁 Local do arquivo

O arquivo deve estar em: `/public/sounds/notification.mp3`

## 🎵 Opções para obter o som

### Opção 1: Download de Sons Gratuitos

Visite um destes sites e baixe um som curto e agradável:

1. **Notification Sounds** (recomendado)
   - https://notificationsounds.com/
   - Filtrar por "Short" e "Pleasant"
   - Baixar em formato MP3

2. **Freesound**
   - https://freesound.org/
   - Buscar por "notification sound"
   - Escolher Creative Commons

3. **Zapsplat**
   - https://www.zapsplat.com/sound-effect-categories/notification-sounds/
   - Registro gratuito necessário

### Opção 2: Usar Sons do Sistema

Você pode converter sons do seu sistema operacional:

**macOS:**
```bash
afconvert /System/Library/Sounds/Hero.aiff -d LEI16 -f WAVE public/sounds/notification.mp3
```

**Windows:**
Copiar de `C:\Windows\Media\` e converter para MP3 usando um conversor online.

### Opção 3: Gerar com IA

Use ferramentas de IA para gerar:
- https://elevenlabs.io/sound-effects
- https://www.soundraw.io/

## 📝 Especificações Recomendadas

- **Formato:** MP3
- **Duração:** 0.5 - 2 segundos
- **Volume:** Moderado (não muito alto)
- **Tipo:** Som curto, agradável, não irritante

## ⚙️ Depois de adicionar o arquivo

1. Coloque o arquivo em `/public/sounds/notification.mp3`
2. O sistema automaticamente usará esse som
3. Para testar: crie uma nova notificação e veja se toca

## 🔇 Desabilitar o Som

Se preferir não usar som, configure no `RealtimeProvider`:

```tsx
<RealtimeProvider enableSound={false}>
  {/* sua aplicação */}
</RealtimeProvider>
```

Ou desabilite apenas para notificações específicas:

```tsx
useRealtimeNotifications({
  enableSound: false,
});
```

## 🎛️ Ajustar Volume

O volume padrão é 50%. Para ajustar, edite em `src/hooks/realtime/useRealtimeNotifications.ts`:

```typescript
audioRef.current.volume = 0.3; // 30%
```

## 🐛 Troubleshooting

**Som não toca:**
1. Verificar se o arquivo existe em `/public/sounds/notification.mp3`
2. Verificar se o formato é MP3 válido
3. Verificar volume do navegador
4. Alguns navegadores bloqueiam autoplay - primeira interação do usuário é necessária

**Som toca muito alto:**
- Reduzir volume no código (ver acima)
- Ou editar o arquivo de áudio em um editor (Audacity, etc)

**Som toca muito baixo:**
- Aumentar volume no código
- Ou amplificar o arquivo de áudio
