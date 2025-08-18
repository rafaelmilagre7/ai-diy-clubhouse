-- Adicionar acesso do role 'formacao' ao curso 'HotSeats do Club'
INSERT INTO public.course_access_control (course_id, role_id)
VALUES (
  '0dd18ae4-a788-4ef3-8bbf-3f355eab1c12', -- HotSeats do Club
  '5af9d491-6125-4b25-a0c7-13aecbc8a56a'  -- formacao
)
ON CONFLICT (course_id, role_id) DO NOTHING;