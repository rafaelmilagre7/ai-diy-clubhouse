-- Configurar acessos para a role "convidado" baseado no padrão do "membro_club"

-- Copiar acessos de benefícios do membro_club para convidado
INSERT INTO benefit_access_control (role_id, tool_id)
SELECT 
  (SELECT id FROM user_roles WHERE name = 'convidado'),
  bac.tool_id
FROM benefit_access_control bac
JOIN user_roles ur ON bac.role_id = ur.id
WHERE ur.name = 'membro_club';

-- Copiar acessos de cursos do membro_club para convidado
INSERT INTO course_access_control (role_id, course_id)
SELECT 
  (SELECT id FROM user_roles WHERE name = 'convidado'),
  cac.course_id
FROM course_access_control cac
JOIN user_roles ur ON cac.role_id = ur.id
WHERE ur.name = 'membro_club';