-- Criar funções seguras para dados de analytics administrativos

-- Função para dados de overview administrativo
CREATE OR REPLACE FUNCTION public.get_admin_analytics_overview()
RETURNS TABLE (
    total_users bigint,
    total_solutions bigint,
    completed_implementations bigint,
    active_implementations bigint,
    active_users_7d bigint,
    new_users_30d bigint,
    new_implementations_30d bigint,
    overall_completion_rate numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        COALESCE((SELECT COUNT(*) FROM profiles), 0) as total_users,
        COALESCE((SELECT COUNT(*) FROM solutions WHERE status = 'published'), 0) as total_solutions,
        COALESCE((SELECT COUNT(*) FROM implementation_requests WHERE status = 'completed'), 0) as completed_implementations,
        COALESCE((SELECT COUNT(*) FROM implementation_requests WHERE status IN ('pending', 'in_progress')), 0) as active_implementations,
        COALESCE((SELECT COUNT(DISTINCT user_id) FROM analytics WHERE created_at >= NOW() - INTERVAL '7 days'), 0) as active_users_7d,
        COALESCE((SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days'), 0) as new_users_30d,
        COALESCE((SELECT COUNT(*) FROM implementation_requests WHERE created_at >= NOW() - INTERVAL '30 days'), 0) as new_implementations_30d,
        CASE 
            WHEN (SELECT COUNT(*) FROM implementation_requests) > 0 
            THEN ROUND((SELECT COUNT(*) FROM implementation_requests WHERE status = 'completed')::numeric / (SELECT COUNT(*) FROM implementation_requests)::numeric * 100, 2)
            ELSE 0 
        END as overall_completion_rate
    WHERE public.is_user_admin_secure(auth.uid()) = true;
$$;

-- Função para performance de soluções
CREATE OR REPLACE FUNCTION public.get_solution_performance_metrics()
RETURNS TABLE (
    id uuid,
    title text,
    category text,
    total_implementations bigint,
    completion_rate numeric,
    avg_rating numeric,
    created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        s.id,
        s.title,
        s.category,
        COALESCE(COUNT(ir.id), 0) as total_implementations,
        CASE 
            WHEN COUNT(ir.id) > 0 
            THEN ROUND(COUNT(CASE WHEN ir.status = 'completed' THEN 1 END)::numeric / COUNT(ir.id)::numeric * 100, 2)
            ELSE 0 
        END as completion_rate,
        0::numeric as avg_rating, -- Placeholder para avaliações futuras
        s.created_at
    FROM solutions s
    LEFT JOIN implementation_requests ir ON s.id = ir.solution_id
    WHERE s.status = 'published'
    AND public.is_user_admin_secure(auth.uid()) = true
    GROUP BY s.id, s.title, s.category, s.created_at
    ORDER BY total_implementations DESC;
$$;

-- Função para crescimento de usuários por data
CREATE OR REPLACE FUNCTION public.get_user_growth_by_date()
RETURNS TABLE (
    date date,
    name text,
    total bigint,
    novos bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH date_series AS (
        SELECT generate_series(
            CURRENT_DATE - INTERVAL '30 days',
            CURRENT_DATE,
            '1 day'::interval
        )::date as date
    ),
    daily_registrations AS (
        SELECT 
            p.created_at::date as date,
            COUNT(*) as novos
        FROM profiles p
        WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY p.created_at::date
    ),
    running_totals AS (
        SELECT 
            ds.date,
            COALESCE(dr.novos, 0) as novos,
            (SELECT COUNT(*) FROM profiles WHERE created_at::date <= ds.date) as total
        FROM date_series ds
        LEFT JOIN daily_registrations dr ON ds.date = dr.date
    )
    SELECT 
        rt.date,
        to_char(rt.date, 'DD/MM') as name,
        rt.total,
        rt.novos
    FROM running_totals rt
    WHERE public.is_user_admin_secure(auth.uid()) = true
    ORDER BY rt.date;
$$;

-- Função para padrões de atividade semanal
CREATE OR REPLACE FUNCTION public.get_weekly_activity_patterns()
RETURNS TABLE (
    day text,
    day_of_week integer,
    atividade bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH weekly_stats AS (
        SELECT 
            EXTRACT(DOW FROM a.created_at) as day_of_week,
            COUNT(*) as atividade
        FROM analytics a
        WHERE a.created_at >= NOW() - INTERVAL '30 days'
        AND public.is_user_admin_secure(auth.uid()) = true
        GROUP BY EXTRACT(DOW FROM a.created_at)
    ),
    all_days AS (
        SELECT 
            generate_series(0, 6) as day_of_week
    )
    SELECT 
        CASE ad.day_of_week
            WHEN 0 THEN 'Dom'
            WHEN 1 THEN 'Seg'
            WHEN 2 THEN 'Ter'
            WHEN 3 THEN 'Qua'
            WHEN 4 THEN 'Qui'
            WHEN 5 THEN 'Sex'
            WHEN 6 THEN 'Sáb'
        END as day,
        ad.day_of_week::integer,
        COALESCE(ws.atividade, 0) as atividade
    FROM all_days ad
    LEFT JOIN weekly_stats ws ON ad.day_of_week = ws.day_of_week
    ORDER BY ad.day_of_week;
$$;

-- Função para segmentação de usuários
CREATE OR REPLACE FUNCTION public.get_user_segmentation_analytics()
RETURNS TABLE (
    role_name text,
    user_count bigint,
    percentage numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH role_counts AS (
        SELECT 
            COALESCE(ur.name, 'sem_role') as role_name,
            COUNT(*) as user_count
        FROM profiles p
        LEFT JOIN user_roles ur ON p.role_id = ur.id
        WHERE public.is_user_admin_secure(auth.uid()) = true
        GROUP BY ur.name
    ),
    total_users AS (
        SELECT SUM(user_count) as total FROM role_counts
    )
    SELECT 
        rc.role_name,
        rc.user_count,
        ROUND((rc.user_count::numeric / tu.total::numeric) * 100, 2) as percentage
    FROM role_counts rc
    CROSS JOIN total_users tu
    ORDER BY rc.user_count DESC;
$$;