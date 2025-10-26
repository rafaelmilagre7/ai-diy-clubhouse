-- ============================================================================
-- CORREÇÃO CRÍTICA: RLS bloqueando INSERTs do trigger handle_new_user
-- Data: 2025-10-26
-- Problema: Política RLS profiles_insert_own impede que triggers de sistema
--           criem perfis porque auth.uid() é NULL no contexto do trigger
-- ============================================================================

-- 1. Corrigir política de INSERT em profiles
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

CREATE POLICY "profiles_insert_policy"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    -- Permitir usuário criar seu próprio perfil
    auth.uid() = id 
    -- OU permitir contexto de sistema/trigger (auth.uid() é NULL)
    OR auth.uid() IS NULL
  );

COMMENT ON POLICY "profiles_insert_policy" ON public.profiles 
IS 'Permite usuários criarem seus próprios perfis OU triggers de sistema criarem perfis durante registro';

-- 2. Corrigir política de INSERT em onboarding_final
DROP POLICY IF EXISTS "onboarding_insert_own" ON public.onboarding_final;

CREATE POLICY "onboarding_insert_policy"
  ON public.onboarding_final
  FOR INSERT
  WITH CHECK (
    -- Permitir usuário criar seu próprio onboarding
    user_id = auth.uid() 
    -- OU permitir contexto de sistema/trigger
    OR auth.uid() IS NULL
  );

COMMENT ON POLICY "onboarding_insert_policy" ON public.onboarding_final
IS 'Permite usuários e triggers de sistema criarem registros de onboarding';

-- 3. Adicionar logs detalhados na função handle_new_user para debugging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invite_record public.invites;
  invite_token text;
  default_role_id uuid;
  extracted_name text;
BEGIN
  RAISE LOG '[HANDLE_NEW_USER] ======================================== INÍCIO';
  RAISE LOG '[HANDLE_NEW_USER] Processando registro para: %', NEW.email;
  RAISE LOG '[HANDLE_NEW_USER] Context auth.uid(): %', auth.uid();
  RAISE LOG '[HANDLE_NEW_USER] User ID (NEW.id): %', NEW.id;
  
  -- Extrair token do convite dos metadados
  invite_token := NEW.raw_user_meta_data->>'invite_token';
  
  RAISE LOG '[HANDLE_NEW_USER] Token de convite: %', COALESCE(invite_token, 'NENHUM');
  
  IF invite_token IS NOT NULL THEN
    -- Buscar convite válido
    SELECT * INTO invite_record
    FROM public.invites
    WHERE token = invite_token
      AND status = 'pending'
      AND expires_at > now();
    
    IF FOUND THEN
      RAISE LOG '[HANDLE_NEW_USER] ✅ Convite encontrado - Role: %, WhatsApp: %', 
        invite_record.role_id, 
        COALESCE(invite_record.whatsapp_number, 'não fornecido');
      
      default_role_id := invite_record.role_id;
      
      -- Extrair nome do email
      extracted_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
      );
      
      RAISE LOG '[HANDLE_NEW_USER] Nome extraído: %', extracted_name;
      RAISE LOG '[HANDLE_NEW_USER] Tentando criar perfil...';
      
      -- Criar perfil do usuário com dados do convite
      BEGIN
        INSERT INTO public.profiles (
          id,
          email,
          role_id,
          name,
          whatsapp_number,
          created_at,
          updated_at,
          onboarding_completed,
          status
        ) VALUES (
          NEW.id,
          NEW.email,
          default_role_id,
          extracted_name,
          invite_record.whatsapp_number,
          now(),
          now(),
          false,
          'active'
        );
        
        RAISE LOG '[HANDLE_NEW_USER] ✅ Perfil criado com sucesso!';
        
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING '[HANDLE_NEW_USER] ❌ ERRO ao criar perfil: % (SQLSTATE: %)', 
            SQLERRM, SQLSTATE;
          RAISE;
      END;
      
      -- Atualizar status do convite
      UPDATE public.invites
      SET 
        status = 'accepted',
        accepted_at = now(),
        updated_at = now()
      WHERE id = invite_record.id;
      
      RAISE LOG '[HANDLE_NEW_USER] ✅ Convite marcado como aceito';
      
      -- Criar registro de onboarding
      BEGIN
        INSERT INTO public.onboarding_final (
          user_id,
          current_step,
          completed,
          created_at,
          updated_at
        ) VALUES (
          NEW.id,
          1,
          false,
          now(),
          now()
        );
        
        RAISE LOG '[HANDLE_NEW_USER] ✅ Registro de onboarding criado';
        
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING '[HANDLE_NEW_USER] ⚠️ Erro ao criar onboarding: %', SQLERRM;
      END;
      
      -- Criar log de auditoria
      BEGIN
        INSERT INTO public.audit_logs (
          user_id,
          action,
          entity_type,
          entity_id,
          details,
          ip_address,
          user_agent,
          created_at
        ) VALUES (
          NEW.id,
          'user_registered',
          'user',
          NEW.id,
          jsonb_build_object(
            'email', NEW.email,
            'invite_token', invite_token,
            'role_id', default_role_id
          ),
          NULL,
          NULL,
          now()
        );
        
        RAISE LOG '[HANDLE_NEW_USER] ✅ Log de auditoria criado';
        
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING '[HANDLE_NEW_USER] ⚠️ Erro ao criar audit log: %', SQLERRM;
      END;
      
    ELSE
      RAISE WARNING '[HANDLE_NEW_USER] ⚠️ Convite não encontrado ou inválido para token: %', invite_token;
    END IF;
  ELSE
    RAISE LOG '[HANDLE_NEW_USER] ⚠️ Nenhum token de convite fornecido';
  END IF;
  
  RAISE LOG '[HANDLE_NEW_USER] ======================================== FIM';
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '[HANDLE_NEW_USER] ❌ ERRO GERAL: % (SQLSTATE: %)', 
      SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;