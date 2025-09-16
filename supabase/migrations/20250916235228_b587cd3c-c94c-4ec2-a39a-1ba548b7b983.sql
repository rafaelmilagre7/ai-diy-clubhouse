-- Adicionar duração do curso "Isso é Copy! Com AI"
INSERT INTO course_durations (course_id, total_duration_seconds, calculated_hours, sync_status, last_sync_at, updated_at) 
VALUES 
  ('cd286906-c457-4ab5-8c30-88ec2a0e09db', 7200, '2 horas', 'completed', NOW(), NOW())
ON CONFLICT (course_id) 
DO UPDATE SET 
  total_duration_seconds = EXCLUDED.total_duration_seconds,
  calculated_hours = EXCLUDED.calculated_hours,
  sync_status = 'completed',
  last_sync_at = NOW(),
  updated_at = NOW();