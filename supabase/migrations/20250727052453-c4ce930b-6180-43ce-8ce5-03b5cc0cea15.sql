-- Sincronizar dados do onboarding_final para profiles
-- Atualizar perfil do Rafael com dados do onboarding completo

DO $$
DECLARE
    onb_data RECORD;
    phone_clean TEXT;
BEGIN
    -- Buscar dados do onboarding_final para o usuário
    SELECT * INTO onb_data 
    FROM onboarding_final 
    WHERE user_id = 'dc418224-acd7-4f5f-9a7e-e1c981b78fb6'
    AND is_completed = true;
    
    IF FOUND THEN
        -- Limpar telefone (remover caracteres especiais)
        phone_clean := regexp_replace(
            onb_data.personal_info->>'phone', 
            '[^0-9+]', 
            '', 
            'g'
        );
        
        -- Atualizar perfil com dados do onboarding
        UPDATE profiles SET
            whatsapp_number = phone_clean,
            company_name = COALESCE(
                onb_data.business_info->>'company_name',
                onb_data.professional_info->>'company_name',
                company_name
            ),
            industry = COALESCE(
                onb_data.business_info->>'company_sector',
                onb_data.professional_info->>'company_sector',
                industry
            ),
            current_position = COALESCE(
                onb_data.business_info->>'current_position',
                onb_data.professional_info->>'current_position',
                current_position
            ),
            linkedin_url = COALESCE(
                onb_data.personal_info->>'linkedin_url',
                linkedin_url
            ),
            updated_at = now()
        WHERE id = 'dc418224-acd7-4f5f-9a7e-e1c981b78fb6';
        
        RAISE NOTICE 'Perfil sincronizado com dados do onboarding para usuário: %', onb_data.personal_info->>'name';
        RAISE NOTICE 'Telefone atualizado para: %', phone_clean;
    ELSE
        RAISE NOTICE 'Nenhum onboarding completo encontrado para o usuário';
    END IF;
END $$;