-- Fix can_access_course: drop and recreate with correct params and role-based logic
DROP FUNCTION IF EXISTS public.can_access_course(uuid, uuid);

CREATE OR REPLACE FUNCTION public.can_access_course(p_course_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_role_id uuid;
  v_is_admin boolean := false;
BEGIN
  -- Get user role
  SELECT role_id INTO v_role_id
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_role_id IS NULL THEN
    RETURN false;
  END IF;

  -- Admin has full access
  SELECT (ur.name = 'admin') INTO v_is_admin
  FROM public.user_roles ur
  WHERE ur.id = v_role_id;

  IF v_is_admin THEN
    RETURN true;
  END IF;

  -- Check mapping table
  RETURN EXISTS (
    SELECT 1
    FROM public.course_access_control cac
    WHERE cac.course_id = p_course_id
      AND cac.role_id = v_role_id
  );
END;
$$;