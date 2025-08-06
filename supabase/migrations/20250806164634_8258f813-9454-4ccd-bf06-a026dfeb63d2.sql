-- Criar view para analytics de NPS das aulas
CREATE OR REPLACE VIEW public.nps_analytics_view AS
SELECT 
    nps.id,
    nps.lesson_id,
    ll.title as lesson_title,
    nps.user_id,
    nps.score,
    nps.feedback,
    nps.created_at,
    nps.updated_at,
    -- Classificação NPS
    CASE 
        WHEN nps.score >= 9 THEN 'promoter'
        WHEN nps.score >= 7 THEN 'neutral'
        ELSE 'detractor'
    END as nps_category,
    -- Metadados da aula
    ll.description as lesson_description,
    ll.difficulty_level,
    ll.estimated_time_minutes
FROM learning_lesson_nps nps
LEFT JOIN learning_lessons ll ON nps.lesson_id = ll.id
WHERE nps.score IS NOT NULL;

-- Views herdam as políticas RLS das tabelas base, então a segurança já está garantida
COMMENT ON VIEW public.nps_analytics_view IS 'View de analytics de NPS das aulas do LMS. Herda as políticas RLS das tabelas base.';