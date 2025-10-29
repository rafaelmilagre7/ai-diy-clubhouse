-- ============================================
-- ATIVAR PERMISSÃO FALTANTE DO ADMIN
-- Adiciona learning.access ao role admin
-- ============================================

-- Inserir a permissão learning.access para o admin
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM public.user_roles WHERE name = 'admin' LIMIT 1) as role_id,
  pd.id as permission_id
FROM public.permission_definitions pd
WHERE pd.code = 'learning.access'
ON CONFLICT DO NOTHING;

-- Sincronizar o campo JSONB
SELECT public.sync_role_permissions_to_jsonb();

-- Comentário
COMMENT ON TABLE public.role_permissions IS 
'Admin agora tem todas as 15 permissões ativas (incluindo learning.access)';