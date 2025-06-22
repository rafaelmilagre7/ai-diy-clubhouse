
# Sistema de Convites - Documentação Completa

## Visão Geral

O Sistema de Convites é uma solução completa para gerenciar convites de usuários na plataforma Viver de IA. Suporta múltiplos canais de envio (email e WhatsApp), analytics avançado, monitoramento em tempo real e auditoria completa.

## Arquitetura

### Componentes Principais

1. **Hook de Gerenciamento Principal**
   - `useInvites`: Interface principal para operações CRUD
   - `useInvitesList`: Busca e listagem de convites
   - `useInviteCreate`: Criação de novos convites
   - `useInviteDelete`: Exclusão de convites
   - `useInviteResend`: Reenvio de convites

2. **Sistema de Analytics**
   - `useAdvancedInviteAnalytics`: Analytics completo
   - `useOptimizedAnalytics`: Analytics otimizado com cache
   - `useInviteAnalytics`: Analytics básico

3. **Monitoramento e Cache**
   - `useRealTimeMonitoring`: Monitoramento em tempo real
   - `useInviteCache`: Sistema de cache otimizado
   - `useInviteAudit`: Sistema de auditoria

### Fluxo de Dados

```
Criação de Convite → Validação → Armazenamento → Orquestrador → Entrega → Tracking → Analytics
```

## Funcionalidades

### 1. Criação de Convites

**Parâmetros Suportados:**
- Email (obrigatório)
- Role ID (obrigatório)
- Canais de envio (email, whatsapp, ou ambos)
- Número do WhatsApp (opcional)
- Nome da pessoa (obrigatório para WhatsApp)
- Data de expiração (padrão: 7 dias)
- Notas (opcional)

**Validações:**
- Email único (detecta variações como +tags)
- Nome obrigatório para WhatsApp
- Role válido
- Formato de email correto

**Exemplo de Uso:**
```typescript
const { createInvite } = useInvites();

await createInvite({
  email: 'usuario@exemplo.com',
  roleId: 'role-id',
  channels: ['email', 'whatsapp'],
  whatsappNumber: '+5511999999999',
  userName: 'João Silva',
  expiresIn: '7 days',
  notes: 'Convite para novo membro'
});
```

### 2. Sistema de Entrega Multicanal

#### Email
- Integração com Resend
- Templates responsivos
- Tracking de abertura e cliques
- Fallback para HTML simples

#### WhatsApp
- Integração com WhatsApp Business API
- Templates aprovados
- Confirmação de entrega
- Fallback para SMS (futuro)

### 3. Analytics e Relatórios

#### Métricas Principais
- **Funil de Conversão**: Enviado → Entregue → Aberto → Clicado → Registrado → Ativo
- **Performance por Canal**: Taxa de conversão, tempo médio, custo, ROI
- **Segmentação**: Por role, por fonte, por período
- **Padrões Temporais**: Melhores horários, dias da semana

#### Visualizações
- Gráficos de funil
- Comparação de canais
- Análise temporal
- Tabelas de segmentação

### 4. Monitoramento em Tempo Real

#### Métricas Monitoradas
- Convites ativos
- Entregas pendentes
- Falhas de entrega
- Taxa de sucesso geral
- Tempo de resposta médio
- Status de saúde do sistema

#### Sistema de Alertas
- Alertas automáticos para falhas críticas
- Notificações de baixa performance
- Monitoramento de integrações
- Health checks automáticos

### 5. Sistema de Auditoria

#### Dados Rastreados
- Todas as operações CRUD
- Tentativas de entrega
- Mudanças de status
- Logs de erro
- Atividade de usuários

#### Relatórios de Auditoria
- Log completo de atividades
- Análise de falhas
- Histórico de mudanças
- Relatórios de compliance

## Configuração

### Variáveis de Ambiente

```env
# Resend (Email)
RESEND_API_KEY=re_xxxxxxxxx

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=xxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=xxxxxxxxx

# Configurações do Sistema
INVITE_DEFAULT_EXPIRATION=7d
INVITE_MAX_ATTEMPTS=3
```

### Configuração do Banco de Dados

O sistema utiliza as seguintes tabelas:

1. **invites**: Convites principais
2. **invite_deliveries**: Rastreamento de entregas
3. **communication_preferences**: Preferências dos usuários
4. **user_roles**: Papéis de usuário

### Configuração do Supabase Edge Functions

O sistema utiliza edge functions para:

- **invite-orchestrator**: Orquestração de envios
- **email-sender**: Envio de emails
- **whatsapp-sender**: Envio via WhatsApp

## Troubleshooting

### Problemas Comuns

#### 1. Convite não enviado
**Sintomas**: Convite criado mas não entregue
**Possíveis Causas**:
- Configuração incorreta de API keys
- Email/WhatsApp inválido
- Limite de rate limit atingido

**Solução**:
```typescript
// Verificar logs do orquestrador
const { data } = await supabase.functions.invoke('invite-orchestrator', {
  body: { debug: true, inviteId: 'xxx' }
});
```

#### 2. Analytics não carregando
**Sintomas**: Dashboard vazio ou com erro
**Possíveis Causas**:
- Dados insuficientes
- Query timeout
- Problemas de cache

**Solução**:
```typescript
// Limpar cache e recarregar
const { clearInviteCache } = useInviteCache();
clearInviteCache();
```

#### 3. Monitoramento desconectado
**Sintomas**: Status "Desconectado" no dashboard
**Possíveis Causas**:
- Problema de conexão com Supabase
- Subscriptions bloqueadas
- Limite de conexões

**Solução**:
- Verificar status do Supabase
- Reiniciar subscriptions
- Verificar configurações de RLS

### Logs e Debugging

#### Ativar Logs Detalhados
```typescript
// No desenvolvimento
localStorage.setItem('debug-invites', 'true');

// Logs específicos
console.log('[INVITE-DEBUG]', data);
```

#### Monitorar Performance
```typescript
// Hook para monitoramento
const { metrics } = useRealTimeMonitoring();
console.log('System Health:', metrics.systemHealth);
```

## Best Practices

### 1. Criação de Convites
- Sempre validar email antes do envio
- Usar nomes descritivos em notas
- Configurar expiração apropriada
- Testar com dados de desenvolvimento

### 2. Monitoramento
- Verificar dashboard diariamente
- Configurar alertas para falhas críticas
- Revisar analytics semanalmente
- Manter logs por pelo menos 30 dias

### 3. Performance
- Usar cache para dados frequentes
- Implementar paginação para listas grandes
- Otimizar queries com índices
- Configurar timeouts apropriados

### 4. Segurança
- Validar todos os inputs
- Implementar rate limiting
- Usar HTTPS para todos os endpoints
- Criptografar dados sensíveis

## Roadmap

### Próximas Funcionalidades
- [ ] Templates personalizáveis
- [ ] Integração com Slack
- [ ] Analytics preditivo
- [ ] Automação de campanhas
- [ ] API pública
- [ ] Webhooks
- [ ] Multi-idioma
- [ ] A/B testing

### Melhorias Planejadas
- [ ] Performance otimizada
- [ ] Interface mobile nativa
- [ ] Relatórios exportáveis
- [ ] Dashboard executivo
- [ ] Integração com CRM
- [ ] Machine Learning para otimização

## Suporte

Para suporte técnico:
1. Verificar este documento
2. Consultar logs do sistema
3. Usar ferramentas de debugging
4. Entrar em contato com a equipe técnica

## Changelog

### v2.0.0 (Atual)
- Sistema completo de multicanal
- Analytics avançado
- Monitoramento em tempo real
- Sistema de auditoria
- Interface otimizada

### v1.0.0
- Sistema básico de convites por email
- CRUD básico
- Analytics simples
