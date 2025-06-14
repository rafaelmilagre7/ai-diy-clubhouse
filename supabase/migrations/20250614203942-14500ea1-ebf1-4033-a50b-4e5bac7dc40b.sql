
-- Remover a função antiga (caso exista)
drop function if exists public.get_user_profile_safe(uuid);

-- Agora crie a função nova com o tipo correto
create or replace function public.get_user_profile_safe(p_user_id uuid default null)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  target_user_id uuid;
  result jsonb;
begin
  target_user_id := coalesce(p_user_id, auth.uid());

  select jsonb_build_object(
    'id', p.id,
    'email', p.email,
    'name', p.name,
    'avatar_url', p.avatar_url,
    'company_name', p.company_name,
    'industry', p.industry,
    'role_id', p.role_id,
    'role', p.role,
    'user_roles', jsonb_build_object(
      'id', ur.id,
      'name', ur.name,
      'description', ur.description,
      'permissions', ur.permissions,
      'is_system', ur.is_system
    ),
    'created_at', p.created_at,
    'onboarding_completed', coalesce(p.onboarding_completed, false),
    'onboarding_completed_at', p.onboarding_completed_at
  ) into result
  from public.profiles p
  left join public.user_roles ur on p.role_id = ur.id
  where p.id = target_user_id;

  if result is null then
    raise exception 'Perfil não encontrado para o usuário %', target_user_id;
  end if;

  return result;
end;
$$;
