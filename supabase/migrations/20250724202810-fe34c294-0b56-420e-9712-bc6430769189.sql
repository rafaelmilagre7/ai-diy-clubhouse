-- Corrigir políticas RLS faltantes para tabelas críticas

-- 1. BADGES - Faltando INSERT
CREATE POLICY "Admins can insert badges" 
ON public.badges 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
);

-- 2. EVENTS - Faltando INSERT
CREATE POLICY "Admins can insert events" 
ON public.events 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
);

-- 3. COMMUNITY_TOPICS - Faltando UPDATE e DELETE
CREATE POLICY "Users can update their own topics" 
ON public.community_topics 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Admins can update any topic" 
ON public.community_topics 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
);

CREATE POLICY "Users can delete their own topics" 
ON public.community_topics 
FOR DELETE 
USING (user_id = auth.uid());

CREATE POLICY "Admins can delete any topic" 
ON public.community_topics 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
);

-- 4. NOTIFICATIONS - Faltando INSERT
CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  -- Permitir para service role ou admins
  auth.role() = 'service_role' OR 
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
);

-- 5. PROFILES - Faltando DELETE  
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = 'admin'
  )
);