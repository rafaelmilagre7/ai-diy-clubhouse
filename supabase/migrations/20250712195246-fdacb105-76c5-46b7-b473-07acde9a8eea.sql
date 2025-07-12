-- Criar tabela para agendamento de reuniões
CREATE TABLE public.networking_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL,
  participant_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  meeting_type TEXT NOT NULL DEFAULT 'video', -- 'video', 'phone', 'in_person'
  meeting_link TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'cancelled', 'completed'
  connection_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reminder_sent BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.networking_meetings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Usuários podem ver suas próprias reuniões" 
ON public.networking_meetings 
FOR SELECT 
USING (auth.uid() = organizer_id OR auth.uid() = participant_id);

CREATE POLICY "Usuários podem criar reuniões" 
ON public.networking_meetings 
FOR INSERT 
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Usuários podem atualizar suas reuniões" 
ON public.networking_meetings 
FOR UPDATE 
USING (auth.uid() = organizer_id OR auth.uid() = participant_id);

CREATE POLICY "Admins podem gerenciar todas as reuniões" 
ON public.networking_meetings 
FOR ALL 
USING (is_user_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_networking_meetings_organizer ON public.networking_meetings (organizer_id);
CREATE INDEX idx_networking_meetings_participant ON public.networking_meetings (participant_id);
CREATE INDEX idx_networking_meetings_scheduled_for ON public.networking_meetings (scheduled_for);
CREATE INDEX idx_networking_meetings_status ON public.networking_meetings (status);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_networking_meetings_updated_at
  BEFORE UPDATE ON public.networking_meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Foreign key constraint (opcional, se quiser vincular com conexões)
ALTER TABLE public.networking_meetings 
ADD CONSTRAINT fk_networking_meetings_connection 
FOREIGN KEY (connection_id) REFERENCES public.member_connections(id) ON DELETE SET NULL;