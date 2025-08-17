-- Inserir o papel 'lovable_course' diretamente para desbloquear o uso
INSERT INTO public.user_roles (name, description, is_system, created_at, updated_at)
SELECT 'lovable_course', 'Curso Lovable na Prática', false, now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles WHERE name = 'lovable_course'
);
