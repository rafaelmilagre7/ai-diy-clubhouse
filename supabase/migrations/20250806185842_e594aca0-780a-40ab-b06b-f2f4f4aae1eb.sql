-- Buscar e limpar todas as views relacionadas ao NPS
DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Listar todas as views que possam ter SECURITY DEFINER
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND (viewname LIKE '%nps%' OR viewname LIKE '%analytics%')
    LOOP
        -- Recriar view sem SECURITY DEFINER
        IF view_record.viewname = 'nps_analytics_view' THEN
            EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schemaname, view_record.viewname);
        END IF;
    END LOOP;
END $$;

-- Recriar a view corretamente
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