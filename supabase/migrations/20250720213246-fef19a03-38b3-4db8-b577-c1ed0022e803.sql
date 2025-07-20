
-- CORREÇÃO 1: Padronizar campo de solução nos posts
-- Adicionar campo is_accepted_solution para consistência com o código
ALTER TABLE public.forum_posts 
ADD COLUMN IF NOT EXISTS is_accepted_solution BOOLEAN DEFAULT false;

-- Sincronizar dados existentes (se is_solution existir, copiar para is_accepted_solution)
UPDATE public.forum_posts 
SET is_accepted_solution = COALESCE(is_solution, false)
WHERE is_accepted_solution IS NULL;

-- CORREÇÃO 2: Remover funções RPC duplicadas e manter apenas as padronizadas
DROP FUNCTION IF EXISTS public.deleteforumtopic(uuid);
DROP FUNCTION IF EXISTS public.deleteforumpost(uuid);

-- CORREÇÃO 3: Criar funções RPC padronizadas com nomenclatura consistente
CREATE OR REPLACE FUNCTION public.delete_forum_topic(topic_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar permissões (admin ou autor)
  IF NOT (public.is_user_admin(auth.uid()) OR EXISTS(
    SELECT 1 FROM public.forum_topics WHERE id = topic_id AND user_id = auth.uid()
  )) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permission denied');
  END IF;
  
  -- Deletar posts relacionados primeiro
  DELETE FROM public.forum_posts WHERE topic_id = topic_id;
  
  -- Deletar tópico
  DELETE FROM public.forum_topics WHERE id = topic_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Topic deleted successfully');
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_forum_post(post_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  post_data record;
BEGIN
  -- Verificar permissões (admin ou autor)
  IF NOT (public.is_user_admin(auth.uid()) OR EXISTS(
    SELECT 1 FROM public.forum_posts WHERE id = post_id AND user_id = auth.uid()
  )) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permission denied');
  END IF;
  
  -- Buscar dados do post antes de deletar
  SELECT topic_id, is_accepted_solution INTO post_data
  FROM public.forum_posts 
  WHERE id = post_id;
  
  -- Deletar post
  DELETE FROM public.forum_posts WHERE id = post_id;
  
  -- Se era uma solução aceita, desmarcar o tópico como resolvido
  IF post_data.is_accepted_solution THEN
    UPDATE public.forum_topics 
    SET is_solved = false 
    WHERE id = post_data.topic_id;
  END IF;
  
  -- Decrementar contagem de respostas
  UPDATE public.forum_topics 
  SET reply_count = GREATEST(reply_count - 1, 0),
      last_activity_at = now()
  WHERE id = post_data.topic_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Post deleted successfully');
END;
$$;

-- CORREÇÃO 4: Atualizar triggers para manter consistência
CREATE OR REPLACE FUNCTION public.update_forum_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.forum_topics
  SET last_activity_at = NOW(),
      reply_count = (
        SELECT COUNT(*) 
        FROM public.forum_posts 
        WHERE topic_id = NEW.topic_id
      )
  WHERE id = NEW.topic_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger se não existir
DROP TRIGGER IF EXISTS update_forum_topic_activity ON public.forum_posts;
CREATE TRIGGER update_forum_topic_activity
AFTER INSERT ON public.forum_posts
FOR EACH ROW
EXECUTE FUNCTION update_forum_last_activity();
