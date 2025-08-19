-- Criação das tabelas para Analytics e Gamificação de Compartilhamento de Certificados

-- Tabela para rastrear compartilhamentos de certificados
CREATE TABLE IF NOT EXISTS public.certificate_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_id UUID, -- Pode ser nulo para certificados antigos
  share_type TEXT NOT NULL, -- 'linkedin_simple', 'linkedin_with_preview', 'api_direct', etc
  platform TEXT NOT NULL DEFAULT 'linkedin', -- 'linkedin', 'twitter', 'facebook', etc
  post_data JSONB, -- Dados do post compartilhado
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  
  -- Índices para performance
  INDEX (user_id, shared_at),
  INDEX (platform, shared_at),
  INDEX (share_type)
);

-- Tabela para sistema de conquistas/achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL, -- 'first_linkedin_share', 'linkedin_influencer', etc
  achievement_data JSONB NOT NULL, -- Dados da conquista (título, descrição, ícone, pontos)
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified_at TIMESTAMP WITH TIME ZONE, -- Quando o usuário foi notificado
  
  -- Evitar conquistas duplicadas
  UNIQUE(user_id, achievement_id),
  
  -- Índices
  INDEX (user_id, achieved_at DESC),
  INDEX (achievement_id)
);

-- Tabela para armazenar configurações OAuth do LinkedIn (criptografadas)
CREATE TABLE IF NOT EXISTS public.linkedin_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  linkedin_user_id TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL, -- Token criptografado
  refresh_token_encrypted TEXT, -- Refresh token criptografado
  profile_data JSONB, -- Dados do perfil do LinkedIn
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Índices
  INDEX (user_id),
  INDEX (linkedin_user_id),
  INDEX (expires_at)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.certificate_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_connections ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para certificate_shares
CREATE POLICY "Users can view their own certificate shares" 
ON public.certificate_shares 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own certificate shares" 
ON public.certificate_shares 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements for users" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (true); -- Permitir inserção do sistema

CREATE POLICY "Users can update notification status of their achievements" 
ON public.user_achievements 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para linkedin_connections
CREATE POLICY "Users can manage their own LinkedIn connections" 
ON public.linkedin_connections 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Função para obter estatísticas de compartilhamento do usuário
CREATE OR REPLACE FUNCTION get_user_share_stats(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  total_shares INTEGER;
  linkedin_shares INTEGER;
  this_month_shares INTEGER;
  achievements_count INTEGER;
  total_points INTEGER;
BEGIN
  -- Verificar se o usuário está acessando seus próprios dados
  IF auth.uid() != user_uuid THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Calcular estatísticas
  SELECT COUNT(*) INTO total_shares 
  FROM certificate_shares 
  WHERE user_id = user_uuid;
  
  SELECT COUNT(*) INTO linkedin_shares 
  FROM certificate_shares 
  WHERE user_id = user_uuid AND platform = 'linkedin';
  
  SELECT COUNT(*) INTO this_month_shares 
  FROM certificate_shares 
  WHERE user_id = user_uuid 
    AND shared_at >= date_trunc('month', now());
  
  SELECT COUNT(*) INTO achievements_count 
  FROM user_achievements 
  WHERE user_id = user_uuid;
  
  SELECT COALESCE(SUM((achievement_data->>'points')::INTEGER), 0) INTO total_points
  FROM user_achievements 
  WHERE user_id = user_uuid;

  -- Montar resultado
  result := jsonb_build_object(
    'total_shares', total_shares,
    'linkedin_shares', linkedin_shares,
    'this_month_shares', this_month_shares,
    'achievements_count', achievements_count,
    'total_points', total_points,
    'last_updated', now()
  );

  RETURN result;
END;
$$;

-- Função para verificar e conceder conquistas automaticamente
CREATE OR REPLACE FUNCTION check_and_grant_achievements(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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

  -- Verificar conquista: Social butterfly (compartilhou em múltiplas plataformas)
  IF total_count >= 3 THEN
    SELECT COUNT(DISTINCT platform) INTO linkedin_count
    FROM certificate_shares 
    WHERE user_id = user_uuid;
    
    IF linkedin_count >= 2 THEN
      achievement := jsonb_build_object(
        'id', 'social_butterfly',
        'title', '🦋 Borboleta Social!',
        'description', 'Compartilhou certificados em múltiplas plataformas',
        'icon', '🦋',
        'points', 150,
        'rarity', 'epic'
      );
      
      INSERT INTO user_achievements (user_id, achievement_id, achievement_data)
      VALUES (user_uuid, 'social_butterfly', achievement)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
      
      new_achievements := new_achievements || achievement;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'new_achievements', new_achievements,
    'linkedin_shares', linkedin_count,
    'total_shares', total_count
  );
END;
$$;