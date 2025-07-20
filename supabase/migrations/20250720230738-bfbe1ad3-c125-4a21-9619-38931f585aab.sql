-- ETAPA 5: Finalizar Realtime Subscriptions para Community

-- Adicionar tabelas community à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE community_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE community_topics;
ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE community_reactions;

-- Remover tabelas forum antigas da publicação realtime (se existirem)
-- Usar DO block para evitar erro se não existirem
DO $$
BEGIN
    -- Tentar remover forum_categories se existir na publicação
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE forum_categories;
    EXCEPTION
        WHEN undefined_table THEN
            -- Tabela não existe mais, ok
            NULL;
        WHEN others THEN
            -- Tabela não estava na publicação, ok
            NULL;
    END;
    
    -- Tentar remover forum_topics se existir na publicação
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE forum_topics;
    EXCEPTION
        WHEN undefined_table THEN
            NULL;
        WHEN others THEN
            NULL;
    END;
    
    -- Tentar remover forum_posts se existir na publicação
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE forum_posts;
    EXCEPTION
        WHEN undefined_table THEN
            NULL;
        WHEN others THEN
            NULL;
    END;
    
    -- Tentar remover forum_reactions se existir na publicação
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE forum_reactions;
    EXCEPTION
        WHEN undefined_table THEN
            NULL;
        WHEN others THEN
            NULL;
    END;
END $$;

-- Criar aliases temporários das funções antigas para compatibilidade
CREATE OR REPLACE FUNCTION public.deleteforumtopic(topic_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Redirecionar para a nova função
  RETURN public.delete_community_topic(topic_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.deleteforumpost(post_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Redirecionar para a nova função
  RETURN public.delete_community_post(post_id);
END;
$$;

-- Log da finalização
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'migration',
  'realtime_community_complete',
  jsonb_build_object(
    'message', 'Etapa 5: Realtime subscriptions configuradas para community',
    'realtime_tables_added', '["community_categories", "community_topics", "community_posts", "community_reactions"]',
    'legacy_aliases_created', '["deleteforumtopic", "deleteforumpost"]',
    'status', 'ALL_STEPS_COMPLETE'
  ),
  auth.uid()
);