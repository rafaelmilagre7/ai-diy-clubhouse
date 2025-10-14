-- =====================================================
-- SINCRONIZAÇÃO COMPLETA DE DADOS ESTRATÉGICOS
-- =====================================================

-- FASE 1: Sincronizar dados básicos existentes
UPDATE profiles p
SET 
  whatsapp_number = COALESCE(p.whatsapp_number, o.personal_info->>'phone'),
  linkedin_url = COALESCE(p.linkedin_url, o.personal_info->>'linkedin_url'),
  company_name = COALESCE(p.company_name, o.professional_info->>'company_name'),
  current_position = COALESCE(p.current_position, o.professional_info->>'current_position'),
  industry = COALESCE(p.industry, o.professional_info->>'company_sector'),
  updated_at = NOW()
FROM onboarding_final o
WHERE p.id = o.user_id
  AND o.is_completed = true
  AND (
    (p.whatsapp_number IS NULL OR p.whatsapp_number = '') AND o.personal_info->>'phone' IS NOT NULL
    OR (p.linkedin_url IS NULL OR p.linkedin_url = '') AND o.personal_info->>'linkedin_url' IS NOT NULL
    OR (p.company_name IS NULL OR p.company_name = '') AND o.professional_info->>'company_name' IS NOT NULL
    OR (p.current_position IS NULL OR p.current_position = '') AND o.professional_info->>'current_position' IS NOT NULL
    OR (p.industry IS NULL OR p.industry = '') AND o.professional_info->>'company_sector' IS NOT NULL
  );

-- FASE 2: Adicionar colunas estratégicas faltantes
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS company_size TEXT,
  ADD COLUMN IF NOT EXISTS annual_revenue TEXT,
  ADD COLUMN IF NOT EXISTS primary_goal TEXT,
  ADD COLUMN IF NOT EXISTS priority_areas TEXT[],
  ADD COLUMN IF NOT EXISTS main_challenge TEXT;

-- FASE 3: Popular novas colunas com dados do onboarding
UPDATE profiles p
SET 
  company_size = o.professional_info->>'company_size',
  annual_revenue = o.professional_info->>'annual_revenue',
  primary_goal = o.goals_info->>'primary_goal',
  priority_areas = CASE 
    WHEN o.goals_info->'priority_areas' IS NOT NULL 
    THEN ARRAY(SELECT jsonb_array_elements_text(o.goals_info->'priority_areas'))
    ELSE NULL
  END,
  main_challenge = o.professional_info->>'main_challenge',
  updated_at = NOW()
FROM onboarding_final o
WHERE p.id = o.user_id
  AND o.is_completed = true;

-- FASE 4: Criar trigger de sincronização automática
CREATE OR REPLACE FUNCTION sync_strategic_data_from_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  -- Apenas sincronizar quando onboarding estiver completo
  IF NEW.is_completed = true THEN
    UPDATE profiles 
    SET 
      whatsapp_number = COALESCE(whatsapp_number, NEW.personal_info->>'phone'),
      linkedin_url = COALESCE(linkedin_url, NEW.personal_info->>'linkedin_url'),
      company_name = COALESCE(company_name, NEW.professional_info->>'company_name'),
      current_position = COALESCE(current_position, NEW.professional_info->>'current_position'),
      industry = COALESCE(industry, NEW.professional_info->>'company_sector'),
      company_size = NEW.professional_info->>'company_size',
      annual_revenue = NEW.professional_info->>'annual_revenue',
      primary_goal = NEW.goals_info->>'primary_goal',
      priority_areas = CASE 
        WHEN NEW.goals_info->'priority_areas' IS NOT NULL 
        THEN ARRAY(SELECT jsonb_array_elements_text(NEW.goals_info->'priority_areas'))
        ELSE priority_areas
      END,
      main_challenge = NEW.professional_info->>'main_challenge',
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS onboarding_strategic_data_sync ON onboarding_final;

-- Criar novo trigger
CREATE TRIGGER onboarding_strategic_data_sync
AFTER INSERT OR UPDATE ON onboarding_final
FOR EACH ROW
EXECUTE FUNCTION sync_strategic_data_from_onboarding();

-- FASE 5: Atualizar networking_profiles_v2 com dados enriquecidos
UPDATE networking_profiles_v2 np
SET 
  value_proposition = COALESCE(
    CONCAT(
      COALESCE(o.goals_info->>'primary_goal', ''),
      ' • ',
      COALESCE(o.professional_info->>'company_sector', '')
    ),
    np.value_proposition
  ),
  looking_for = CASE 
    WHEN o.goals_info->'priority_areas' IS NOT NULL 
    THEN ARRAY(SELECT jsonb_array_elements_text(o.goals_info->'priority_areas'))
    ELSE np.looking_for
  END,
  main_challenge = COALESCE(o.professional_info->>'main_challenge', np.main_challenge),
  last_updated_at = NOW()
FROM onboarding_final o
WHERE np.user_id = o.user_id
  AND o.is_completed = true;