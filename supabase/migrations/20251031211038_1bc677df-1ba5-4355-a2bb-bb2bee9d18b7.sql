-- ============================================
-- CORREÇÃO RLS: Permitir conclusão do onboarding (false → true)
-- ============================================
-- Problema: profiles_update_safe_fields_only bloqueava QUALQUER mudança em onboarding_completed
-- Solução: Permitir false → true (conclusão), bloquear true → false (segurança)

-- Remover política antiga
DROP POLICY IF EXISTS profiles_update_safe_fields_only ON public.profiles;

-- Criar nova política com condição modificada
CREATE POLICY profiles_update_safe_fields_only 
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND (
    SELECT 
      profiles.id = current_id
      AND profiles.email = current_email
      AND COALESCE(profiles.role_id, '00000000-0000-0000-0000-000000000000') = COALESCE(current_role_id, '00000000-0000-0000-0000-000000000000')
      AND COALESCE(profiles.organization_id, '00000000-0000-0000-0000-000000000000') = COALESCE(current_organization_id, '00000000-0000-0000-0000-000000000000')
      AND COALESCE(profiles.is_master_user, false) = COALESCE(current_is_master_user, false)
      AND COALESCE(profiles.status, 'active') = COALESCE(current_status, 'active')
      -- ✅ MODIFICAÇÃO: Permite false → true, bloqueia true → false
      AND (
        -- Mantém o mesmo valor (sempre permitido)
        COALESCE(profiles.onboarding_completed, false) = COALESCE(current_onboarding_completed, false)
        OR
        -- Permite conclusão: era false e agora é true
        (COALESCE(current_onboarding_completed, false) = false AND COALESCE(profiles.onboarding_completed, false) = true)
      )
    FROM get_current_profile_values(auth.uid())
  )
);

-- Adicionar comentário explicativo
COMMENT ON POLICY profiles_update_safe_fields_only ON public.profiles IS 
'Permite atualização de campos editáveis. Protege campos sensíveis (id, email, role_id, organization_id, is_master_user, status). Permite onboarding_completed mudar de false para true (conclusão), mas não de true para false (segurança).';