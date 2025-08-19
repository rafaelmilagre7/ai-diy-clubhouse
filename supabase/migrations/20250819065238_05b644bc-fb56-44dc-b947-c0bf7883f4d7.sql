-- Remover tabelas de gamificação de certificados
DROP TABLE IF EXISTS certificate_shares CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;

-- Remover função de achievements
DROP FUNCTION IF EXISTS check_and_grant_achievements(uuid) CASCADE;