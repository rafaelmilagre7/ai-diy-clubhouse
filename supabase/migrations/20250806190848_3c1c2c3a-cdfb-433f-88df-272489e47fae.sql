-- Remover a view problemática e criar uma função segura
DROP VIEW IF EXISTS public.nps_analytics_view;

-- Criar função para buscar dados de NPS analytics de forma segura
CREATE OR REPLACE FUNCTION public.get_nps_analytics_data()
RETURNS TABLE (
    id uuid,
    lesson_id uuid,
    lesson_title text,
    user_id uuid,
    user_name text,
    user_email text,
    score integer,
    feedback text,
    created_at timestamptz,
    updated_at timestamptz,
    nps_category text,
    lesson_description text,
    difficulty_level text,
    estimated_time_minutes integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        nps.id,
        nps.lesson_id,
        ll.title as lesson_title,
        nps.user_id,
        COALESCE(p.name, p.email, 'Usuário Anônimo') as user_name,
        p.email as user_email,
        nps.score,
        nps.feedback,
        nps.created_at,
        nps.updated_at,
        CASE 
            WHEN nps.score >= 9 THEN 'promoter'
            WHEN nps.score >= 7 THEN 'neutral'
            ELSE 'detractor'
        END as nps_category,
        ll.description as lesson_description,
        ll.difficulty_level,
        ll.estimated_time_minutes
    FROM learning_lesson_nps nps
    LEFT JOIN learning_lessons ll ON nps.lesson_id = ll.id
    LEFT JOIN profiles p ON nps.user_id = p.id
    WHERE nps.score IS NOT NULL
    AND (
        -- Apenas admins podem ver todos os dados
        public.is_user_admin_secure(auth.uid()) = true
        OR 
        -- Usuários podem ver apenas seus próprios dados
        nps.user_id = auth.uid()
    )
    ORDER BY nps.created_at DESC;
$$;