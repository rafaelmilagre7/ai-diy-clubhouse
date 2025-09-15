-- ==========================================
-- SECURITY FIX: Force cleanup of ALL educational content policies
-- ==========================================
-- Issue: Conflicting policies exist, need complete cleanup
-- Solution: Drop all policies systematically and recreate secure ones

-- Get all existing policy names and drop them systematically
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies on learning_lessons
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'learning_lessons' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.learning_lessons';
    END LOOP;
    
    -- Drop all policies on learning_lesson_videos
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'learning_lesson_videos' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.learning_lesson_videos';
    END LOOP;
END
$$;

-- Ensure RLS is enabled
ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lesson_videos ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- SECURE POLICIES - STRICT AUTHENTICATION ONLY
-- ==========================================

-- Learning Lessons - Only authenticated users with proper authorization
CREATE POLICY "secure_learning_lessons_access"
ON public.learning_lessons
FOR SELECT
USING (
  -- MANDATORY: Must be authenticated
  auth.uid() IS NOT NULL
  AND (
    -- Admin users have full access
    is_user_admin_secure(auth.uid())
    OR
    -- Content creators can access their own lessons
    module_id IN (
      SELECT lm.id 
      FROM learning_modules lm
      JOIN learning_courses lc ON lm.course_id = lc.id
      WHERE lc.created_by = auth.uid()
    )
    OR
    -- Users with proper course access (published lessons only)
    (
      published = true
      AND (
        -- Role-based course access
        module_id IN (
          SELECT lm.id
          FROM learning_modules lm
          JOIN course_access_control cac ON lm.course_id = cac.course_id
          JOIN profiles p ON p.id = auth.uid()
          WHERE cac.role_id = p.role_id
        )
        OR
        -- General learning access for authenticated users
        can_access_learning_content(auth.uid())
      )
    )
  )
);

-- Learning Lesson Videos - Only authenticated users with proper authorization
CREATE POLICY "secure_learning_videos_access"
ON public.learning_lesson_videos
FOR SELECT
USING (
  -- MANDATORY: Must be authenticated
  auth.uid() IS NOT NULL
  AND (
    -- Admin users have full access
    is_user_admin_secure(auth.uid())
    OR
    -- Content creators can access videos for their own lessons
    lesson_id IN (
      SELECT ll.id 
      FROM learning_lessons ll
      JOIN learning_modules lm ON ll.module_id = lm.id
      JOIN learning_courses lc ON lm.course_id = lc.id
      WHERE lc.created_by = auth.uid()
    )
    OR
    -- Users with proper lesson access (published lessons only)
    (
      EXISTS (
        SELECT 1 FROM learning_lessons ll 
        WHERE ll.id = lesson_id 
        AND ll.published = true
      )
      AND (
        -- Role-based access through course access control
        lesson_id IN (
          SELECT ll.id
          FROM learning_lessons ll
          JOIN learning_modules lm ON ll.module_id = lm.id
          JOIN course_access_control cac ON lm.course_id = cac.course_id
          JOIN profiles p ON p.id = auth.uid()
          WHERE cac.role_id = p.role_id
        )
        OR
        -- General learning access for authenticated users
        can_access_learning_content(auth.uid())
      )
    )
  )
);

-- Admin modification policies
CREATE POLICY "secure_learning_lessons_admin"
ON public.learning_lessons
FOR ALL
USING (is_user_admin_secure(auth.uid()))
WITH CHECK (is_user_admin_secure(auth.uid()));

CREATE POLICY "secure_learning_videos_admin"
ON public.learning_lesson_videos
FOR ALL
USING (is_user_admin_secure(auth.uid()))
WITH CHECK (is_user_admin_secure(auth.uid()));

-- Log the complete security fix
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  'security_fix',
  'educational_content_security_lockdown_complete',
  jsonb_build_object(
    'issue', 'Educational content was accessible without proper authentication',
    'fix', 'Implemented complete authentication-only access with proper authorization checks',
    'affected_tables', ARRAY['learning_lessons', 'learning_lesson_videos'],
    'security_measures', ARRAY[
      'Mandatory authentication (auth.uid() IS NOT NULL)',
      'Role-based access control via course_access_control table',
      'Content creator access to own materials',
      'Admin-only modification rights',
      'Published content restriction for regular users'
    ],
    'access_requirement', 'STRICT_AUTHENTICATION_AND_AUTHORIZATION',
    'timestamp', now()
  ),
  'critical'
);