-- Atualizar permissões do master_user para incluir todas as funcionalidades do membro_club
-- mantendo as permissões organizacionais existentes
UPDATE public.user_roles 
SET permissions = jsonb_build_object(
  -- Permissões de funcionalidades (do membro_club)
  'benefits', true,
  'certificates', true,
  'community', true,
  'events', true,
  'learning', true,
  'networking', true,
  'solutions', true,
  'tools', true,
  -- Permissões organizacionais (mantendo as existentes do master_user)
  'invite_members', true,
  'organization_settings', true,
  'team_management', true,
  'view_team_analytics', true
),
updated_at = now()
WHERE name = 'master_user';