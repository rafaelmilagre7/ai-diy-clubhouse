-- Remover o template restante identificado nos logs
DELETE FROM unified_checklists 
WHERE id = '6baed7a2-950d-4da9-8dc7-6c3117c6d75a' 
AND is_template = true;

-- Remover qualquer outro template automático que possa ter passado despercebido
DELETE FROM unified_checklists 
WHERE is_template = true 
AND (
  checklist_data->'items'->0->>'title' ILIKE '%configuração inicial%'
  OR checklist_data->'items'->1->>'title' ILIKE '%integração com sistemas%'
  OR checklist_data->'items'->2->>'title' ILIKE '%teste da implementação%'
  OR checklist_data->'items'->3->>'title' ILIKE '%treinamento da equipe%'
  OR checklist_data->'items'->4->>'title' ILIKE '%monitoramento e ajustes%'
);