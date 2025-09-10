-- Limpeza física completa de todos os vestígios do wagner@acairepublic.com
-- Esta operação é IRREVERSÍVEL e removerá TODOS os dados associados

-- 1. Backup dos dados antes da remoção (por segurança)
INSERT INTO invite_backups (email, backup_reason, backup_data, original_invite_id)
SELECT 'wagner@acairepublic.com', 
       'physical_cleanup_before_removal', 
       jsonb_build_object(
         'invites', (SELECT array_agg(to_jsonb(i.*)) FROM invites i WHERE email = 'wagner@acairepublic.com'),
         'deliveries', (SELECT array_agg(to_jsonb(d.*)) FROM invite_deliveries d WHERE d.invite_id IN (SELECT id FROM invites WHERE email = 'wagner@acairepublic.com')),
         'audit_logs', (SELECT count(*) FROM audit_logs WHERE details->>'email' = 'wagner@acairepublic.com')
       ),
       (SELECT id FROM invites WHERE email = 'wagner@acairepublic.com' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM invites WHERE email = 'wagner@acairepublic.com');

-- 2. Remover FISICAMENTE invite_deliveries associados
DELETE FROM invite_deliveries 
WHERE invite_id IN (SELECT id FROM invites WHERE email = 'wagner@acairepublic.com');

-- 3. Remover FISICAMENTE todos os convites (incluindo soft-deleted)
DELETE FROM invites WHERE email = 'wagner@acairepublic.com';

-- 4. Limpar audit_logs relacionados (manter apenas o backup)
DELETE FROM audit_logs 
WHERE details->>'email' = 'wagner@acairepublic.com' 
   OR details->>'user_email' = 'wagner@acairepublic.com'
   OR details->>'target_email' = 'wagner@acairepublic.com';

-- 5. Limpar email_queue se existir
DELETE FROM email_queue WHERE email = 'wagner@acairepublic.com';

-- 6. Verificação final - deve retornar 0 para todos
SELECT 
  'invites' as tabela, 
  count(*) as registros_restantes 
FROM invites 
WHERE email = 'wagner@acairepublic.com'
UNION ALL
SELECT 
  'invite_deliveries' as tabela, 
  count(*) as registros_restantes 
FROM invite_deliveries d 
WHERE EXISTS (SELECT 1 FROM invites i WHERE i.id = d.invite_id AND i.email = 'wagner@acairepublic.com')
UNION ALL
SELECT 
  'audit_logs' as tabela, 
  count(*) as registros_restantes 
FROM audit_logs 
WHERE details->>'email' = 'wagner@acairepublic.com'
UNION ALL
SELECT 
  'email_queue' as tabela, 
  count(*) as registros_restantes 
FROM email_queue 
WHERE email = 'wagner@acairepublic.com';