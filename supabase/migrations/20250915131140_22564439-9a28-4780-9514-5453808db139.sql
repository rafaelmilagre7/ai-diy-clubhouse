-- ==========================================
-- SECURITY FIX: Complete cleanup of educational content access policies
-- ==========================================
-- Issue: Multiple conflicting policies still allow public access to educational content
-- Solution: Complete cleanup and implementation of strict authentication-only access

-- Drop ALL existing policies on these tables to start clean
DROP POLICY IF EXISTS "learning_lessons_unified_select" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_unified_access" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_secure_access" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_admin_modify" ON public.learning_lessons;

DROP POLICY IF EXISTS "learning_lesson_videos_unified_select" ON public.learning_lesson_videos;
DROP POLICY IF EXISTS "learning_lesson_videos_user_read" ON public.learning_lesson_videos;
DROP POLICY IF EXISTS "learning_lesson_videos_secure_access" ON public.learning_lesson_videos;
DROP POLICY IF EXISTS "learning_lesson_videos_admin_modify" ON public.learning_lesson_videos;
DROP POLICY IF EXISTS "learning_lesson_videos_admin_insert" ON public.learning_lesson_videos;
DROP POLICY IF EXISTS "learning_lesson_videos_admin_update" ON public.learning_lesson_videos;
DROP POLICY IF EXISTS "learning_lesson_videos_admin_delete" ON public.learning_lesson_videos;

-- Ensure RLS is enabled
ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lesson_videos ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- SECURE POLICIES - AUTHENTICATION REQUIRED
-- ==========================================

-- Learning Lessons - Strict authentication and authorization required
CREATE POLICY "learning_lessons_authenticated_access"
ON public.learning_lessons
FOR SELECT
USING (
  -- Must be authenticated
  auth.uid() IS NOT NULL
  AND (
    -- Admin access
    is_user_admin_secure(auth.uid())
    OR
    -- Content creators can see their own lessons
    module_id IN (
      SELECT lm.id 
      FROM learning_modules lm
      JOIN learning_courses lc ON lm.course_id = lc.id
      WHERE lc.created_by = auth.uid()
    )
    OR
    -- Users with course access (only for published lessons)
    (
      published = true
      AND (
        -- Role-based access via course_access_control
        module_id IN (
          SELECT lm.id
          FROM learning_modules lm
          JOIN course_access_control cac ON lm.course_id = cac.course_id
          JOIN profiles p ON p.id = auth.uid()
          WHERE cac.role_id = p.role_id
        )
        OR
        -- Individual course access via user_course_access (if table exists)
        module_id IN (
          SELECT lm.id
          FROM learning_modules lm
          WHERE EXISTS (
            SELECT 1 FROM user_course_access uca 
            WHERE uca.course_id = lm.course_id 
            AND uca.user_id = auth.uid()
          )
        )
        OR
        -- General learning content access for authenticated users
        can_access_learning_content(auth.uid())
      )
    )
  )
);

-- Learning Lesson Videos - Strict authentication and authorization required
CREATE POLICY "learning_lesson_videos_authenticated_access"
ON public.learning_lesson_videos
FOR SELECT
USING (
  -- Must be authenticated
  auth.uid() IS NOT NULL
  AND (
    -- Admin access
    is_user_admin_secure(auth.uid())
    OR
    -- Content creators can see videos for their own lessons
    lesson_id IN (
      SELECT ll.id 
      FROM learning_lessons ll
      JOIN learning_modules lm ON ll.module_id = lm.id
      JOIN learning_courses lc ON lm.course_id = lc.id
      WHERE lc.created_by = auth.uid()
    )
    OR
    -- Users with lesson access (only for published lessons)
    (
      EXISTS (
        SELECT 1 FROM learning_lessons ll 
        WHERE ll.id = lesson_id 
        AND ll.published = true
      )
      AND (
        -- Role-based access
        lesson_id IN (
          SELECT ll.id
          FROM learning_lessons ll
          JOIN learning_modules lm ON ll.module_id = lm.id
          JOIN course_access_control cac ON lm.course_id = cac.course_id
          JOIN profiles p ON p.id = auth.uid()
          WHERE cac.role_id = p.role_id
        )
        OR
        -- Individual course access
        lesson_id IN (
          SELECT ll.id
          FROM learning_lessons ll
          JOIN learning_modules lm ON ll.module_id = lm.id
          WHERE EXISTS (
            SELECT 1 FROM user_course_access uca 
            WHERE uca.course_id = lm.course_id 
            AND uca.user_id = auth.uid()
          )
        )
        OR
        -- General learning content access for authenticated users
        can_access_learning_content(auth.uid())
      )
    )
  )
);

-- Admin policies for modifications
CREATE POLICY "learning_lessons_admin_all"
ON public.learning_lessons
FOR ALL
USING (is_user_admin_secure(auth.uid()))
WITH CHECK (is_user_admin_secure(auth.uid()));

CREATE POLICY "learning_lesson_videos_admin_all"
ON public.learning_lesson_videos
FOR ALL
USING (is_user_admin_secure(auth.uid()))
WITH CHECK (is_user_admin_secure(auth.uid()));

-- Log the security fix
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  'security_fix',
  'educational_content_complete_lockdown',
  jsonb_build_object(
    'issue', 'Multiple conflicting RLS policies allowed public access to educational content',
    'fix', 'Removed ALL public access policies, implemented strict authentication-only access',
    'affected_tables', ARRAY['learning_lessons', 'learning_lesson_videos'],
    'security_level', 'MAXIMUM',
    'access_requirement', 'AUTHENTICATION_MANDATORY',
    'timestamp', now()
  ),
  'critical'
);