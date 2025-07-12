-- Gerar dados de teste para o sistema de networking
-- 1. Criar alguns matches de exemplo
INSERT INTO network_matches (user_id, matched_user_id, match_type, compatibility_score, match_reason, ai_analysis, month_year, status) 
SELECT 
  'dc418224-a46e-4db9-b6b9-1e1b6f1a3c8d'::uuid,
  p.id,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) % 4 = 0 THEN 'customer'
    WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) % 4 = 1 THEN 'supplier'
    WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) % 4 = 2 THEN 'partner'
    ELSE 'mentor'
  END,
  70 + (RANDOM() * 30)::numeric(5,2),
  'Match gerado para teste do sistema de networking',
  jsonb_build_object(
    'strengths', ARRAY['Experiência complementar', 'Perfil compatível', 'Potencial de sinergia'],
    'opportunities', ARRAY['Parcerias estratégicas', 'Troca de conhecimentos', 'Crescimento conjunto'],
    'recommended_approach', 'Iniciar conversa informal para explorar oportunidades de colaboração'
  ),
  to_char(NOW(), 'YYYY-MM'),
  'pending'
FROM profiles p 
WHERE p.id != 'dc418224-a46e-4db9-b6b9-1e1b6f1a3c8d'
AND p.name IS NOT NULL
LIMIT 8;

-- 2. Criar algumas conexões de exemplo
INSERT INTO member_connections (requester_id, recipient_id, status) 
SELECT 
  'dc418224-a46e-4db9-b6b9-1e1b6f1a3c8d'::uuid,
  p.id,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) % 3 = 0 THEN 'accepted'
    WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) % 3 = 1 THEN 'pending'
    ELSE 'pending'
  END
FROM profiles p 
WHERE p.id != 'dc418224-a46e-4db9-b6b9-1e1b6f1a3c8d'
AND p.name IS NOT NULL
LIMIT 5;

-- 3. Criar notificações de conexão
INSERT INTO connection_notifications (user_id, sender_id, type, is_read)
SELECT 
  'dc418224-a46e-4db9-b6b9-1e1b6f1a3c8d'::uuid,
  p.id,
  'connection_request',
  false
FROM profiles p 
WHERE p.id != 'dc418224-a46e-4db9-b6b9-1e1b6f1a3c8d'
AND p.name IS NOT NULL
LIMIT 3;

-- 4. Criar algumas mensagens de exemplo
INSERT INTO direct_messages (sender_id, recipient_id, content)
SELECT 
  'dc418224-a46e-4db9-b6b9-1e1b6f1a3c8d'::uuid,
  p.id,
  'Olá! Vi seu perfil e gostaria de conversar sobre possíveis parcerias. Que tal marcarmos um café virtual?'
FROM profiles p 
WHERE p.id != 'dc418224-a46e-4db9-b6b9-1e1b6f1a3c8d'
AND p.name IS NOT NULL
LIMIT 2;

-- 5. Habilitar realtime para todas as tabelas relevantes
ALTER TABLE network_matches REPLICA IDENTITY FULL;
ALTER TABLE member_connections REPLICA IDENTITY FULL;
ALTER TABLE connection_notifications REPLICA IDENTITY FULL;
ALTER TABLE direct_messages REPLICA IDENTITY FULL;

-- 6. Adicionar tabelas à publicação do realtime
ALTER publication supabase_realtime ADD TABLE network_matches;
ALTER publication supabase_realtime ADD TABLE member_connections;
ALTER publication supabase_realtime ADD TABLE connection_notifications;
ALTER publication supabase_realtime ADD TABLE direct_messages;