-- Inserir ou atualizar durações dos cursos com valores fixos
INSERT INTO course_durations (course_id, total_duration_seconds, calculated_hours, sync_status, last_sync_at, updated_at) 
VALUES 
  ('0681d0f6-a85f-49ab-b464-2c09b402c495', 79200, '22 horas', 'completed', NOW(), NOW()),
  ('0dd18ae4-a788-4ef3-8bbf-3f355eab1c12', 306000, '85 horas', 'completed', NOW(), NOW()),
  ('fccc4e04-9e69-4e56-8b72-a09f5a71bff3', 14400, '4 horas', 'completed', NOW(), NOW())
ON CONFLICT (course_id) 
DO UPDATE SET 
  total_duration_seconds = EXCLUDED.total_duration_seconds,
  calculated_hours = EXCLUDED.calculated_hours,
  sync_status = 'completed',
  last_sync_at = NOW(),
  updated_at = NOW();