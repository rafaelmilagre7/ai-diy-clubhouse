-- Recriar view para incluir dados reais do usuário
DROP VIEW IF EXISTS public.nps_analytics_view;

CREATE VIEW public.nps_analytics_view AS
SELECT 
    nps.id,
    nps.lesson_id,
    ll.title as lesson_title,
    nps.user_id,
    -- Dados do usuário
    COALESCE(p.name, p.email, 'Usuário Anônimo') as user_name,
    p.email as user_email,
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
LEFT JOIN profiles p ON nps.user_id = p.id
WHERE nps.score IS NOT NULL;