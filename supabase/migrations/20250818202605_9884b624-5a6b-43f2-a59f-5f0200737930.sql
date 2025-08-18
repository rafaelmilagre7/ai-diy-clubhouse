-- Criar tabela de definições de permissões se não existir
CREATE TABLE IF NOT EXISTS public.permission_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'feature',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela de relacionamento role-permission se não existir  
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.user_roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permission_definitions(id) ON DELETE CASCADE,
  granted_at timestamp with time zone DEFAULT now(),
  granted_by uuid,
  UNIQUE(role_id, permission_id)
);

-- Habilitar RLS
ALTER TABLE public.permission_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para permission_definitions
CREATE POLICY "Authenticated users can view permissions" ON public.permission_definitions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage permissions" ON public.permission_definitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Políticas RLS para role_permissions
CREATE POLICY "Authenticated users can view role permissions" ON public.role_permissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Inserir permissões básicas se não existirem
INSERT INTO public.permission_definitions (code, name, description, category) 
VALUES 
  ('networking.access', 'Acesso ao Networking', 'Permite acessar funcionalidades de networking', 'feature'),
  ('solutions.access', 'Acesso às Soluções', 'Permite acessar catálogo de soluções', 'feature'),
  ('learning.access', 'Acesso ao Learning', 'Permite acessar cursos e formações', 'feature'),
  ('tools.access', 'Acesso às Ferramentas', 'Permite acessar ferramentas premium', 'feature'),
  ('benefits.access', 'Acesso aos Benefícios', 'Permite acessar benefícios exclusivos', 'feature'),
  ('events.access', 'Acesso aos Eventos', 'Permite acessar eventos e webinars', 'feature'),
  ('community.access', 'Acesso à Comunidade', 'Permite participar de fóruns', 'feature'),
  ('certificates.access', 'Acesso aos Certificados', 'Permite gerar certificados', 'feature'),
  ('ai_trail.access', 'Acesso à Trilha IA', 'Permite acessar trilhas personalizadas', 'feature'),
  ('suggestions.access', 'Sugestões', 'Permite enviar sugestões', 'feature')
ON CONFLICT (code) DO NOTHING;

-- Criar função RPC para buscar permissões do usuário
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_permissions text[];
BEGIN
  -- Buscar permissões através do role do usuário
  SELECT ARRAY_AGG(pd.code)
  INTO user_permissions
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  JOIN public.role_permissions rp ON ur.id = rp.role_id
  JOIN public.permission_definitions pd ON rp.permission_id = pd.id
  WHERE p.id = p_user_id;
  
  RETURN COALESCE(user_permissions, ARRAY[]::text[]);
END;
$$;

-- Criar função RPC para verificar permissão específica
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    JOIN public.role_permissions rp ON ur.id = rp.role_id
    JOIN public.permission_definitions pd ON rp.permission_id = pd.id
    WHERE p.id = user_has_permission.user_id 
    AND pd.code = permission_code
  );
END;
$$;