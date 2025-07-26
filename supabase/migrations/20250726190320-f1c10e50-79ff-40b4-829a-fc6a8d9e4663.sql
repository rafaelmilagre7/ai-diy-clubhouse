-- Corrigir problemas de integridade de dados e adicionar constraints faltantes

-- Adicionar constraint NOT NULL para campos críticos
ALTER TABLE public.progress 
ALTER COLUMN user_id SET NOT NULL,
ALTER COLUMN solution_id SET NOT NULL;

-- Garantir que completion_percentage esteja entre 0 e 100
ALTER TABLE public.progress 
ADD CONSTRAINT progress_completion_percentage_range 
CHECK (completion_percentage >= 0 AND completion_percentage <= 100);

-- Adicionar constraint para campos obrigatórios em solution_certificates
ALTER TABLE public.solution_certificates 
ALTER COLUMN user_id SET NOT NULL,
ALTER COLUMN solution_id SET NOT NULL,
ALTER COLUMN validation_code SET NOT NULL;

-- Adicionar constraint unique para validation_code
ALTER TABLE public.solution_certificates 
ADD CONSTRAINT solution_certificates_validation_code_unique 
UNIQUE (validation_code);

-- Melhorar constraint para profiles
ALTER TABLE public.profiles 
ALTER COLUMN email SET NOT NULL;

-- Adicionar constraint para email único
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_email_unique 
UNIQUE (email);

-- Garantir que soluções tenham título
ALTER TABLE public.solutions 
ALTER COLUMN title SET NOT NULL;

-- Constraint para garantir que learning_progress tenha valores válidos
ALTER TABLE public.learning_progress 
ADD CONSTRAINT learning_progress_percentage_range 
CHECK (progress_percentage >= 0 AND progress_percentage <= 100);