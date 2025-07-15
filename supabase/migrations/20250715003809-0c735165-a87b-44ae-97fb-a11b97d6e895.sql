-- FASE 1, 2 e 3: CORRIGIR PROBLEMAS CRÍTICOS DO ONBOARDING

-- =====================================================
-- FASE 1: REMOVER SISTEMA ONBOARDING_SIMPLE COMPLETAMENTE
-- =====================================================

-- Fazer backup antes de remover
INSERT INTO public.onboarding_backups (
  user_id,
  backup_type,
  onboarding_data,
  profiles_data
)
SELECT 
  os.user_id,
  'legacy_simple_removal',
  jsonb_build_object(
    'table', 'onboarding_simple',
    'data', to_jsonb(os.*)
  ),
  jsonb_build_object(
    'table', 'profiles', 
    'data', to_jsonb(p.*)
  )
FROM public.onboarding_simple os
LEFT JOIN public.profiles p ON p.id = os.user_id;

-- Remover tabela onboarding_simple completamente
DROP TABLE IF EXISTS public.onboarding_simple CASCADE;

-- =====================================================
-- FASE 2: MELHORAR TRIGGER DE SINCRONIZAÇÃO
-- =====================================================

-- Aprimorar função de sincronização para ser mais robusta
CREATE OR REPLACE FUNCTION public.sync_onboarding_final_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log para debug
  RAISE NOTICE 'Sincronizando onboarding_final para profile do usuário: %', NEW.user_id;
  
  -- Atualizar perfil com dados mais detalhados
  UPDATE public.profiles
  SET 
    name = COALESCE(NEW.personal_info->>'name', name),
    company_name = COALESCE(
      NEW.business_info->>'company_name', 
      NEW.business_info->>'companyName',
      NEW.company_name,
      company_name
    ),
    industry = COALESCE(
      NEW.business_info->>'company_sector', 
      NEW.business_info->>'business_sector',
      industry
    ),
    onboarding_completed = NEW.is_completed,
    onboarding_completed_at = CASE 
      WHEN NEW.is_completed THEN COALESCE(NEW.completed_at, now()) 
      ELSE NULL 
    END,
    updated_at = now()
  WHERE id = NEW.user_id;
  
  -- Log resultado
  IF FOUND THEN
    RAISE NOTICE 'Profile atualizado com sucesso para usuário: %', NEW.user_id;
  ELSE
    RAISE WARNING 'Profile não encontrado para usuário: %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- FASE 3: CRIAR FUNÇÃO DE REDIRECIONAMENTO CENTRALIZADA
-- =====================================================

-- Função para determinar próximo passo de onboarding
CREATE OR REPLACE FUNCTION public.get_onboarding_next_step(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  onboarding_record public.onboarding_final;
  next_step integer;
  redirect_url text;
  result jsonb;
BEGIN
  -- Buscar registro de onboarding
  SELECT * INTO onboarding_record
  FROM public.onboarding_final
  WHERE user_id = p_user_id;
  
  -- Se não existe registro, inicializar automaticamente
  IF onboarding_record.id IS NULL THEN
    SELECT public.initialize_onboarding_for_user(p_user_id) INTO result;
    
    IF (result->>'success')::boolean THEN
      -- Recarregar após inicialização
      SELECT * INTO onboarding_record
      FROM public.onboarding_final
      WHERE user_id = p_user_id;
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'message', 'Erro ao inicializar onboarding',
        'redirect_url', '/login'
      );
    END IF;
  END IF;
  
  -- Se onboarding está completo
  IF onboarding_record.is_completed THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Onboarding já completado',
      'is_completed', true,
      'redirect_url', '/dashboard'
    );
  END IF;
  
  -- Determinar próximo step baseado no progresso real
  next_step := GREATEST(1, onboarding_record.current_step);
  
  -- Garantir que não ultrapasse 6 steps
  IF next_step > 6 THEN
    next_step := 6;
  END IF;
  
  -- Construir URL de redirecionamento
  redirect_url := '/onboarding/step/' || next_step;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Próximo step determinado',
    'is_completed', false,
    'current_step', next_step,
    'completed_steps', onboarding_record.completed_steps,
    'redirect_url', redirect_url
  );
END;
$$;

-- =====================================================
-- MELHORAR TRIGGER PARA NOVOS USUÁRIOS
-- =====================================================

-- Atualizar trigger para incluir inicialização automática
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_token_from_metadata text;
  invite_record public.invites;
  user_role_id uuid;
  onboarding_result jsonb;
BEGIN
  -- Log para debug
  RAISE NOTICE 'Novo usuário criado: %', NEW.id;
  
  -- Verificar se há invite_token nos metadados
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    invite_token_from_metadata := NEW.raw_user_meta_data->>'invite_token';
    RAISE NOTICE 'Token de convite encontrado: %', invite_token_from_metadata;
  END IF;
  
  -- Se há token de convite, buscar o role_id correspondente
  IF invite_token_from_metadata IS NOT NULL THEN
    -- Buscar convite válido
    SELECT i.* INTO invite_record
    FROM public.invites i
    WHERE UPPER(REGEXP_REPLACE(i.token, '\s+', '', 'g')) = UPPER(REGEXP_REPLACE(invite_token_from_metadata, '\s+', '', 'g'))
    AND i.expires_at > now()
    AND i.used_at IS NULL
    LIMIT 1;
    
    IF invite_record.id IS NOT NULL THEN
      user_role_id := invite_record.role_id;
      RAISE NOTICE 'Role encontrado para convite: %', user_role_id;
    ELSE
      RAISE NOTICE 'Convite não encontrado ou inválido';
    END IF;
  END IF;
  
  -- Se não tem role_id do convite, usar role padrão 'member'
  IF user_role_id IS NULL THEN
    SELECT id INTO user_role_id 
    FROM public.user_roles 
    WHERE name IN ('member', 'membro') 
    ORDER BY name LIMIT 1;
    
    IF user_role_id IS NULL THEN
      RAISE NOTICE 'Criando role member padrão';
      INSERT INTO public.user_roles (name, description, permissions)
      VALUES ('member', 'Membro padrão', '{"basic": true}')
      RETURNING id INTO user_role_id;
    END IF;
  END IF;
  
  -- Criar perfil
  BEGIN
    INSERT INTO public.profiles (
      id, 
      email, 
      name, 
      role_id, 
      created_at, 
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'display_name',
        split_part(NEW.email, '@', 1)
      ),
      user_role_id,
      now(),
      now()
    );
    
    RAISE NOTICE 'Perfil criado com sucesso para usuário: %', NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
  END;
  
  -- NOVIDADE: Inicializar onboarding automaticamente
  BEGIN
    SELECT public.initialize_onboarding_for_user(NEW.id) INTO onboarding_result;
    
    IF (onboarding_result->>'success')::boolean THEN
      RAISE NOTICE 'Onboarding inicializado automaticamente para usuário: %', NEW.id;
    ELSE
      RAISE WARNING 'Falha ao inicializar onboarding para usuário %: %', NEW.id, onboarding_result->>'message';
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao inicializar onboarding para usuário %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- FUNÇÃO PARA VALIDAR ESTADO DO ONBOARDING
-- =====================================================

CREATE OR REPLACE FUNCTION public.validate_onboarding_state(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record public.profiles;
  onboarding_record public.onboarding_final;
  issues jsonb := '[]'::jsonb;
  warnings jsonb := '[]'::jsonb;
BEGIN
  -- Buscar profile
  SELECT * INTO profile_record FROM public.profiles WHERE id = p_user_id;
  
  IF profile_record.id IS NULL THEN
    issues := issues || jsonb_build_array('Profile não encontrado');
  END IF;
  
  -- Buscar onboarding
  SELECT * INTO onboarding_record FROM public.onboarding_final WHERE user_id = p_user_id;
  
  IF onboarding_record.id IS NULL THEN
    issues := issues || jsonb_build_array('Registro de onboarding não encontrado');
  ELSE
    -- Validar consistência
    IF profile_record.onboarding_completed != onboarding_record.is_completed THEN
      issues := issues || jsonb_build_array('Inconsistência: profile.onboarding_completed não bate com onboarding_final.is_completed');
    END IF;
    
    -- Validar current_step
    IF onboarding_record.current_step < 1 OR onboarding_record.current_step > 7 THEN
      warnings := warnings || jsonb_build_array('current_step fora do range válido (1-7)');
    END IF;
    
    -- Validar completed_steps
    IF array_length(onboarding_record.completed_steps, 1) IS NULL OR array_length(onboarding_record.completed_steps, 1) = 0 THEN
      IF onboarding_record.current_step > 1 THEN
        warnings := warnings || jsonb_build_array('completed_steps vazio mas current_step > 1');
      END IF;
    END IF;
    
    -- Validar estrutura JSONB
    IF onboarding_record.personal_info IS NULL OR jsonb_typeof(onboarding_record.personal_info) != 'object' THEN
      warnings := warnings || jsonb_build_array('personal_info inválido ou nulo');
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'valid', jsonb_array_length(issues) = 0,
    'issues', issues,
    'warnings', warnings,
    'profile_exists', profile_record.id IS NOT NULL,
    'onboarding_exists', onboarding_record.id IS NOT NULL,
    'checked_at', now()
  );
END;
$$;

-- =====================================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para melhorar performance de consultas de onboarding
CREATE INDEX IF NOT EXISTS idx_onboarding_final_user_id_status 
ON public.onboarding_final(user_id, is_completed, current_step);

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_status 
ON public.profiles(id, onboarding_completed) WHERE onboarding_completed IS NOT NULL;

-- =====================================================
-- LOGS FINAIS
-- =====================================================

-- Inserir log da correção
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id,
  severity
) VALUES (
  'system_maintenance',
  'onboarding_critical_fixes',
  jsonb_build_object(
    'fase', 'Correções Críticas 1-3',
    'actions', jsonb_build_array(
      'Removido onboarding_simple',
      'Melhorado trigger de sincronização',
      'Criada função de redirecionamento centralizada',
      'Atualizado trigger para novos usuários',
      'Criadas funções de validação'
    ),
    'timestamp', now()
  ),
  'system',
  'info'
);