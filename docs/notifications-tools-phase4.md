# 🔧 Fase 4: Notificações de Ferramentas/Soluções

## 📋 Visão Geral

Sistema completo de notificações para o módulo de ferramentas e soluções da plataforma, cobrindo todo o ciclo de vida das ferramentas e interações dos usuários.

## 🎯 Eventos Cobertos

### 1. Publicação e Status

#### Nova Ferramenta Publicada
- **Trigger**: `notify_new_tool_published()`
- **Tipo**: `tool_new_published`
- **Quando**: Ferramenta muda para `published = true`
- **Destinatários**: Todos usuários ativos
- **Metadata**:
  ```json
  {
    "tool_id": "uuid",
    "tool_name": "string",
    "category": "string"
  }
  ```

#### Ferramenta Aprovada
- **Trigger**: `notify_tool_approved()`
- **Tipo**: `tool_approved`
- **Quando**: Status muda de `pending` para `approved`
- **Destinatários**: Criador da ferramenta
- **Metadata**:
  ```json
  {
    "tool_id": "uuid",
    "tool_name": "string",
    "category": "string"
  }
  ```

#### Ferramenta Rejeitada
- **Trigger**: `notify_tool_rejected()`
- **Tipo**: `tool_rejected`
- **Quando**: Status muda de `pending` para `rejected`
- **Destinatários**: Criador da ferramenta
- **Metadata**:
  ```json
  {
    "tool_id": "uuid",
    "tool_name": "string",
    "rejection_reason": "string"
  }
  ```

### 2. Atualizações

#### Ferramenta Atualizada
- **Trigger**: `notify_tool_updated()`
- **Tipo**: `tool_updated`
- **Quando**: Mudanças em `description`, `features` ou `url`
- **Destinatários**: Usuários que favoritaram a ferramenta
- **Metadata**:
  ```json
  {
    "tool_id": "uuid",
    "tool_name": "string",
    "category": "string"
  }
  ```

### 3. Comentários e Interações

#### Novo Comentário
- **Trigger**: `notify_tool_new_comment()`
- **Tipo**: `tool_new_comment`
- **Quando**: Novo comentário (não-resposta) em ferramenta
- **Destinatários**: 
  - Criador da ferramenta (se não for o autor do comentário)
  - Usuários que favoritaram (exceto autor do comentário e criador)
- **Metadata**:
  ```json
  {
    "tool_id": "uuid",
    "tool_name": "string",
    "comment_id": "uuid"
  }
  ```

#### Resposta a Comentário
- **Trigger**: `notify_tool_comment_reply()`
- **Tipo**: `tool_comment_reply`
- **Quando**: Resposta a um comentário existente
- **Destinatários**: Autor do comentário original (se não for o mesmo)
- **Metadata**:
  ```json
  {
    "tool_id": "uuid",
    "tool_name": "string",
    "comment_id": "uuid",
    "parent_comment_id": "uuid"
  }
  ```

### 4. Recomendações

#### Recomendações Semanais
- **Edge Function**: `process-tool-recommendations`
- **RPC**: `process_tool_recommendations()`
- **Tipo**: `tool_recommendations`
- **Quando**: Executada semanalmente via cron
- **Destinatários**: Usuários ativos com favoritos que não receberam recomendações nos últimos 7 dias
- **Metadata**:
  ```json
  {
    "recommendations": [
      {
        "tool_id": "uuid",
        "tool_name": "string",
        "category": "string"
      }
    ],
    "count": number
  }
  ```

## 🔄 Funções do Banco de Dados

### RPC: `recommend_tools_for_user(p_user_id UUID)`

Recomenda até 5 ferramentas baseadas nos interesses do usuário.

**Lógica**:
1. Identifica categorias de ferramentas favoritadas pelo usuário
2. Busca ferramentas populares nas mesmas categorias
3. Exclui ferramentas já favoritadas
4. Ordena por score de relevância (popularidade)

**Retorno**:
```sql
TABLE(
  tool_id UUID,
  tool_name TEXT,
  category TEXT,
  relevance_score INTEGER
)
```

### RPC: `process_tool_recommendations()`

Processa recomendações semanais para todos os usuários elegíveis.

**Critérios de Elegibilidade**:
- Status ativo
- Possui pelo menos um favorito
- Não recebeu recomendações nos últimos 7 dias

**Retorno**:
```sql
TABLE(
  user_id UUID,
  recommendations_count INTEGER
)
```

## 🚀 Edge Functions

### `process-tool-recommendations`

**Propósito**: Executar recomendações semanais de ferramentas

**Configuração de Cron**: Sugerida para domingo às 10h
```toml
[functions.process-tool-recommendations]
schedule = "0 10 * * 0"  # Domingo 10h
```

**Endpoint**: `https://<project>.supabase.co/functions/v1/process-tool-recommendations`

**Response**:
```json
{
  "success": true,
  "summary": {
    "users_notified": 42,
    "total_recommendations": 168,
    "execution_time_ms": 1234
  },
  "details": [
    {
      "user_id": "uuid",
      "recommendations_count": 4
    }
  ],
  "timestamp": "2025-10-22T10:00:00.000Z"
}
```

## 📊 Estrutura de Metadata por Tipo

### Tabela de Referência Rápida

| Tipo | Campos Principais | Link de Ação |
|------|-------------------|--------------|
| `tool_new_published` | tool_id, tool_name, category | `/ferramentas/{tool_id}` |
| `tool_approved` | tool_id, tool_name, category | `/ferramentas/{tool_id}` |
| `tool_rejected` | tool_id, tool_name, rejection_reason | `/ferramentas/minhas` |
| `tool_updated` | tool_id, tool_name, category | `/ferramentas/{tool_id}` |
| `tool_new_comment` | tool_id, tool_name, comment_id | `/ferramentas/{tool_id}#comment-{comment_id}` |
| `tool_comment_reply` | tool_id, tool_name, comment_id, parent_comment_id | `/ferramentas/{tool_id}#comment-{comment_id}` |
| `tool_recommendations` | recommendations[], count | `/ferramentas/explorar` |

## 🎨 Exemplos de Uso no Frontend

### Renderizar Notificação de Nova Ferramenta

```typescript
function renderToolNotification(notification: Notification) {
  const { type, title, message, metadata } = notification;
  
  switch(type) {
    case 'tool_new_published':
      return (
        <NotificationCard
          icon={<Wrench />}
          title={title}
          message={message}
          link={`/ferramentas/${metadata.tool_id}`}
          badge={metadata.category}
        />
      );
      
    case 'tool_updated':
      return (
        <NotificationCard
          icon={<RefreshCw />}
          title={title}
          message={message}
          link={`/ferramentas/${metadata.tool_id}`}
        />
      );
      
    case 'tool_recommendations':
      return (
        <NotificationCard
          icon={<Sparkles />}
          title={title}
          message={message}
          link="/ferramentas/explorar"
        >
          <ToolRecommendationsList 
            tools={metadata.recommendations} 
          />
        </NotificationCard>
      );
  }
}
```

### Buscar Recomendações Personalizadas

```typescript
async function getPersonalizedRecommendations(userId: string) {
  const { data, error } = await supabase
    .rpc('recommend_tools_for_user', { p_user_id: userId });
    
  if (error) throw error;
  
  return data; // Array de ferramentas recomendadas
}
```

## 🔐 Segurança e Performance

### Triggers
- ✅ Executam em contexto seguro (SECURITY DEFINER não necessário para triggers)
- ✅ Validam condições antes de criar notificações
- ✅ Evitam notificações duplicadas (self-notifications, duplicatas de favoritos)
- ✅ Otimizados com queries diretas

### RPC Functions
- ✅ SECURITY DEFINER para acesso a todas as tabelas necessárias
- ✅ Limitam recomendações (máx 5 por usuário)
- ✅ Previnem spam (1 notificação por usuário a cada 7 dias)
- ✅ Indexação adequada para queries de popularidade

### Edge Functions
- ✅ Service Role Key para execução privilegiada
- ✅ CORS habilitado
- ✅ Logging detalhado
- ✅ Error handling robusto

## 📈 Métricas e Monitoramento

### KPIs Sugeridos

1. **Taxa de Engajamento**
   - Click-through rate em notificações de novas ferramentas
   - Taxa de favoritos após recomendações

2. **Volume de Notificações**
   - Notificações de comentários por ferramenta
   - Recomendações aceitas vs. rejeitadas

3. **Qualidade das Recomendações**
   - Taxa de favoritos de ferramentas recomendadas
   - Tempo médio até interação

### Queries Úteis

```sql
-- Ferramentas mais comentadas (últimos 7 dias)
SELECT 
  t.name,
  COUNT(tc.id) as comment_count
FROM tools t
LEFT JOIN tool_comments tc ON t.id = tc.tool_id
WHERE tc.created_at > now() - interval '7 days'
GROUP BY t.id, t.name
ORDER BY comment_count DESC
LIMIT 10;

-- Taxa de aceitação de recomendações
SELECT 
  COUNT(DISTINCT user_id) as users_notified,
  COUNT(DISTINCT CASE WHEN read_at IS NOT NULL THEN user_id END) as users_engaged
FROM notifications
WHERE type = 'tool_recommendations'
  AND created_at > now() - interval '30 days';
```

## 🔮 Próximos Passos

### Fase 5: Notificações de Comunidade
- Novos tópicos e respostas
- Menções e tags
- Moderação e destaque
- Gamificação (badges, níveis)

### Melhorias Futuras (Ferramentas)
1. **Machine Learning para Recomendações**
   - Collaborative filtering
   - Análise de comportamento de uso
   
2. **Notificações de Tendências**
   - Ferramentas em alta
   - Novas categorias populares
   
3. **Alertas de Preço/Disponibilidade**
   - Mudanças em planos/pricing
   - Novas features lançadas

## 📝 Checklist de Implementação

- [x] Triggers de publicação e status
- [x] Triggers de atualizações
- [x] Triggers de comentários
- [x] RPC de recomendações
- [x] Edge function de recomendações
- [x] Documentação completa
- [ ] Testes de integração
- [ ] Configuração de cron job
- [ ] Dashboard de monitoramento
- [ ] Preferências de usuário para cada tipo

## 🤝 Contribuindo

Para adicionar novos tipos de notificação:

1. Crie o trigger/RPC no banco
2. Documente o tipo e metadata aqui
3. Implemente o renderer no frontend
4. Adicione testes
5. Atualize o dashboard de métricas
