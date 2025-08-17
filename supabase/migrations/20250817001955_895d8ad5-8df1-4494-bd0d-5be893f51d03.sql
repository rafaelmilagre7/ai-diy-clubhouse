-- Ajuste: Mover usuários @viverdeia.ai para 'membro_club' ao invés de 'admin'
-- Seguindo princípio de menor privilégio

DO $$
DECLARE
  admin_role_id uuid;
  membro_club_role_id uuid;
  affected_count integer;
BEGIN
  -- Buscar IDs dos papéis
  SELECT id INTO admin_role_id FROM user_roles WHERE name = 'admin';
  SELECT id INTO membro_club_role_id FROM user_roles WHERE name = 'membro_club';
  
  -- Contar usuários que serão afetados
  SELECT count(*) INTO affected_count 
  FROM profiles 
  WHERE email LIKE '%@viverdeia.ai' 
    AND role_id IS NULL;
  
  -- Atribuir papel membro_club para funcionários @viverdeia.ai que não têm papel explícito
  -- (os que já são admins explicitamente permanecem admins)
  UPDATE profiles 
  SET role_id = membro_club_role_id,
      updated_at = now()
  WHERE email LIKE '%@viverdeia.ai' 
    AND role_id IS NULL;
    
  -- Log da correção
  INSERT INTO audit_logs (
    user_id,
    event_type, 
    action,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'security_adjustment',
    'viverdeia_users_to_membro_club',
    jsonb_build_object(
      'affected_users', affected_count,
      'action', 'Moved @viverdeia.ai users without explicit roles to membro_club instead of admin',
      'reason', 'Following principle of least privilege - not all employees need admin access',
      'preserved_explicit_admins', true
    ),
    'info'
  );
  
  -- Relatório final
  RAISE NOTICE 'Migração concluída: % usuários @viverdeia.ai movidos para membro_club', affected_count;
END $$;