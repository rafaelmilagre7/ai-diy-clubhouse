
-- MIGRAÇÃO CORRIGIDA: Restauração das tabelas solutions e progress
-- ===============================================================

-- Primeiro, vamos verificar a estrutura real da tabela de backup
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cleanup_backup_solutions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Agora vamos criar as tabelas corretamente baseado nos dados reais
CREATE TABLE IF NOT EXISTS public.solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'advanced')),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  slug TEXT UNIQUE,
  thumbnail_url TEXT,
  tags TEXT[],
  implementation_steps JSONB,
  checklist_items JSONB,
  completion_requirements JSONB,
  related_solutions TEXT[]
);

CREATE TABLE IF NOT EXISTS public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  solution_id UUID NOT NULL,
  current_module INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_modules INTEGER[] DEFAULT '{}',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completion_data JSONB DEFAULT '{}',
  implementation_status TEXT DEFAULT 'not_started',
  
  UNIQUE(user_id, solution_id)
);

-- Migrar dados de solutions com colunas que realmente existem
INSERT INTO public.solutions (
  id, title, description, difficulty, published, 
  created_at, updated_at, slug, thumbnail_url, 
  tags, implementation_steps, checklist_items, 
  completion_requirements, related_solutions
)
SELECT 
  COALESCE(id, gen_random_uuid()),
  COALESCE(title, 'Solução sem título'),
  description,
  CASE 
    WHEN difficulty::text = 'easy' THEN 'easy'
    WHEN difficulty::text = 'advanced' THEN 'advanced'
    ELSE 'medium'
  END as difficulty,
  COALESCE(published, false),
  COALESCE(created_at, now()),
  COALESCE(updated_at, now()),
  slug,
  thumbnail_url,
  tags,
  implementation_steps,
  checklist_items,
  completion_requirements,
  related_solutions
FROM public.cleanup_backup_solutions
WHERE title IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  difficulty = EXCLUDED.difficulty,
  published = EXCLUDED.published,
  updated_at = now();

-- Adicionar categoria padrão baseada no título/conteúdo
UPDATE public.solutions SET category = 
  CASE 
    WHEN title ILIKE '%receita%' OR title ILIKE '%revenue%' OR title ILIKE '%vendas%' THEN 'Receita'
    WHEN title ILIKE '%operacional%' OR title ILIKE '%automação%' OR title ILIKE '%processo%' THEN 'Operacional'
    WHEN title ILIKE '%estratégia%' OR title ILIKE '%strategy%' OR title ILIKE '%planejamento%' THEN 'Estratégia'
    ELSE 'Operacional'
  END
WHERE category IS NULL;

-- Migrar dados de progress
INSERT INTO public.progress (
  id, user_id, solution_id, current_module,
  is_completed, completed_modules, last_activity,
  completed_at, created_at, completion_data, implementation_status
)
SELECT 
  COALESCE(id, gen_random_uuid()),
  user_id,
  solution_id,
  COALESCE(current_module, 0),
  COALESCE(is_completed, false),
  COALESCE(completed_modules, '{}'),
  COALESCE(last_activity, now()),
  completed_at,
  COALESCE(created_at, now()),
  COALESCE(completion_data, '{}'),
  COALESCE(implementation_status, 'not_started')
FROM public.cleanup_backup_progress
WHERE user_id IS NOT NULL 
  AND solution_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.solutions WHERE id = cleanup_backup_progress.solution_id)
ON CONFLICT (user_id, solution_id) DO UPDATE SET
  current_module = EXCLUDED.current_module,
  is_completed = EXCLUDED.is_completed,
  completed_modules = EXCLUDED.completed_modules,
  last_activity = EXCLUDED.last_activity,
  completed_at = EXCLUDED.completed_at,
  completion_data = EXCLUDED.completion_data,
  implementation_status = EXCLUDED.implementation_status;

-- Configurar RLS
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Políticas para solutions
DROP POLICY IF EXISTS "solutions_select_policy" ON public.solutions;
DROP POLICY IF EXISTS "solutions_insert_policy" ON public.solutions;
DROP POLICY IF EXISTS "solutions_update_policy" ON public.solutions;
DROP POLICY IF EXISTS "solutions_delete_policy" ON public.solutions;

CREATE POLICY "solutions_select_policy" ON public.solutions
  FOR SELECT 
  USING (
    published = true 
    OR 
    public.is_user_admin(auth.uid())
  );

CREATE POLICY "solutions_insert_policy" ON public.solutions
  FOR INSERT 
  WITH CHECK (public.is_user_admin(auth.uid()));

CREATE POLICY "solutions_update_policy" ON public.solutions
  FOR UPDATE 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "solutions_delete_policy" ON public.solutions
  FOR DELETE 
  USING (public.is_user_admin(auth.uid()));

-- Políticas para progress
DROP POLICY IF EXISTS "progress_select_policy" ON public.progress;
DROP POLICY IF EXISTS "progress_insert_policy" ON public.progress;
DROP POLICY IF EXISTS "progress_update_policy" ON public.progress;
DROP POLICY IF EXISTS "progress_delete_policy" ON public.progress;

CREATE POLICY "progress_select_policy" ON public.progress
  FOR SELECT 
  USING (
    user_id = auth.uid() 
    OR 
    public.is_user_admin(auth.uid())
  );

CREATE POLICY "progress_insert_policy" ON public.progress
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "progress_update_policy" ON public.progress
  FOR UPDATE 
  USING (
    user_id = auth.uid() 
    OR 
    public.is_user_admin(auth.uid())
  );

CREATE POLICY "progress_delete_policy" ON public.progress
  FOR DELETE 
  USING (
    user_id = auth.uid() 
    OR 
    public.is_user_admin(auth.uid())
  );

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_solutions_updated_at ON public.solutions;
CREATE TRIGGER update_solutions_updated_at 
    BEFORE UPDATE ON public.solutions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verificação final
SELECT 
  'solutions' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE published = true) as published_count,
  COUNT(*) FILTER (WHERE published = false) as draft_count
FROM public.solutions
UNION ALL
SELECT 
  'progress' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE is_completed = true) as completed_count,
  COUNT(*) FILTER (WHERE is_completed = false) as in_progress_count
FROM public.progress;
