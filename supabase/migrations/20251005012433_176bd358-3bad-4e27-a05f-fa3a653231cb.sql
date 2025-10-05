
-- Fix SECURITY DEFINER view issue
-- Drop and recreate profiles_safe view with proper SECURITY INVOKER setting

DROP VIEW IF EXISTS profiles_safe CASCADE;

-- Recreate the view with explicit SECURITY INVOKER
CREATE VIEW profiles_safe WITH (security_invoker = on) AS
SELECT 
  p.id,
  CASE 
    WHEN can_view_full_profile(p.id) THEN p.name
    ELSE mask_personal_name(p.name)
  END as name,
  CASE 
    WHEN can_view_full_profile(p.id) THEN p.email
    ELSE mask_email(p.email)
  END as email,
  p.avatar_url,
  p.company_name,
  p.industry,
  p.current_position,
  p.professional_bio,
  p.skills,
  p.role_id,
  p.is_master_user,
  p.onboarding_completed,
  p.created_at,
  p.updated_at,
  p.organization_id,
  p.available_for_networking,
  CASE 
    WHEN can_view_full_profile(p.id) THEN p.whatsapp_number
    ELSE NULL
  END as whatsapp_number,
  CASE 
    WHEN can_view_full_profile(p.id) THEN p.linkedin_url
    ELSE NULL
  END as linkedin_url,
  CASE 
    WHEN can_view_full_profile(p.id) THEN p.master_email
    ELSE mask_email(p.master_email)
  END as master_email
FROM profiles p;

-- Grant appropriate permissions
GRANT SELECT ON profiles_safe TO authenticated;
GRANT SELECT ON profiles_safe TO anon;

COMMENT ON VIEW profiles_safe IS 'Secure view of profiles with automatic data masking for unauthorized access. Uses SECURITY INVOKER to enforce RLS policies of the querying user.';
