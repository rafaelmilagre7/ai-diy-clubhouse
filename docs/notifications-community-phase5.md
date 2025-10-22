# 💬 Fase 5: Notificações de Comunidade

## 📋 Visão Geral

Sistema completo de notificações para o módulo de comunidade, cobrindo interações sociais, moderação, gamificação e engajamento.

## 🎯 Eventos Cobertos

### 1. Interações em Tópicos

#### Nova Resposta no Tópico do Usuário
- **Trigger**: `notify_community_topic_reply()`
- **Tipo**: `community_topic_reply`
- **Quando**: Alguém responde em tópico criado pelo usuário
- **Destinatários**: Criador do tópico (exceto se for o autor da resposta)
- **Metadata**:
  ```json
  {
    "topic_id": "uuid",
    "topic_title": "string",
    "post_id": "uuid"
  }
  ```

#### Atividade em Tópico que Participa
- **Trigger**: `notify_community_topic_reply()`
- **Tipo**: `community_topic_activity`
- **Quando**: Nova resposta em tópico onde o usuário já comentou
- **Destinatários**: Participantes do tópico (exceto autor da nova resposta e criador do tópico)
- **Metadata**:
  ```json
  {
    "topic_id": "uuid",
    "topic_title": "string",
    "post_id": "uuid"
  }
  ```

#### Resposta a Comentário Específico
- **Trigger**: `notify_community_post_reply()`
- **Tipo**: `community_post_reply`
- **Quando**: Alguém responde diretamente a um comentário do usuário
- **Destinatários**: Autor do comentário original (se não for o mesmo)
- **Metadata**:
  ```json
  {
    "topic_id": "uuid",
    "topic_title": "string",
    "post_id": "uuid",
    "parent_post_id": "uuid"
  }
  ```

### 2. Menções e Reconhecimento

#### Menção de Usuário (@username)
- **Trigger**: `notify_user_mention()`
- **Tipo**: `community_mention`
- **Quando**: Usuário é mencionado com @username em um post
- **Destinatários**: Usuário mencionado (se não for auto-menção)
- **Metadata**:
  ```json
  {
    "topic_id": "uuid",
    "topic_title": "string",
    "post_id": "uuid"
  }
  ```

#### Post Curtido (Milestones)
- **Trigger**: `notify_post_liked()`
- **Tipo**: `community_post_liked`
- **Quando**: Post alcança milestone de likes (1, 5, 10, 25, 50, 100)
- **Destinatários**: Autor do post (exceto se curtir o próprio post)
- **Metadata**:
  ```json
  {
    "topic_id": "uuid",
    "topic_title": "string",
    "post_id": "uuid",
    "like_count": number
  }
  ```

### 3. Soluções e Status

#### Resposta Aceita como Solução
- **Trigger**: `notify_topic_solved()`
- **Tipo**: `community_solution_accepted`
- **Quando**: Resposta do usuário é marcada como solução
- **Destinatários**: Autor da resposta (se não for o criador do tópico)
- **Metadata**:
  ```json
  {
    "topic_id": "uuid",
    "topic_title": "string",
    "post_id": "uuid"
  }
  ```

#### Tópico Solucionado
- **Trigger**: `notify_topic_solved()`
- **Tipo**: `community_topic_solved`
- **Quando**: Tópico é marcado como solucionado
- **Destinatários**: Participantes do tópico (exceto criador e autor da solução)
- **Metadata**:
  ```json
  {
    "topic_id": "uuid",
    "topic_title": "string",
    "solution_post_id": "uuid"
  }
  ```

### 4. Moderação e Destaque

#### Tópico Fixado/Destacado
- **Trigger**: `notify_topic_pinned()`
- **Tipo**: `community_topic_pinned`
- **Quando**: Tópico é fixado pela moderação
- **Destinatários**: Criador do tópico
- **Metadata**:
  ```json
  {
    "topic_id": "uuid",
    "topic_title": "string"
  }
  ```

#### Conteúdo Moderado/Removido
- **Trigger**: `notify_content_moderated()`
- **Tipo**: `community_content_moderated`
- **Quando**: Post/comentário é removido pela moderação
- **Destinatários**: Autor do conteúdo
- **Metadata**:
  ```json
  {
    "topic_id": "uuid",
    "post_id": "uuid",
    "moderation_reason": "string"
  }
  ```

### 5. Digest e Resumos

#### Digest Semanal
- **Edge Function**: `process-community-digest`
- **RPC**: `process_community_digest()`
- **Tipo**: `community_weekly_digest`
- **Quando**: Executada semanalmente via cron
- **Destinatários**: Usuários ativos que não receberam digest nos últimos 6 dias
- **Metadata**:
  ```json
  {
    "topics": [
      {
        "topic_id": "uuid",
        "topic_title": "string",
        "replies_count": number,
        "views_count": number
      }
    ],
    "count": number,
    "period": "last_7_days"
  }
  ```

### 6. Gamificação

#### Conquista Desbloqueada
- **RPC**: `notify_community_achievement()`
- **Tipo**: `community_achievement`
- **Quando**: Chamada manual quando usuário desbloqueia conquista
- **Destinatários**: Usuário que conquistou
- **Metadata**:
  ```json
  {
    "achievement_type": "string",
    "achievement_name": "string",
    "achievement_description": "string"
  }
  ```

## 🔄 Funções do Banco de Dados

### RPC: `process_community_digest()`

Processa digest semanal com top 5 tópicos mais ativos.

**Lógica**:
1. Busca tópicos criados nos últimos 7 dias
2. Ordena por número de respostas (engajamento)
3. Seleciona top 5 tópicos
4. Notifica usuários ativos que não receberam digest nos últimos 6 dias

**Retorno**:
```sql
TABLE(
  user_id UUID,
  topics_count INTEGER,
  top_topics JSONB
)
```

### RPC: `notify_community_achievement(p_user_id, p_achievement_type, p_achievement_name, p_achievement_description)`

Notifica usuário sobre conquista desbloqueada.

**Exemplo de Uso**:
```typescript
await supabase.rpc('notify_community_achievement', {
  p_user_id: userId,
  p_achievement_type: 'helpful_contributor',
  p_achievement_name: 'Contribuidor Prestativo',
  p_achievement_description: 'Tenha 10 respostas marcadas como solução'
});
```

## 🚀 Edge Functions

### `process-community-digest`

**Propósito**: Executar digest semanal da comunidade

**Configuração de Cron**: Sugerida para domingo às 9h
```toml
[functions.process-community-digest]
schedule = "0 9 * * 0"  # Domingo 9h
```

**Endpoint**: `https://<project>.supabase.co/functions/v1/process-community-digest`

**Response**:
```json
{
  "success": true,
  "summary": {
    "users_notified": 156,
    "total_topics": 780,
    "execution_time_ms": 2345
  },
  "details": [
    {
      "user_id": "uuid",
      "topics_count": 5
    }
  ],
  "timestamp": "2025-10-22T09:00:00.000Z"
}
```

## 📊 Estrutura de Metadata por Tipo

### Tabela de Referência Rápida

| Tipo | Campos Principais | Link de Ação |
|------|-------------------|--------------|
| `community_topic_reply` | topic_id, topic_title, post_id | `/comunidade/topico/{topic_id}#post-{post_id}` |
| `community_topic_activity` | topic_id, topic_title, post_id | `/comunidade/topico/{topic_id}#post-{post_id}` |
| `community_post_reply` | topic_id, post_id, parent_post_id | `/comunidade/topico/{topic_id}#post-{post_id}` |
| `community_mention` | topic_id, topic_title, post_id | `/comunidade/topico/{topic_id}#post-{post_id}` |
| `community_post_liked` | topic_id, post_id, like_count | `/comunidade/topico/{topic_id}#post-{post_id}` |
| `community_solution_accepted` | topic_id, topic_title, post_id | `/comunidade/topico/{topic_id}#post-{post_id}` |
| `community_topic_solved` | topic_id, solution_post_id | `/comunidade/topico/{topic_id}` |
| `community_topic_pinned` | topic_id, topic_title | `/comunidade/topico/{topic_id}` |
| `community_content_moderated` | topic_id, post_id, moderation_reason | `/comunidade/diretrizes` |
| `community_weekly_digest` | topics[], count, period | `/comunidade` |
| `community_achievement` | achievement_type, achievement_name | `/perfil/conquistas` |

## 🎨 Exemplos de Uso no Frontend

### Renderizar Notificação de Comunidade

```typescript
function renderCommunityNotification(notification: Notification) {
  const { type, title, message, metadata } = notification;
  
  switch(type) {
    case 'community_topic_reply':
      return (
        <NotificationCard
          icon={<MessageSquare />}
          title={title}
          message={message}
          link={`/comunidade/topico/${metadata.topic_id}#post-${metadata.post_id}`}
        />
      );
      
    case 'community_mention':
      return (
        <NotificationCard
          icon={<AtSign />}
          title={title}
          message={message}
          link={`/comunidade/topico/${metadata.topic_id}#post-${metadata.post_id}`}
          badge="Menção"
        />
      );
      
    case 'community_solution_accepted':
      return (
        <NotificationCard
          icon={<CheckCircle />}
          title={title}
          message={message}
          link={`/comunidade/topico/${metadata.topic_id}#post-${metadata.post_id}`}
          badge="Solução"
          variant="success"
        />
      );
      
    case 'community_post_liked':
      return (
        <NotificationCard
          icon={<Heart />}
          title={title}
          message={message}
          link={`/comunidade/topico/${metadata.topic_id}#post-${metadata.post_id}`}
          badge={`${metadata.like_count} curtidas`}
        />
      );
      
    case 'community_achievement':
      return (
        <NotificationCard
          icon={<Trophy />}
          title={title}
          message={message}
          link="/perfil/conquistas"
          variant="achievement"
        >
          <AchievementBadge 
            type={metadata.achievement_type}
            name={metadata.achievement_name}
            description={metadata.achievement_description}
          />
        </NotificationCard>
      );
      
    case 'community_weekly_digest':
      return (
        <NotificationCard
          icon={<Newspaper />}
          title={title}
          message={message}
          link="/comunidade"
        >
          <TopTopicsList topics={metadata.topics} />
        </NotificationCard>
      );
  }
}
```

### Notificar Conquista Personalizada

```typescript
async function unlockAchievement(userId: string, achievement: Achievement) {
  const { error } = await supabase.rpc('notify_community_achievement', {
    p_user_id: userId,
    p_achievement_type: achievement.type,
    p_achievement_name: achievement.name,
    p_achievement_description: achievement.description
  });
  
  if (error) throw error;
}

// Exemplo de uso ao detectar milestone
async function checkSolutionMilestone(userId: string) {
  const { count } = await supabase
    .from('community_topics')
    .select('*', { count: 'exact', head: true })
    .eq('solution_author_id', userId);
    
  if (count === 10) {
    await unlockAchievement(userId, {
      type: 'helpful_contributor',
      name: 'Contribuidor Prestativo',
      description: 'Tenha 10 respostas marcadas como solução'
    });
  }
}
```

## 🎮 Sistema de Gamificação Sugerido

### Conquistas Básicas

1. **Primeira Contribuição** 
   - Tipo: `first_post`
   - Trigger: Primeiro post criado

2. **Conversador Ativo**
   - Tipo: `active_commenter`
   - Trigger: 50 posts criados

3. **Contribuidor Prestativo**
   - Tipo: `helpful_contributor`
   - Trigger: 10 soluções aceitas

4. **Especialista**
   - Tipo: `expert`
   - Trigger: 50 soluções aceitas

5. **Influenciador**
   - Tipo: `influencer`
   - Trigger: 100 likes recebidos

6. **Mentor**
   - Tipo: `mentor`
   - Trigger: 500 respostas e 25 soluções

### Implementação de Trigger de Conquista

```sql
-- Exemplo: Detectar primeira solução aceita
CREATE OR REPLACE FUNCTION check_first_solution_achievement()
RETURNS TRIGGER AS $$
DECLARE
  solution_count INTEGER;
BEGIN
  IF NEW.is_solved = true AND NEW.solution_post_id IS NOT NULL THEN
    -- Buscar autor da solução
    SELECT COUNT(*) INTO solution_count
    FROM public.community_topics ct
    JOIN public.community_posts cp ON ct.solution_post_id = cp.id
    WHERE cp.user_id = (
      SELECT user_id FROM public.community_posts WHERE id = NEW.solution_post_id
    )
    AND ct.is_solved = true;
    
    -- Se for a primeira solução
    IF solution_count = 1 THEN
      PERFORM notify_community_achievement(
        (SELECT user_id FROM public.community_posts WHERE id = NEW.solution_post_id),
        'first_solution',
        'Primeira Solução',
        'Sua primeira resposta foi marcada como solução!'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 🔐 Segurança e Performance

### Triggers
- ✅ Evitam notificações duplicadas (self-notifications, loops)
- ✅ Validam condições antes de criar notificações
- ✅ Otimizados para minimizar queries
- ✅ Tratam edge cases (deleted users, deleted content)

### Sistema de Menções
- ✅ Regex otimizado para extrair @usernames
- ✅ Valida existência do usuário antes de notificar
- ✅ Previne spam de menções

### Milestones de Likes
- ✅ Notifica apenas em marcos importantes (1, 5, 10, 25, 50, 100)
- ✅ Evita spam de notificação a cada like

### RPC Functions
- ✅ SECURITY DEFINER para acesso privilegiado
- ✅ Limitam resultados (top 5 tópicos no digest)
- ✅ Previnem spam (1 digest por usuário a cada 6 dias)

## 📈 Métricas e Monitoramento

### KPIs Sugeridos

1. **Engajamento**
   - Taxa de resposta a notificações de tópicos
   - Tempo médio de resposta após notificação
   - Taxa de cliques em digest semanal

2. **Qualidade**
   - Taxa de soluções aceitas
   - Distribuição de likes por post
   - Taxa de conteúdo moderado

3. **Atividade**
   - Usuários ativos semanalmente
   - Tópicos criados por usuário
   - Média de respostas por tópico

### Queries Úteis

```sql
-- Top contribuidores (últimos 30 dias)
SELECT 
  p.name,
  COUNT(DISTINCT cp.id) as posts_count,
  COUNT(DISTINCT CASE WHEN ct.solution_post_id = cp.id THEN ct.id END) as solutions_count,
  SUM(cp.like_count) as total_likes
FROM profiles p
JOIN community_posts cp ON p.id = cp.user_id
LEFT JOIN community_topics ct ON ct.solution_post_id = cp.id
WHERE cp.created_at > now() - interval '30 days'
GROUP BY p.id, p.name
ORDER BY solutions_count DESC, posts_count DESC
LIMIT 10;

-- Tópicos mais engajados da semana
SELECT 
  ct.title,
  ct.reply_count,
  ct.view_count,
  ct.is_solved,
  p.name as author
FROM community_topics ct
JOIN profiles p ON ct.user_id = p.id
WHERE ct.created_at > now() - interval '7 days'
ORDER BY ct.reply_count DESC, ct.view_count DESC
LIMIT 20;

-- Taxa de engajamento de notificações
SELECT 
  type,
  COUNT(*) as sent,
  COUNT(CASE WHEN read_at IS NOT NULL THEN 1 END) as read,
  ROUND(COUNT(CASE WHEN read_at IS NOT NULL THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100, 2) as read_rate
FROM notifications
WHERE type LIKE 'community_%'
  AND created_at > now() - interval '30 days'
GROUP BY type
ORDER BY sent DESC;
```

## 🔮 Próximos Passos

### Melhorias Futuras

1. **Notificações Contextuais**
   - Sugerir tópicos baseados em interesses
   - Notificar quando especialistas respondem em área de interesse
   
2. **Sistema de Reputação**
   - Score de contribuição
   - Níveis de usuário (Novato, Membro, Veterano, Especialista)
   - Badges visuais no perfil

3. **Notificações Inteligentes**
   - Agrupamento de notificações similares
   - Digest personalizado baseado em preferências
   - Sugestão de tópicos para responder

4. **Analytics Avançado**
   - Dashboard de contribuição pessoal
   - Comparação com média da comunidade
   - Trending topics e hashtags

## 📝 Checklist de Implementação

- [x] Triggers de interações em tópicos
- [x] Triggers de menções
- [x] Triggers de soluções
- [x] Triggers de moderação
- [x] Triggers de likes com milestones
- [x] RPC de digest semanal
- [x] RPC de conquistas
- [x] Edge function de digest
- [x] Documentação completa
- [ ] Sistema de gamificação completo
- [ ] Testes de integração
- [ ] Configuração de cron job
- [ ] Dashboard de métricas
- [ ] Preferências granulares de notificação
- [ ] Sistema de badges visuais

## 🤝 Contribuindo

Para adicionar novos tipos de notificação ou conquistas:

1. Crie o trigger/RPC no banco
2. Documente o tipo e metadata aqui
3. Implemente o renderer no frontend
4. Adicione à lista de conquistas (se aplicável)
5. Adicione testes
6. Atualize o dashboard de métricas
