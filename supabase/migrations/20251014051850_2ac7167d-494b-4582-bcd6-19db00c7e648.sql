-- Permitir que ai_persona seja nullable
ALTER TABLE networking_profiles_v2 
ALTER COLUMN ai_persona DROP NOT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN networking_profiles_v2.ai_persona IS 
'Análise de IA do perfil. Pode ser null se a análise falhar ou estiver pendente.';