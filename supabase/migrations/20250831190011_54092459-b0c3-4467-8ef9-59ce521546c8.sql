-- Limpeza completa para email carolinelischt@wra-usa.com
-- Remover deliveries relacionadas primeiro (FK constraint)
DELETE FROM invite_deliveries 
WHERE invite_id = '2b8e01f2-d415-4506-9b38-0dab1b36ee1a';

-- Remover convite deletado fisicamente
DELETE FROM invites 
WHERE email = 'carolinelischt@wra-usa.com' 
AND id = '2b8e01f2-d415-4506-9b38-0dab1b36ee1a';

-- Verificar se email está completamente limpo
-- Esta query não retornará linhas se a limpeza foi bem-sucedida
DO $$
DECLARE
  invite_count INTEGER;
  profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invite_count FROM invites WHERE email = 'carolinelischt@wra-usa.com';
  SELECT COUNT(*) INTO profile_count FROM profiles WHERE email = 'carolinelischt@wra-usa.com';
  
  IF invite_count = 0 AND profile_count = 0 THEN
    RAISE NOTICE 'Email carolinelischt@wra-usa.com completamente liberado para novo convite';
  ELSE
    RAISE NOTICE 'Ainda existem registros: % convites, % profiles', invite_count, profile_count;
  END IF;
END
$$;