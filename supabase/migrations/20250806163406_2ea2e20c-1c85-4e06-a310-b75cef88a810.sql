-- Criar view para analytics de NPS das aulas (versão final corrigida)
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

-- Habilitar RLS para a view
ALTER VIEW public.nps_analytics_view SET (security_invoker = true);

-- Criar política para admins verem todos os dados de NPS
CREATE POLICY "nps_analytics_admin_access" ON public.nps_analytics_view
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        JOIN user_roles ur ON p.role_id = ur.id  
        WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
);