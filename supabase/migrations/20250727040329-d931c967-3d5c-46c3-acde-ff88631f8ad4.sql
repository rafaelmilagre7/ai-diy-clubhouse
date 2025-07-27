-- Corrigir o evento pai para data atual (próxima quinta-feira 31/07/2025)
UPDATE events 
SET 
  start_time = '2025-07-31 22:30:00+00:00', 
  end_time = '2025-08-01 00:00:00+00:00'
WHERE id = '66c0bb33-461f-4fd2-887f-5be17e29cc38';