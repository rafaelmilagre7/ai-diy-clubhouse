-- Função para verificar e conceder conquistas automaticamente
CREATE OR REPLACE FUNCTION check_and_grant_achievements(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  linkedin_count INTEGER;
  total_count INTEGER;
  new_achievements JSONB := '[]'::jsonb;
  achievement JSONB;
BEGIN
  -- Contar compartilhamentos
  SELECT COUNT(*) INTO linkedin_count 
  FROM certificate_shares 
  WHERE user_id = user_uuid AND platform = 'linkedin';
  
  SELECT COUNT(*) INTO total_count 
  FROM certificate_shares 
  WHERE user_id = user_uuid;

  -- Verificar conquista: Primeira partilha no LinkedIn
  IF linkedin_count = 1 THEN
    achievement := jsonb_build_object(
      'id', 'first_linkedin_share',
      'title', '🎉 Primeira Partilha!',
      'description', 'Compartilhou seu primeiro certificado no LinkedIn',
      'icon', '🥇',
      'points', 50,
      'rarity', 'common'
    );
    
    INSERT INTO user_achievements (user_id, achievement_id, achievement_data)
    VALUES (user_uuid, 'first_linkedin_share', achievement)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    new_achievements := new_achievements || achievement;
  END IF;

  -- Verificar conquista: Influencer em crescimento
  IF linkedin_count = 5 THEN
    achievement := jsonb_build_object(
      'id', 'linkedin_influencer',
      'title', '📈 Influencer em Crescimento!',
      'description', 'Compartilhou 5 certificados no LinkedIn',
      'icon', '🚀',
      'points', 200,
      'rarity', 'rare'
    );
    
    INSERT INTO user_achievements (user_id, achievement_id, achievement_data)
    VALUES (user_uuid, 'linkedin_influencer', achievement)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    new_achievements := new_achievements || achievement;
  END IF;

  -- Verificar conquista: Mestre do LinkedIn
  IF linkedin_count = 10 THEN
    achievement := jsonb_build_object(
      'id', 'linkedin_master',
      'title', '👑 Mestre do LinkedIn!',
      'description', 'Verdadeiro influencer - 10 certificados compartilhados!',
      'icon', '👑',
      'points', 500,
      'rarity', 'legendary'
    );
    
    INSERT INTO user_achievements (user_id, achievement_id, achievement_data)
    VALUES (user_uuid, 'linkedin_master', achievement)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    new_achievements := new_achievements || achievement;
  END IF;

  RETURN jsonb_build_object(
    'new_achievements', new_achievements,
    'linkedin_shares', linkedin_count,
    'total_shares', total_count
  );
END;
$$;