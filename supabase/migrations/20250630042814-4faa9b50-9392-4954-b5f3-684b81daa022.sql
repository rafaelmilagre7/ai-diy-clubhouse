
-- Criar view suggestions_with_profiles para sincronizar dados das sugestões com perfis dos usuários
-- Esta view resolve o problema do frontend que está buscando por uma view que não existe

CREATE OR REPLACE VIEW public.suggestions_with_profiles AS
SELECT 
  s.id,
  s.title,
  s.description,
  s.user_id,
  s.status,
  s.upvotes,
  s.downvotes,
  s.comment_count,
  s.created_at,
  s.updated_at,
  s.is_pinned,
  s.is_hidden,
  s.image_url,
  s.category_id,
  -- Campos do perfil do usuário
  p.name as user_name,
  p.avatar_url as user_avatar,
  -- Incluir objeto profiles para compatibilidade
  jsonb_build_object(
    'name', p.name,
    'avatar_url', p.avatar_url
  ) as profiles
FROM public.suggestions s
LEFT JOIN public.profiles p ON s.user_id = p.id;

-- Habilitar RLS na view (herda as políticas das tabelas base)
ALTER VIEW public.suggestions_with_profiles SET (security_barrier = true);

-- Log da criação da view
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  NULL,
  'system_event',
  'suggestions_view_created',
  jsonb_build_object(
    'view_name', 'suggestions_with_profiles',
    'purpose', 'Sincronizar dados das sugestões com perfis dos usuários',
    'frontend_compatibility', true,
    'tables_joined', ARRAY['suggestions', 'profiles'],
    'created_at', NOW()
  )
);
