-- Remover acesso do role 'formacao' ao curso 'HotSeats do Club' para mostrar o cadeado
DELETE FROM public.course_access_control 
WHERE course_id = '0dd18ae4-a788-4ef3-8bbf-3f355eab1c12' -- HotSeats do Club
  AND role_id = '5af9d491-6125-4b25-a0c7-13aecbc8a56a'; -- formacao