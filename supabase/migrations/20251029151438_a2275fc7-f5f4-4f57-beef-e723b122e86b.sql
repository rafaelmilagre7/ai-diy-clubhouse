
-- Desabilitar temporariamente o trigger problemático
ALTER TABLE onboarding_final DISABLE TRIGGER onboarding_strategic_data_sync;

-- Corrigir nina_message para usuários sem ela
DO $$
DECLARE
  affected_count INT;
BEGIN
  UPDATE onboarding_final
  SET 
    nina_message = 'Olá ' || COALESCE(personal_info->>'name', 'usuário') || '! 🎉 Que alegria ter você conosco no Viver de IA!

Estou muito animada para acompanhar sua jornada de transformação digital na ' || COALESCE(professional_info->>'company_name', 'sua empresa') || '. Com base no que você compartilhou, vejo um grande potencial para ' || COALESCE(goals_info->>'primary_goal', 'transformar seu negócio') || ' usando inteligência artificial.

Preparei uma experiência completamente personalizada para você, com conteúdos e ferramentas que fazem sentido para seu contexto e objetivos. 

Vamos começar? Sua trilha personalizada já está pronta! 🚀',
    updated_at = NOW()
  WHERE is_completed = true
    AND (nina_message IS NULL OR nina_message = '');
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RAISE NOTICE '✅ Corrigidos % registros', affected_count;
END $$;

-- Reabilitar o trigger
ALTER TABLE onboarding_final ENABLE TRIGGER onboarding_strategic_data_sync;
