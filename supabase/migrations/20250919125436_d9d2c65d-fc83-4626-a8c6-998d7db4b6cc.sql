-- Alterar status do convite para expirado
UPDATE invites 
SET 
  used_at = NULL,
  expires_at = '2025-08-14 00:00:00+00'
WHERE id = '3da89b65-ecde-49d1-8cb0-dedc624e2c1c'
  AND email = 'annajullia@tuamaeaquelaursa.com';