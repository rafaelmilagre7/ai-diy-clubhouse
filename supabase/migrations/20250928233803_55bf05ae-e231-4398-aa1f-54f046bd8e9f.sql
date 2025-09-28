-- Migração para implementar sistema de usuários master e adicionais

-- 1. Atualizar tabela profiles para suportar melhor a hierarquia
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS team_size integer DEFAULT 1;

-- 2. Atualizar tabela organizations para melhor controle
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS billing_email text,
ADD COLUMN IF NOT EXISTS team_limit integer DEFAULT 5;

-- 3. Criar tabela para gerenciar convites de equipe
CREATE TABLE IF NOT EXISTS public.team_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS para team_invites
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- Políticas para team_invites
CREATE POLICY "team_invites_master_access"
ON public.team_invites
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = team_invites.organization_id 
    AND o.master_user_id = auth.uid()
  )
);

CREATE POLICY "team_invites_admin_access"
ON public.team_invites
FOR ALL
USING (public.is_user_admin_secure(auth.uid()));

-- 4. Função para processar dados do Excel e criar organizações
CREATE OR REPLACE FUNCTION public.process_excel_data_and_create_masters()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  created_orgs integer := 0;
  updated_users integer := 0;
  master_emails text[] := ARRAY[
    'mikael.fontes@hotmail.com',
    'patrickcamposadm@gmail.com', 
    'valtercaetanoempresario@gmail.com',
    'marcos@digitalyourbusiness.com.br',
    'camilafagundesk@gmail.com',
    'danillo0511@gmail.com',
    'maxwell.zumba@gmail.com',
    'lukaspinheirou@gmail.com',
    'mateuszem@icloud.com',
    'goncalo@workando.pt',
    'gestao@birinnova.com',
    'rh@mosaicodaconstrucao.com.br',
    'eduardo@qsinformatica.com.br',
    'contato@ebsistemas.dev.br',
    'brenno@livetech.com.br',
    'diego@sysmapsolucoes.com.br',
    'contato@grupojcr.com.br',
    'alexandre.annes@gmail.com',
    'atendimento@consultoriaferreira.com.br',
    'guilhermereisfreitas81@gmail.com',
    'livianestefan@icloud.com',
    'julia@portalcerrado.com.br',
    'flavio.spanhol@gmail.com',
    'diogo@herois.digital',
    'juliana@wsptreinamento.com.br',
    'comercial@wsconsultoriaetreinamento.com.br',
    'vendasdt@doutormarceneiro.com.br',
    'dayana@educacao360.com.br',
    'contato@ai360pro.com.br',
    'edmilsonfigueiredo@phytotecdistribuidora.com.br'
  ];
  master_email text;
  master_profile record;
  org_record record;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;

  -- Processar cada master email
  FOREACH master_email IN ARRAY master_emails LOOP
    -- Buscar perfil do master
    SELECT * INTO master_profile FROM public.profiles WHERE email = master_email;
    
    IF master_profile.id IS NOT NULL THEN
      -- Marcar como master user
      UPDATE public.profiles 
      SET 
        is_master_user = true,
        plan_type = 'team',
        team_size = CASE 
          WHEN email = 'mikael.fontes@hotmail.com' THEN 2
          ELSE 5
        END,
        updated_at = now()
      WHERE id = master_profile.id;
      
      updated_users := updated_users + 1;
      
      -- Criar ou atualizar organização
      INSERT INTO public.organizations (
        id,
        name,
        master_user_id,
        plan_type,
        max_users,
        team_limit,
        subscription_status,
        billing_email,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        COALESCE(master_profile.company_name, master_profile.name || ' - Organização'),
        master_profile.id,
        'team',
        CASE 
          WHEN master_email = 'mikael.fontes@hotmail.com' THEN 2
          ELSE 5
        END,
        CASE 
          WHEN master_email = 'mikael.fontes@hotmail.com' THEN 2
          ELSE 5
        END,
        'active',
        master_email,
        now(),
        now()
      ) ON CONFLICT (master_user_id) DO UPDATE SET
        plan_type = EXCLUDED.plan_type,
        max_users = EXCLUDED.max_users,
        team_limit = EXCLUDED.team_limit,
        updated_at = now();
      
      -- Buscar a organização criada/atualizada
      SELECT * INTO org_record FROM public.organizations WHERE master_user_id = master_profile.id;
      
      -- Atualizar o profile com organization_id
      UPDATE public.profiles 
      SET organization_id = org_record.id, updated_at = now()
      WHERE id = master_profile.id;
      
      created_orgs := created_orgs + 1;
    END IF;
  END LOOP;
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Processamento concluído',
    'masters_processed', updated_users,
    'organizations_created', created_orgs
  );
  
  RETURN result;
END;
$$;

-- 5. Trigger para atualizar updated_at em team_invites
CREATE OR REPLACE FUNCTION public.update_team_invites_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_team_invites_updated_at
  BEFORE UPDATE ON public.team_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_invites_updated_at();