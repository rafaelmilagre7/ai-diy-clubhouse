-- Gerar dados de teste para o sistema de networking usando um usuário real
-- 1. Criar alguns matches de exemplo
INSERT INTO network_matches (user_id, matched_user_id, match_type, compatibility_score, match_reason, ai_analysis, month_year, status) 
SELECT 
  '024ca4f7-6974-40c8-a7eb-f2cb7db8be52'::uuid,
  p.id,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) % 4 = 0 THEN 'customer'
    WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) % 4 = 1 THEN 'supplier'
    WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) % 4 = 2 THEN 'partner'
    ELSE 'mentor'
  END,
  70 + (RANDOM() * 30)::numeric(5,2),
  'Match gerado baseado em análise de perfil e compatibilidade empresarial',
  jsonb_build_object(
    'strengths', ARRAY['Experiência complementar', 'Perfil compatível', 'Potencial de sinergia'],
    'opportunities', ARRAY['Parcerias estratégicas', 'Troca de conhecimentos', 'Crescimento conjunto'],
    'recommended_approach', 'Iniciar conversa informal para explorar oportunidades de colaboração'
  ),
  to_char(NOW(), 'YYYY-MM'),
  'pending'
FROM profiles p 
WHERE p.id != '024ca4f7-6974-40c8-a7eb-f2cb7db8be52'
AND p.name IS NOT NULL
LIMIT 8;

-- 2. Criar algumas conexões de exemplo
INSERT INTO member_connections (requester_id, recipient_id, status) 
SELECT 
  '024ca4f7-6974-40c8-a7eb-f2cb7db8be52'::uuid,
  p.id,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) % 3 = 0 THEN 'accepted'
    WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) % 3 = 1 THEN 'pending'
    ELSE 'pending'
  END
FROM profiles p 
WHERE p.id != '024ca4f7-6974-40c8-a7eb-f2cb7db8be52'
AND p.name IS NOT NULL
LIMIT 5;

-- 3. Criar notificações de conexão
INSERT INTO connection_notifications (user_id, sender_id, type, is_read)
SELECT 
  '024ca4f7-6974-40c8-a7eb-f2cb7db8be52'::uuid,
  p.id,
  'connection_request',
  false
FROM profiles p 
WHERE p.id != '024ca4f7-6974-40c8-a7eb-f2cb7db8be52'
AND p.name IS NOT NULL
LIMIT 3;

-- 4. Criar algumas mensagens de exemplo
INSERT INTO direct_messages (sender_id, recipient_id, content)
SELECT 
  '024ca4f7-6974-40c8-a7eb-f2cb7db8be52'::uuid,
  p.id,
  'Olá! Vi seu perfil e gostaria de conversar sobre possíveis parcerias. Que tal marcarmos um café virtual?'
FROM profiles p 
WHERE p.id != '024ca4f7-6974-40c8-a7eb-f2cb7db8be52'
AND p.name IS NOT NULL
LIMIT 2;