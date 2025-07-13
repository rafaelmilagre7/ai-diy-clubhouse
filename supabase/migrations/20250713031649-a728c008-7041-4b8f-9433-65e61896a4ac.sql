-- Limpar dados existentes e adicionar termos práticos de IA
DELETE FROM public.glossary_terms;
DELETE FROM public.glossary_categories;

-- Inserir categorias práticas
INSERT INTO public.glossary_categories (id, name, slug, description, color, icon, order_index) VALUES
(gen_random_uuid(), 'Conceitos de Prompt', 'prompt-concepts', 'Tudo sobre como criar e otimizar prompts eficazes', '#10b981', 'MessageSquare', 1),
(gen_random_uuid(), 'Modelos e Parâmetros', 'models-parameters', 'Configurações e tipos de modelos de IA', '#3b82f6', 'Settings', 2),
(gen_random_uuid(), 'Tecnologias Web', 'web-technologies', 'APIs, protocolos e tecnologias para integração', '#8b5cf6', 'Code', 3),
(gen_random_uuid(), 'Dados e Armazenamento', 'data-storage', 'Como organizar e armazenar dados para IA', '#f59e0b', 'Database', 4);

-- Inserir termos práticos
INSERT INTO public.glossary_terms (id, title, slug, definition, short_definition, category_id, examples, difficulty_level, is_featured, is_published) VALUES

-- Conceitos de Prompt
(gen_random_uuid(), 'Prompt', 'prompt', 'Instrução ou comando que você dá para a IA realizar uma tarefa específica. É como você "conversa" com a IA para obter o resultado desejado.', 'Instrução dada à IA para realizar uma tarefa específica', (SELECT id FROM glossary_categories WHERE slug = 'prompt-concepts'), ARRAY['Escreva um email de vendas para um cliente interessado em consultoria de IA', 'Analise este relatório de vendas e me dê 3 insights principais', 'Crie um plano de marketing para lançamento de produto tech'], 'iniciante', true, true),

(gen_random_uuid(), 'Prompt Engineering', 'prompt-engineering', 'Arte de criar prompts eficazes para obter melhores resultados da IA. Envolve técnicas específicas para estruturar suas instruções.', 'Técnica para criar prompts mais eficazes', (SELECT id FROM glossary_categories WHERE slug = 'prompt-concepts'), ARRAY['Usar "Aja como especialista em..." antes da instrução', 'Dividir tarefas complexas em etapas menores', 'Pedir exemplos específicos em vez de respostas genéricas'], 'intermediario', true, true),

-- Modelos e Parâmetros  
(gen_random_uuid(), 'Temperature', 'temperature', 'Controla o quão criativa ou previsível será a resposta da IA. Valores baixos (0.1) = mais conservador, valores altos (0.9) = mais criativo.', 'Parâmetro que controla criatividade vs precisão da IA', (SELECT id FROM glossary_categories WHERE slug = 'models-parameters'), ARRAY['Temperature 0.1: Para análises financeiras precisas', 'Temperature 0.7: Para conteúdo de marketing criativo', 'Temperature 0.9: Para brainstorming e ideias inovadoras'], 'intermediario', true, true),

(gen_random_uuid(), 'Top-p', 'top-p', 'Controla a diversidade das respostas limitando as opções que a IA considera. Valores menores = respostas mais focadas.', 'Parâmetro que controla diversidade das respostas', (SELECT id FROM glossary_categories WHERE slug = 'models-parameters'), ARRAY['Top-p 0.1: Para relatórios técnicos objetivos', 'Top-p 0.5: Para emails profissionais', 'Top-p 0.9: Para conteúdo criativo e variado'], 'avancado', false, true),

(gen_random_uuid(), 'Modelo de IA', 'modelo-ia', 'O "cérebro" da IA que você escolhe para sua tarefa. Cada modelo tem especialidades diferentes (texto, imagem, código, etc.).', 'O tipo específico de IA escolhido para uma tarefa', (SELECT id FROM glossary_categories WHERE slug = 'models-parameters'), ARRAY['GPT-4: Para textos complexos e análises', 'Claude: Para documentos longos e pesquisa', 'Midjourney: Para criação de imagens'], 'iniciante', true, true),

-- Tecnologias Web
(gen_random_uuid(), 'API', 'api', 'Interface que permite que diferentes sistemas conversem entre si. É como um "garçom" que leva seu pedido para a cozinha (IA) e traz a resposta.', 'Interface para comunicação entre sistemas', (SELECT id FROM glossary_categories WHERE slug = 'web-technologies'), ARRAY['API do ChatGPT para integrar IA no seu site', 'API de CRM para sincronizar dados de clientes', 'API de pagamento para processar vendas automaticamente'], 'iniciante', true, true),

(gen_random_uuid(), 'JSON', 'json', 'Formato padronizado para trocar informações entre sistemas. É como uma "linguagem universal" que todos os sistemas entendem.', 'Formato padrão para troca de dados entre sistemas', (SELECT id FROM glossary_categories WHERE slug = 'web-technologies'), ARRAY['{"nome": "João", "empresa": "TechCorp", "interesse": "IA"}', 'Enviar dados de formulário para IA processar', 'Receber resposta estruturada da IA para exibir no sistema'], 'iniciante', false, true),

(gen_random_uuid(), 'Webhook', 'webhook', 'Notificação automática que um sistema envia quando algo acontece. É como um "alarme" que avisa outros sistemas sobre eventos importantes.', 'Notificação automática entre sistemas quando algo acontece', (SELECT id FROM glossary_categories WHERE slug = 'web-technologies'), ARRAY['Avisar quando cliente fez uma pergunta no chat', 'Notificar quando IA terminou de analisar um documento', 'Alertar quando novo lead se cadastrou no site'], 'intermediario', false, true),

(gen_random_uuid(), 'Front-end', 'front-end', 'A parte visível do sistema que o usuário interage - interface, botões, telas. É a "vitrine" da sua solução de IA.', 'Interface visual que o usuário vê e interage', (SELECT id FROM glossary_categories WHERE slug = 'web-technologies'), ARRAY['Chat bot na tela do site', 'Dashboard com gráficos de IA', 'Formulário para upload de documentos'], 'iniciante', false, true),

(gen_random_uuid(), 'Back-end', 'back-end', 'A parte invisível que processa tudo nos bastidores - onde a IA realmente trabalha e os dados são processados.', 'Sistema que processa dados e executa a lógica nos bastidores', (SELECT id FROM glossary_categories WHERE slug = 'web-technologies'), ARRAY['Servidor que processa análises de IA', 'Banco de dados com histórico de conversas', 'Sistema que conecta com APIs de IA'], 'iniciante', false, true),

-- Dados e Armazenamento
(gen_random_uuid(), 'Vector Store', 'vector-store', 'Banco de dados especializado que "entende" o significado do conteúdo, não apenas palavras. Permite buscar por conceitos similares.', 'Banco de dados que organiza informações por significado', (SELECT id FROM glossary_categories WHERE slug = 'data-storage'), ARRAY['Buscar "problemas de vendas" e encontrar "dificuldades comerciais"', 'Biblioteca de documentos da empresa pesquisável por IA', 'Base de conhecimento que responde perguntas contextuais'], 'avancado', false, true),

(gen_random_uuid(), 'Token', 'token', 'Unidade que a IA usa para "contar" texto - pode ser parte de uma palavra ou palavra completa. Usado para medir custo e limites.', 'Unidade de medida de texto processado pela IA', (SELECT id FROM glossary_categories WHERE slug = 'models-parameters'), ARRAY['1 token ≈ 4 caracteres em português', 'Prompt de 100 palavras ≈ 150 tokens', 'Limite de 4000 tokens = cerca de 3000 palavras'], 'intermediario', false, true);