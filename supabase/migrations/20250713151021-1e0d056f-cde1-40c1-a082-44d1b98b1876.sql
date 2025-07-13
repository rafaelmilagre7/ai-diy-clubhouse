-- Verificar se o trigger existe
SELECT 
  tgname as trigger_name,
  tgtype as trigger_type,
  proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'onboarding_final'
AND tgname = 'update_onboarding_final_updated_at';