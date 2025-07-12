-- Add RLS policies for security_anomalies table
ALTER TABLE public.security_anomalies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage security anomalies"
ON public.security_anomalies
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Add RLS policies for security_incidents table  
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage security incidents"
ON public.security_incidents
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);

-- Add RLS policies for notifications table (security enhancement)
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  )
);