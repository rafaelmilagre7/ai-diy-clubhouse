-- Restaurar o evento Hotseat que foi excluído acidentalmente
INSERT INTO events (
  id,
  title, 
  description,
  start_time,
  end_time,
  location_link,
  cover_image_url,
  created_by,
  is_recurring,
  recurrence_pattern,
  recurrence_interval,
  recurrence_day,
  parent_event_id
) VALUES 
-- Evento pai
(
  '66c0bb33-461f-4fd2-887f-5be17e29cc38',
  'Hotseat | VIVER DE IA Club',
  'VIVER DE IA Club - Call Exclusiva para membros

Participe da nossa call exclusiva do VIVER DE IA Club, onde vamos explorar as mais recentes estratégias e práticas para aplicar Inteligência Artificial de forma prática e escalável nos seus negócios. 

Esse é o momento para interagir diretamente com especialistas e empresários, compartilhar experiências, e tirar dúvidas sobre as melhores soluções de IA para potencializar resultados!',
  '2025-07-31 22:30:00+00:00',
  '2025-08-01 00:00:00+00:00',
  'https://meet.google.com/kzo-dnvy-uqs',
  'https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/event_images/covers/807666e5-c68e-44a8-b36e-f2a2fc57f3a5_Banner_Formac_a_o__1_.png',
  'dc418224-acd7-4f5f-9a7e-e1c981b78fb6',
  true,
  'weekly',
  1,
  4,
  NULL
),
-- Eventos filhos (próximas semanas)
(
  '41913f31-3f07-47c3-a815-b71c09bea8a0',
  'Hotseat | VIVER DE IA Club',
  'VIVER DE IA Club - Call Exclusiva para membros

Participe da nossa call exclusiva do VIVER DE IA Club, onde vamos explorar as mais recentes estratégias e práticas para aplicar Inteligência Artificial de forma prática e escalável nos seus negócios. 

Esse é o momento para interagir diretamente com especialistas e empresários, compartilhar experiências, e tirar dúvidas sobre as melhores soluções de IA para potencializar resultados!',
  '2025-08-07 22:30:00+00:00',
  '2025-08-08 00:00:00+00:00',
  'https://meet.google.com/kzo-dnvy-uqs',
  'https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/event_images/covers/807666e5-c68e-44a8-b36e-f2a2fc57f3a5_Banner_Formac_a_o__1_.png',
  'dc418224-acd7-4f5f-9a7e-e1c981b78fb6',
  true,
  'weekly',
  1,
  4,
  '66c0bb33-461f-4fd2-887f-5be17e29cc38'
),
(
  '6727d70b-322b-4139-9550-38cb0c4c5d62',
  'Hotseat | VIVER DE IA Club',
  'VIVER DE IA Club - Call Exclusiva para membros

Participe da nossa call exclusiva do VIVER DE IA Club, onde vamos explorar as mais recentes estratégias e práticas para aplicar Inteligência Artificial de forma prática e escalável nos seus negócios. 

Esse é o momento para interagir diretamente com especialistas e empresários, compartilhar experiências, e tirar dúvidas sobre as melhores soluções de IA para potencializar resultados!',
  '2025-08-14 22:30:00+00:00',
  '2025-08-15 00:00:00+00:00',
  'https://meet.google.com/kzo-dnvy-uqs',
  'https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/event_images/covers/807666e5-c68e-44a8-b36e-f2a2fc57f3a5_Banner_Formac_a_o__1_.png',
  'dc418224-acd7-4f5f-9a7e-e1c981b78fb6',
  true,
  'weekly',
  1,
  4,
  '66c0bb33-461f-4fd2-887f-5be17e29cc38'
),
(
  '4e653e44-efb6-470d-a293-abf50d9b6903',
  'Hotseat | VIVER DE IA Club',
  'VIVER DE IA Club - Call Exclusiva para membros

Participe da nossa call exclusiva do VIVER DE IA Club, onde vamos explorar as mais recentes estratégias e práticas para aplicar Inteligência Artificial de forma prática e escalável nos seus negócios. 

Esse é o momento para interagir diretamente com especialistas e empresários, compartilhar experiências, e tirar dúvidas sobre as melhores soluções de IA para potencializar resultados!',
  '2025-08-21 22:30:00+00:00',
  '2025-08-22 00:00:00+00:00',
  'https://meet.google.com/kzo-dnvy-uqs',
  'https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/event_images/covers/807666e5-c68e-44a8-b36e-f2a2fc57f3a5_Banner_Formac_a_o__1_.png',
  'dc418224-acd7-4f5f-9a7e-e1c981b78fb6',
  true,
  'weekly',
  1,
  4,
  '66c0bb33-461f-4fd2-887f-5be17e29cc38'
),
(
  '0e9376e0-7f6a-49d8-a631-691a37dfa73b',
  'Hotseat | VIVER DE IA Club',
  'VIVER DE IA Club - Call Exclusiva para membros

Participe da nossa call exclusiva do VIVER DE IA Club, onde vamos explorar as mais recentes estratégias e práticas para aplicar Inteligência Artificial de forma prática e escalável nos seus negócios. 

Esse é o momento para interagir diretamente com especialistas e empresários, compartilhar experiências, e tirar dúvidas sobre as melhores soluções de IA para potencializar resultados!',
  '2025-08-28 22:30:00+00:00',
  '2025-08-29 00:00:00+00:00',
  'https://meet.google.com/kzo-dnvy-uqs',
  'https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public/event_images/covers/807666e5-c68e-44a8-b36e-f2a2fc57f3a5_Banner_Formac_a_o__1_.png',
  'dc418224-acd7-4f5f-9a7e-e1c981b78fb6',
  true,
  'weekly',
  1,
  4,
  '66c0bb33-461f-4fd2-887f-5be17e29cc38'
);