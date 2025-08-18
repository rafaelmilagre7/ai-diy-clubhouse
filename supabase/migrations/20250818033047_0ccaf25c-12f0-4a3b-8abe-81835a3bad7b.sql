-- Create function to check tool/benefit access
CREATE OR REPLACE FUNCTION public.can_access_tool(p_tool_id uuid, p_user_id uuid)
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

  -- Check benefit access control table
  RETURN EXISTS (
    SELECT 1
    FROM public.benefit_access_control bac
    WHERE bac.tool_id = p_tool_id
      AND bac.role_id = v_role_id
  );
END;
$$;