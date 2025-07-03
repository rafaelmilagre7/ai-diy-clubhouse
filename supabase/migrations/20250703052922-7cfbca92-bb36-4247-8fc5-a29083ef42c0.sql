-- Criar tabela admin_settings para configurações do sistema
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  category TEXT DEFAULT 'general',
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Política: Apenas administradores podem acessar configurações
CREATE POLICY "admin_settings_admin_access" ON public.admin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configuração padrão do WhatsApp se não existir
INSERT INTO public.admin_settings (key, value, description, category)
VALUES (
  'whatsapp_config',
  '{"phone_number_id": "", "access_token": "", "business_account_id": "", "webhook_verify_token": ""}',
  'Configurações da API do WhatsApp Business',
  'whatsapp'
) ON CONFLICT (key) DO NOTHING;