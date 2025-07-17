-- FASE 1: REFATORAÇÃO SIMPLIFICADA DO ONBOARDING PARA NOVOS USUÁRIOS
-- Foco em limpeza e simplificação sem tocar no storage por enquanto

-- 1. Criar bucket para profile pictures se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-pictures', 'profile-pictures', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Limpeza de tabelas desnecessárias (manter apenas onboarding_final)
DROP TABLE IF EXISTS public.onboarding CASCADE;
DROP TABLE IF EXISTS public.user_onboarding CASCADE;
DROP TABLE IF EXISTS public.onboarding_users CASCADE;
DROP TABLE IF EXISTS public.quick_onboarding CASCADE;

-- 3. Atualizar usuários legacy para completed se necessário
UPDATE public.onboarding_final 
SET 
  status = 'completed',
  is_completed = true,
  completed_at = COALESCE(completed_at, now()),
  updated_at = now()
WHERE is_completed = false 
  AND user_id IN (
    SELECT p.id 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.created_at < '2025-07-16'  -- usuários criados antes de hoje são legacy
  );

-- 4. RLS simplificada para onboarding_final - apenas o próprio usuário pode acessar
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados de onboarding" ON public.onboarding_final;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados de onboarding" ON public.onboarding_final;
DROP POLICY IF EXISTS "Admins podem ver todos os dados de onboarding" ON public.onboarding_final;
DROP POLICY IF EXISTS "onboarding_final_secure_insert" ON public.onboarding_final;

CREATE POLICY "users_manage_own_onboarding"
ON public.onboarding_final
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy adicional para admins verem todos os dados
CREATE POLICY "admins_view_all_onboarding"
ON public.onboarding_final
FOR SELECT
TO authenticated
USING (is_user_admin(auth.uid()));

-- 5. Função simplificada para verificar se usuário é novo
CREATE OR REPLACE FUNCTION public.is_new_user(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT created_at > '2025-07-16'::date 
     FROM public.profiles 
     WHERE id = check_user_id), 
    false
  );
$$;

-- 6. Função para resetar onboarding de um usuário (admin only)
CREATE OR REPLACE FUNCTION public.reset_user_onboarding(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Reset onboarding data
  DELETE FROM public.onboarding_final WHERE user_id = target_user_id;
  
  -- Reset profile onboarding status
  UPDATE public.profiles
  SET 
    onboarding_completed = false,
    onboarding_completed_at = NULL,
    updated_at = now()
  WHERE id = target_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Onboarding resetado com sucesso'
  );
END;
$$;

-- 7. Storage policies para profile pictures usando a abordagem correta
CREATE POLICY "profile_pictures_public_view"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-pictures');

CREATE POLICY "profile_pictures_authenticated_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "profile_pictures_owner_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "profile_pictures_owner_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 8. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_onboarding_final_user_status 
ON public.onboarding_final(user_id, status, is_completed);

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_status 
ON public.profiles(onboarding_completed, created_at);

-- 9. Limpeza final - remover dados órfãos
DELETE FROM public.onboarding_final 
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- 10. Log da refatoração
INSERT INTO public.audit_logs (
  event_type,
  action,
  details
) VALUES (
  'system_refactor',
  'onboarding_refactor_simple',
  jsonb_build_object(
    'description', 'Refatoração simplificada do onboarding para novos usuários',
    'changes', ARRAY[
      'Criado bucket profile-pictures',
      'RLS policies simplificadas',
      'Removidas tabelas desnecessárias',
      'Atualizados usuários legacy para completed',
      'Criadas funções auxiliares'
    ],
    'timestamp', now()
  )
);