-- Atualizar perfil do usuário atual para marcar onboarding como completo
UPDATE profiles 
SET onboarding_completed = true,
    updated_at = now()
WHERE id = auth.uid();