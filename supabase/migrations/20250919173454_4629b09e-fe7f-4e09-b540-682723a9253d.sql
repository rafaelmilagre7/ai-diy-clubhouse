-- Padronizar descrições de mentoria com formato uniforme

-- Atualizar eventos do Davi Lima
UPDATE events 
SET description = 'Acesse a mentoria de AI e resolva seus desafios e tire suas dúvidas sobre as implementações das soluções.

Mentor: Davi Lima

Especialidades: Lovable, Supabase, Make, Claude, N8n, GPT, Typebot, Manychat'
WHERE title ILIKE '%Mentoria de AI - Com Davi Lima%';

-- Atualizar eventos do Alexandre Silva
UPDATE events 
SET description = 'Acesse a mentoria de AI e resolva seus desafios e tire suas dúvidas sobre as implementações das soluções.

Mentor: Alexandre Silva

Especialidades: Automação, N8n, Make, Integração de Sistemas'
WHERE title ILIKE '%Mentoria de AI - Com Alexandre Silva%';

-- Atualizar eventos do Eduardo Ulysséa
UPDATE events 
SET description = 'Acesse a mentoria de AI e resolva seus desafios e tire suas dúvidas sobre as implementações das soluções.

Mentor: Eduardo Ulysséa

Especialidades: Estratégia de Negócios, Growth, Marketing Digital'
WHERE title ILIKE '%Mentoria de AI - Com Eduardo Ulysséa%';

-- Atualizar eventos do Yago Silveira
UPDATE events 
SET description = 'Acesse a mentoria de AI e resolva seus desafios e tire suas dúvidas sobre as implementações das soluções.

Mentor: Yago Silveira

Especialidades: Desenvolvimento, Programação, Soluções Técnicas'
WHERE title ILIKE '%Mentoria de AI - Com Yago Silveira%';