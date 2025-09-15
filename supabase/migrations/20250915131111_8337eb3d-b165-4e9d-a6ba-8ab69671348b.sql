-- ==========================================
-- SECURITY FIX: Restrict access to educational content (Safe Version)
-- ==========================================

-- Step 1: Drop all existing insecure policies
DROP POLICY IF EXISTS "learning_lessons_select_optimized" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lesson_videos_select" ON public.learning_lesson_videos;
DROP POLICY IF EXISTS "learning_lessons_secure_access" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lesson_videos_secure_access" ON public.learning_lesson_videos;

-- Step 2: Ensure RLS is enabled
ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lesson_videos ENABLE ROW LEVEL SECURITY;

-- Step 3: Create new secure policies

-- Secure policy for learning_lessons
CREATE POLICY "learning_lessons_authenticated_access" 
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
);

-- Secure policy for learning_lesson_videos  
CREATE POLICY "learning_lesson_videos_authenticated_access" 
ON public.learning_lesson_videos 
FOR SELECT 
USING (
  -- Admin users have full access
  is_user_admin_secure(auth.uid()) 
  OR 
  -- Authenticated users with learning permissions for published lessons only
  (
    auth.uid() IS NOT NULL 
    AND can_access_learning_content(auth.uid())
    AND EXISTS (
      SELECT 1 FROM learning_lessons ll 
      WHERE ll.id = lesson_id 
      AND ll.published = true
    )
  )
);