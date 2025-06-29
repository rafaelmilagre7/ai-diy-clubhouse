
-- MIGRAÇÃO: Correção completa do esquema para resolver erros de build (VERSÃO CORRIGIDA)
-- Adiciona todas as tabelas essenciais faltantes e tipos necessários

-- =============================================================================
-- FASE 1: CRIAR ENUM PARA CATEGORIAS DE SOLUÇÕES
-- =============================================================================

-- Criar enum para categorias de soluções (compatibilidade com frontend)
DO $$ BEGIN
    CREATE TYPE solution_category AS ENUM ('Receita', 'Operacional', 'Estratégia');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- FASE 2: TABELAS ADMINISTRATIVAS ESSENCIAIS
-- =============================================================================

-- Tabela de papéis do sistema
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de perfis de usuário (essencial para o sistema)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    company_name TEXT,
    industry TEXT,
    role_id UUID REFERENCES user_roles(id),
    role TEXT, -- Campo legado para compatibilidade
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de convites
CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    role_id UUID NOT NULL REFERENCES user_roles(id),
    created_by UUID NOT NULL REFERENCES profiles(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    preferred_channel VARCHAR DEFAULT 'email',
    whatsapp_number TEXT,
    send_attempts INTEGER DEFAULT 0,
    last_sent_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- FASE 3: SISTEMA DE MEMBROS (TOOLS, EVENTS, BENEFITS)
-- =============================================================================

-- Tabela de ferramentas/benefícios
CREATE TABLE IF NOT EXISTS tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    link TEXT NOT NULL,
    image_url TEXT,
    category TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location_link TEXT,
    physical_location TEXT,
    cover_image_url TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern TEXT,
    recurrence_interval INTEGER DEFAULT 1,
    recurrence_day INTEGER,
    recurrence_count INTEGER,
    recurrence_end_date TIMESTAMP WITH TIME ZONE,
    parent_event_id UUID REFERENCES events(id),
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Alias para benefits (mesmo que tools)
CREATE OR REPLACE VIEW benefits AS SELECT * FROM tools;

-- =============================================================================
-- FASE 4: SISTEMA LEARNING - CERTIFICADOS
-- =============================================================================

-- Certificados (já existe mas garantir estrutura)
CREATE TABLE IF NOT EXISTS learning_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    course_id UUID NOT NULL REFERENCES learning_courses(id),
    certificate_url TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================================================
-- FASE 5: INSERIR DADOS ESSENCIAIS
-- =============================================================================

-- Inserir papéis padrão do sistema
INSERT INTO user_roles (name, description, is_system, permissions) VALUES
    ('admin', 'Administrador do sistema', true, '{"all": true}'::jsonb),
    ('formacao', 'Acesso ao sistema de formação', true, '{"learning": true, "content_management": true}'::jsonb),
    ('membro_club', 'Membro do clube', true, '{"tools": true, "events": true, "networking": true}'::jsonb),
    ('member', 'Membro padrão', true, '{"basic": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- FASE 6: CONFIGURAR RLS (Row Level Security)
-- =============================================================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_certificates ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de RLS (com verificação de existência)
DO $$ BEGIN
    -- Perfis: usuários podem ver e editar apenas seu próprio perfil
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can view own profile" ON profiles
            FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can update own profile" ON profiles
            FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- Admins podem ver todos os perfis
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all profiles' AND tablename = 'profiles') THEN
        CREATE POLICY "Admins can view all profiles" ON profiles
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM profiles p
                    JOIN user_roles ur ON p.role_id = ur.id
                    WHERE p.id = auth.uid() AND ur.name = 'admin'
                )
            );
    END IF;

    -- Tools/Benefits: todos podem visualizar
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'All can view tools' AND tablename = 'tools') THEN
        CREATE POLICY "All can view tools" ON tools FOR SELECT TO authenticated USING (true);
    END IF;

    -- Events: todos podem visualizar
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'All can view events' AND tablename = 'events') THEN
        CREATE POLICY "All can view events" ON events FOR SELECT TO authenticated USING (true);
    END IF;

    -- Certificados: usuários podem ver apenas seus próprios certificados
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own certificates' AND tablename = 'learning_certificates') THEN
        CREATE POLICY "Users can view own certificates" ON learning_certificates
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- =============================================================================
-- FASE 7: ÍNDICES PARA PERFORMANCE
-- =============================================================================

-- Índices essenciais
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_learning_certificates_user_course ON learning_certificates(user_id, course_id);

-- =============================================================================
-- FASE 8: TRIGGERS PARA UPDATED_AT
-- =============================================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas necessárias
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tools_updated_at ON tools;
CREATE TRIGGER update_tools_updated_at
    BEFORE UPDATE ON tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FASE 9: VERIFICAÇÃO FINAL
-- =============================================================================

-- Listar todas as tabelas criadas para verificação
SELECT 
    schemaname, 
    tablename,
    CASE 
        WHEN tablename LIKE 'learning_%' THEN '📚 LEARNING SYSTEM'
        WHEN tablename IN ('profiles', 'user_roles', 'invites') THEN '👤 USER SYSTEM'
        WHEN tablename IN ('tools', 'events', 'benefits') THEN '🔧 MEMBER SYSTEM'
        WHEN tablename = 'analytics' THEN '📊 ANALYTICS'
        ELSE '📋 OTHER'
    END as system_category
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename NOT LIKE '%backup%'
ORDER BY system_category, tablename;
