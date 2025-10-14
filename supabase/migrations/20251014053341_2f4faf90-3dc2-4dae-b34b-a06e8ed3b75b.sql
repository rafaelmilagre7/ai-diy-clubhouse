-- Deletar perfil v2 do usuário atual para permitir recriação com ai_persona válido
-- O perfil será recriado automaticamente pela edge function initialize-networking-profile
DELETE FROM networking_profiles_v2 
WHERE user_id = 'dc418224-acd7-4f5f-9a7e-e1c981b78fb6';