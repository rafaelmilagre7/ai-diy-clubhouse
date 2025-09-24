-- Inserir nova role Combo_ViverdeIA
INSERT INTO public.user_roles (name, description, permissions, is_system) 
VALUES (
  'combo_viver_de_ia',
  'Combo Viver de IA - Acesso completo ao Learning, Community e Certificates',
  jsonb_build_object(
    'learning', true,
    'community', true, 
    'certificates', true,
    'solutions', false,
    'tools', false,
    'benefits', false,
    'networking', false,
    'events', false
  ),
  false
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  updated_at = now();