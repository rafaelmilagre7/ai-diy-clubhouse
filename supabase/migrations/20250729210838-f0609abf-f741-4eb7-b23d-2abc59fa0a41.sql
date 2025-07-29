-- Criar templates básicos de implementação para todas as soluções que não têm
INSERT INTO unified_checklists (
  user_id,
  solution_id,
  checklist_type,
  checklist_data,
  completed_items,
  total_items,
  progress_percentage,
  is_completed,
  is_template,
  created_at,
  updated_at
)
SELECT 
  'b837c23e-e064-4eb8-8648-f1298d4cbe75'::uuid as user_id, -- Admin user ID
  s.id as solution_id,
  'implementation' as checklist_type,
  jsonb_build_object(
    'items', jsonb_build_array(
      jsonb_build_object(
        'id', gen_random_uuid(),
        'title', 'Configuração inicial da ferramenta',
        'description', 'Realizar a configuração básica da ferramenta seguindo o passo a passo',
        'completed', false,
        'order', 1
      ),
      jsonb_build_object(
        'id', gen_random_uuid(),
        'title', 'Integração com sistemas existentes',
        'description', 'Conectar a solução com os sistemas já utilizados na empresa',
        'completed', false,
        'order', 2
      ),
      jsonb_build_object(
        'id', gen_random_uuid(),
        'title', 'Teste da implementação',
        'description', 'Realizar testes para garantir que tudo está funcionando corretamente',
        'completed', false,
        'order', 3
      ),
      jsonb_build_object(
        'id', gen_random_uuid(),
        'title', 'Treinamento da equipe',
        'description', 'Treinar a equipe para utilizar a nova solução implementada',
        'completed', false,
        'order', 4
      ),
      jsonb_build_object(
        'id', gen_random_uuid(),
        'title', 'Monitoramento e ajustes',
        'description', 'Acompanhar os resultados e fazer ajustes necessários',
        'completed', false,
        'order', 5
      )
    )
  ) as checklist_data,
  0 as completed_items,
  5 as total_items,
  0 as progress_percentage,
  false as is_completed,
  true as is_template,
  now() as created_at,
  now() as updated_at
FROM solutions s
WHERE NOT EXISTS (
  SELECT 1 FROM unified_checklists uc 
  WHERE uc.solution_id = s.id 
  AND uc.is_template = true 
  AND uc.checklist_type = 'implementation'
);