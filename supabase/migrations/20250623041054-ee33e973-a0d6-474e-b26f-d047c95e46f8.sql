
-- LIMPEZA COMPLETA PARA rafaelmilagre@gmail.com
-- Remove todos os dados relacionados ao convite para permitir novo teste

-- 1. Remover entradas de deliveries do convite
DELETE FROM invite_deliveries 
WHERE invite_id = '53a2b1dc-5c22-410d-ad53-5a634571f91d';

-- 2. Remover eventos de analytics do convite
DELETE FROM invite_analytics_events 
WHERE invite_id = '53a2b1dc-5c22-410d-ad53-5a634571f91d';

-- 3. Remover associações de campanha (se existir)
DELETE FROM campaign_invites 
WHERE invite_id = '53a2b1dc-5c22-410d-ad53-5a634571f91d';

-- 4. Remover o convite principal
DELETE FROM invites 
WHERE id = '53a2b1dc-5c22-410d-ad53-5a634571f91d';

-- 5. Verificar se não existe perfil para este email (por segurança)
-- Se existir, será mostrado mas não removido automaticamente
SELECT p.id, p.email, p.name, p.created_at 
FROM profiles p 
WHERE p.email = 'rafaelmilagre@gmail.com';
