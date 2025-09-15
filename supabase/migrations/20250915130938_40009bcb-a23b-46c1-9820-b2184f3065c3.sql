-- ==========================================
-- SECURITY FIX: Restrict access to educational content
-- ==========================================
-- Issue: learning_lesson_videos and learning_lessons tables have public read access
-- allowing competitors to steal proprietary educational content
-- Solution: Remove public policies and enforce authentication + proper permissions

-- Drop insecure public policies that allow unrestricted access
DROP POLICY IF EXISTS "learning_lessons_select_optimized" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lesson_videos_select" ON public.learning_lesson_videos;

-- Ensure RLS is enabled on both tables
ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lesson_videos ENABLE ROW LEVEL SECURITY;

-- Create secure policy for learning_lessons - authenticated users with proper access only
CREATE POLICY "learning_lessons_secure_access" 
ON public.learning_lessons 
FOR SELECT 
USING (
  -- Admin users have full access
  is_user_admin_secure(auth.uid()) 
  OR 
  -- Authenticated users with learning permissions can access published content
  (
    auth.uid() IS NOT NULL 
    AND published = true 
    AND can_access_learning_content(auth.uid())
  )
  OR
  -- Course creators can access their own content
  (
    module_id IN (
      SELECT lm.id 
      FROM learning_modules lm
      JOIN learning_courses lc ON lm.course_id = lc.id
      WHERE lc.created_by = auth.uid()
    )
  )
  OR
  -- Users with specific course access
  (
    auth.uid() IS NOT NULL
    AND module_id IN (
      SELECT lm.id
      FROM learning_modules lm
      JOIN course_access_control cac ON lm.course_id = cac.course_id
      JOIN profiles p ON p.id = auth.uid()
      WHERE cac.role_id = p.role_id
    )
  )
);

-- Create secure policy for learning_lesson_videos - authenticated users only
CREATE POLICY "learning_lesson_videos_secure_access" 
ON public.learning_lesson_videos 
FOR SELECT 
USING (
  -- Admin users have full access
  is_user_admin_secure(auth.uid()) 
  OR 
  -- Authenticated users with learning permissions for published lessons
  (
    auth.uid() IS NOT NULL 
    AND can_access_learning_content(auth.uid())
    AND EXISTS (
      SELECT 1 FROM learning_lessons ll 
      WHERE ll.id = lesson_id 
      AND ll.published = true
    )
  )
  OR
  -- Lesson creators can access their own video content
  (
    lesson_id IN (
      SELECT ll.id 
      FROM learning_lessons ll
      JOIN learning_modules lm ON ll.module_id = lm.id
      JOIN learning_courses lc ON lm.course_id = lc.id
      WHERE lc.created_by = auth.uid()
    )
  )
  OR
  -- Users with specific course access to the lesson
  (
    auth.uid() IS NOT NULL
    AND lesson_id IN (
      SELECT ll.id
      FROM learning_lessons ll
      JOIN learning_modules lm ON ll.module_id = lm.id
      JOIN course_access_control cac ON lm.course_id = cac.course_id
      JOIN profiles p ON p.id = auth.uid()
      WHERE cac.role_id = p.role_id
    )
  )
);

-- Log this security fix in audit logs
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details,
  severity
) VALUES (
  auth.uid(),
  'security_fix',
  'educational_content_protection',
  jsonb_build_object(
    'issue', 'Educational content was publicly accessible',
    'fix', 'Implemented RLS policies requiring authentication and proper permissions',
    'affected_tables', ARRAY['learning_lessons', 'learning_lesson_videos'],
    'timestamp', now()
  ),
  'high'
);