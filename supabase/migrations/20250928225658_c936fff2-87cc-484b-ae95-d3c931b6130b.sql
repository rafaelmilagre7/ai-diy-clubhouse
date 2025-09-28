-- Criar tabela de organizações
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  master_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'basic',
  max_users integer NOT NULL DEFAULT 5,
  settings jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Adicionar campos na tabela profiles para hierarquia
ALTER TABLE public.profiles 
ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN is_master_user boolean DEFAULT false;

-- Criar role master_user se não existir
INSERT INTO public.user_roles (name, description, permissions) 
VALUES (
  'master_user', 
  'Usuário Master - Gerencia sua organização/equipe',
  '{"team_management": true, "invite_members": true, "view_team_analytics": true, "organization_settings": true}'
) ON CONFLICT (name) DO NOTHING;

-- Habilitar RLS na tabela organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para organizations
CREATE POLICY "Masters can view their own organization" 
ON public.organizations FOR SELECT 
USING (master_user_id = auth.uid());

CREATE POLICY "Masters can update their own organization" 
ON public.organizations FOR UPDATE 
USING (master_user_id = auth.uid());

CREATE POLICY "Admins can view all organizations" 
ON public.organizations FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles p
  JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid() AND ur.name = 'admin'
));

-- Políticas RLS modificadas para profiles considerando hierarquia
CREATE POLICY "Masters can view team members" 
ON public.profiles FOR SELECT 
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE master_user_id = auth.uid()
  ) OR id = auth.uid()
);

CREATE POLICY "Sub-users can view organization members" 
ON public.profiles FOR SELECT 
USING (
  organization_id = (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ) OR id = auth.uid()
);

-- Trigger para atualizar updated_at na tabela organizations
CREATE OR REPLACE FUNCTION update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_organizations_updated_at();

-- Função para verificar se usuário é master de uma organização
CREATE OR REPLACE FUNCTION is_organization_master(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organizations 
    WHERE id = org_id AND master_user_id = auth.uid()
  );
$$;

-- Função para obter organização do usuário atual
CREATE OR REPLACE FUNCTION get_user_organization()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$;