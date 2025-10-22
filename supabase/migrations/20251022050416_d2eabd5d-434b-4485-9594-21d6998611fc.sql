
-- Adicionar proteção SECURITY INVOKER às views restantes
-- Isso garante que as views executem com as permissões do usuário, não do criador

-- 1. Recriar profiles_networking_safe com security_invoker
DROP VIEW IF EXISTS public.profiles_networking_safe;

CREATE VIEW public.profiles_networking_safe 
WITH (security_invoker = on) AS
SELECT 
  p.id,
  CASE 
    WHEN p.available_for_networking THEN p.name
    ELSE mask_personal_name(p.name)
  END as name,
  CASE 
    WHEN p.available_for_networking THEN p.email
    ELSE mask_email(p.email)
  END as email,
  p.whatsapp_number,
  p.avatar_url,
  p.company_name,
  p.current_position,
  p.industry,
  COALESCE(ur.name, 'member') as role,
  p.linkedin_url,
  p.professional_bio,
  p.skills,
  p.created_at,
  NOT p.available_for_networking as is_masked
FROM profiles p
LEFT JOIN user_roles ur ON p.role_id = ur.id
WHERE p.available_for_networking = true;

-- 2. Recriar builder_analytics com security_invoker
DROP VIEW IF EXISTS public.builder_analytics;

CREATE VIEW public.builder_analytics 
WITH (security_invoker = on) AS
SELECT
  DATE_TRUNC('day', created_at) AS date,
  COUNT(*) AS solutions_generated,
  COUNT(DISTINCT user_id) AS unique_users,
  AVG(generation_time_ms) AS avg_generation_time,
  COUNT(*) FILTER (WHERE implementation_status = 'completed') AS completed_solutions
FROM ai_generated_solutions
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

COMMENT ON VIEW public.profiles_networking_safe IS 'View segura para dados de networking - executa com permissões do usuário';
COMMENT ON VIEW public.builder_analytics IS 'Analytics do Builder de IA - executa com permissões do usuário';
