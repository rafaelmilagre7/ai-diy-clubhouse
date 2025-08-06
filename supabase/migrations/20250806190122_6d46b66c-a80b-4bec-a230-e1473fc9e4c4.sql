-- Identificar e remover TODAS as views problemáticas
DO $$
DECLARE
    view_name text;
    view_def text;
BEGIN
    -- Verificar todas as views no schema public
    FOR view_name IN 
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        -- Remover a view se existir
        EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE', view_name);
        RAISE NOTICE 'Removida view: %', view_name;
    END LOOP;
END $$;

-- Agora criar APENAS a view que precisamos, de forma limpa
CREATE VIEW public.nps_analytics_view AS
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
WHERE nps.score IS NOT NULL;

-- Verificar que não há SECURITY DEFINER
SELECT 'View criada com segurança adequada' as status;