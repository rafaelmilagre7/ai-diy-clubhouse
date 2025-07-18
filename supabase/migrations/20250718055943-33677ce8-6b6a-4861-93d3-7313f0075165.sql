-- FASE 1: Correção Crítica da Estrutura de Dados
-- Remover dependências incorretas da tabela 'users' e corrigir RLS

-- 1. Verificar e corrigir funções que fazem referência à tabela 'users' incorreta
DROP FUNCTION IF EXISTS public.fetchUserProfile(uuid);

-- 2. Corrigir função is_user_admin para usar apenas auth.users
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = user_id AND (
        raw_user_meta_data->>'role' = 'admin' OR
        email LIKE '%@viverdeia.ai' OR
        email = 'admin@teste.com'
      )
    )
  );
END;
$$;

-- 3. Criar função otimizada para buscar perfil sem dependências incorretas
CREATE OR REPLACE FUNCTION public.get_user_profile_optimized(target_user_id uuid)
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  role_id uuid,
  role_name text,
  onboarding_completed boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.name,
    p.role_id,
    ur.name as role_name,
    p.onboarding_completed,
    p.created_at,
    p.updated_at
  FROM profiles p
  LEFT JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;
END;
$$;

-- 4. Criar cache de perfis para melhorar performance
CREATE TABLE IF NOT EXISTS public.profile_cache (
  user_id uuid PRIMARY KEY,
  profile_data jsonb NOT NULL,
  cached_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '5 minutes')
);

-- 5. Habilitar RLS na tabela de cache
ALTER TABLE public.profile_cache ENABLE ROW LEVEL SECURITY;

-- 6. Política RLS para cache de perfis
CREATE POLICY "Users can access their own profile cache"
ON public.profile_cache
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. Função para gerenciar cache de perfis
CREATE OR REPLACE FUNCTION public.get_cached_profile(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cached_data jsonb;
  profile_record record;
BEGIN
  -- Verificar cache válido primeiro
  SELECT profile_data INTO cached_data
  FROM profile_cache
  WHERE user_id = target_user_id 
  AND expires_at > now();
  
  IF cached_data IS NOT NULL THEN
    RETURN cached_data;
  END IF;
  
  -- Buscar perfil fresh e atualizar cache
  SELECT * INTO profile_record
  FROM get_user_profile_optimized(target_user_id)
  LIMIT 1;
  
  IF profile_record.id IS NOT NULL THEN
    cached_data := to_jsonb(profile_record);
    
    -- Atualizar cache
    INSERT INTO profile_cache (user_id, profile_data)
    VALUES (target_user_id, cached_data)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      profile_data = EXCLUDED.profile_data,
      cached_at = now(),
      expires_at = now() + interval '5 minutes';
    
    RETURN cached_data;
  END IF;
  
  RETURN NULL;
END;
$$;

-- 8. Criar tabela para detecção de loops de navegação
CREATE TABLE IF NOT EXISTS public.navigation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  path text NOT NULL,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  user_agent text,
  ip_address text
);

-- 9. Habilitar RLS na tabela de eventos de navegação
ALTER TABLE public.navigation_events ENABLE ROW LEVEL SECURITY;

-- 10. Política RLS para eventos de navegação
CREATE POLICY "Users can manage their navigation events"
ON public.navigation_events
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 11. Função para detectar loops de navegação
CREATE OR REPLACE FUNCTION public.detect_navigation_loop(
  p_user_id uuid,
  p_path text,
  p_session_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_count integer;
  is_loop boolean := false;
BEGIN
  -- Contar navegações recentes para o mesmo path
  SELECT COUNT(*) INTO recent_count
  FROM navigation_events
  WHERE user_id = p_user_id
  AND path = p_path
  AND timestamp > now() - interval '30 seconds';
  
  -- Detectar loop (mais de 3 navegações em 30 segundos)
  is_loop := recent_count > 3;
  
  -- Registrar evento atual
  INSERT INTO navigation_events (user_id, path, session_id)
  VALUES (p_user_id, p_path, p_session_id);
  
  -- Limpar eventos antigos
  DELETE FROM navigation_events
  WHERE timestamp < now() - interval '1 hour';
  
  RETURN jsonb_build_object(
    'is_loop', is_loop,
    'recent_count', recent_count,
    'path', p_path
  );
END;
$$;

-- 12. Índices para performance
CREATE INDEX IF NOT EXISTS idx_profile_cache_expires_at ON public.profile_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_navigation_events_user_path_time ON public.navigation_events(user_id, path, timestamp);
CREATE INDEX IF NOT EXISTS idx_navigation_events_timestamp ON public.navigation_events(timestamp);

-- 13. Comentários para documentação
COMMENT ON FUNCTION public.get_cached_profile(uuid) IS 'Função otimizada para buscar perfil com cache de 5 minutos';
COMMENT ON FUNCTION public.detect_navigation_loop(uuid, text, text) IS 'Detecta loops de navegação e registra eventos';
COMMENT ON TABLE public.profile_cache IS 'Cache de perfis de usuário para melhorar performance';
COMMENT ON TABLE public.navigation_events IS 'Log de eventos de navegação para detecção de loops';