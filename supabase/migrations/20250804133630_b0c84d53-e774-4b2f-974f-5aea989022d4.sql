-- Usar função segura para alterar roles dos usuários com NULL
-- ID do role membro_club: 91e3c1b0-ad08-4a58-82b5-59a762bc4719

-- Alterar role do Diego Malta
SELECT public.secure_change_user_role(
  '39b20b9a-f23a-4b91-a5fd-c3efe8c2ad72'::uuid, 
  '91e3c1b0-ad08-4a58-82b5-59a762bc4719'::uuid
);

-- Alterar role do Guilherme
SELECT public.secure_change_user_role(
  'b328f002-3bdd-4a57-895a-6ecd54aba056'::uuid, 
  '91e3c1b0-ad08-4a58-82b5-59a762bc4719'::uuid
);

-- Alterar role da Emanuelli (que deveria ser admin, mas vamos fazer membro_club primeiro)
SELECT public.secure_change_user_role(
  '570dd941-47a1-4652-bb9a-c90ee1812ebb'::uuid, 
  '91e3c1b0-ad08-4a58-82b5-59a762bc4719'::uuid
);

-- Log adicional da correção de segurança
INSERT INTO audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_improvement',
  'null_roles_fixed_securely',
  jsonb_build_object(
    'fixed_users', 3,
    'new_role', 'membro_club',
    'security_method', 'secure_change_user_role_function',
    'timestamp', NOW()
  ),
  'info'
);