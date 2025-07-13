-- Criar view suggestions_with_profiles para unir sugestões com dados de perfil
CREATE OR REPLACE VIEW public.suggestions_with_profiles AS
SELECT 
  s.*,
  p.name as author_name,
  p.avatar_url as author_avatar,
  p.company_name as author_company
FROM public.suggestions s
LEFT JOIN public.profiles p ON s.user_id = p.id;

-- Criar view networking_metrics (que também estava faltando segundo os logs)
CREATE OR REPLACE VIEW public.networking_metrics AS
SELECT 
  'total_connections' as metric_name,
  COUNT(*) as metric_value,
  CURRENT_DATE as date
FROM public.member_connections 
WHERE status = 'accepted'
UNION ALL
SELECT 
  'pending_connections' as metric_name,
  COUNT(*) as metric_value,
  CURRENT_DATE as date
FROM public.member_connections 
WHERE status = 'pending'
UNION ALL
SELECT 
  'total_matches' as metric_name,
  COUNT(*) as metric_value,
  CURRENT_DATE as date
FROM public.network_matches 
WHERE status = 'pending';