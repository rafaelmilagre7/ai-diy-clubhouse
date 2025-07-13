-- Add more glossary terms
INSERT INTO glossary_terms (title, slug, short_definition, definition, category_id, difficulty_level, tags, related_terms, synonyms, examples)
SELECT 
  'Machine Learning',
  'machine-learning',
  'Subconjunto da IA que aprende a partir de dados',
  'Machine Learning é uma subdisciplina da inteligência artificial que permite que sistemas aprendam e melhorem automaticamente através da experiência, sem serem explicitamente programados para cada tarefa específica.',
  id,
  'iniciante',
  ARRAY['ML', 'aprendizado', 'algoritmos'],
  ARRAY['Algoritmos', 'Dados', 'Treinamento'],
  ARRAY['ML', 'Aprendizado de Máquina'],
  ARRAY['Filtros de spam no email', 'Detecção de fraudes bancárias', 'Sistemas de recomendação']
FROM glossary_categories WHERE slug = 'machine-learning';

INSERT INTO glossary_terms (title, slug, short_definition, definition, category_id, difficulty_level, tags, related_terms, synonyms, examples)
SELECT 
  'Deep Learning',
  'deep-learning',
  'Redes neurais com múltiplas camadas',
  'Deep Learning é uma técnica de machine learning que utiliza redes neurais artificiais com múltiplas camadas (daí o termo "profundo") para modelar e processar dados complexos, como imagens, texto e áudio.',
  id,
  'intermediario',
  ARRAY['redes neurais', 'camadas', 'complexo'],
  ARRAY['Redes Neurais', 'CNN', 'RNN'],
  ARRAY['DL', 'Aprendizado Profundo'],
  ARRAY['Reconhecimento facial', 'Tradução automática', 'Diagnóstico médico por imagem']
FROM glossary_categories WHERE slug = 'deep-learning';

INSERT INTO glossary_terms (title, slug, short_definition, definition, category_id, difficulty_level, tags, related_terms, synonyms, examples)
SELECT 
  'Large Language Model',
  'large-language-model',
  'Modelos de IA treinados em grandes volumes de texto',
  'Large Language Models (LLMs) são modelos de inteligência artificial treinados em enormes quantidades de dados textuais para compreender e gerar linguagem humana de forma natural e contextualizada.',
  id,
  'intermediario',
  ARRAY['LLM', 'linguagem', 'texto', 'GPT'],
  ARRAY['GPT', 'BERT', 'Transformer'],
  ARRAY['LLM', 'Modelo de Linguagem Grande'],
  ARRAY['ChatGPT', 'GPT-4', 'Claude', 'Gemini']
FROM glossary_categories WHERE slug = 'modelos-arquiteturas';

INSERT INTO glossary_terms (title, slug, short_definition, definition, category_id, difficulty_level, tags, related_terms, synonyms, examples)
SELECT 
  'Prompt Engineering',
  'prompt-engineering',
  'Arte de criar instruções eficazes para IAs',
  'Prompt Engineering é a prática de criar, otimizar e refinar instruções (prompts) para obter respostas mais precisas e úteis de modelos de linguagem e outros sistemas de IA.',
  id,
  'intermediario',
  ARRAY['prompt', 'instruções', 'otimização'],
  ARRAY['LLM', 'Chat', 'Instruções'],
  ARRAY['Engenharia de Prompt'],
  ARRAY['Criação de prompts para ChatGPT', 'Otimização de instruções', 'Few-shot prompting']
FROM glossary_categories WHERE slug = 'conceitos-basicos';

INSERT INTO glossary_terms (title, slug, short_definition, definition, category_id, difficulty_level, tags, related_terms, synonyms, examples)
SELECT 
  'Computer Vision',
  'computer-vision',
  'IA que interpreta e analisa imagens',
  'Computer Vision é um campo da inteligência artificial que permite aos computadores "ver" e interpretar informações visuais do mundo real, processando e analisando imagens e vídeos.',
  id,
  'intermediario',
  ARRAY['visão', 'imagem', 'processamento'],
  ARRAY['CNN', 'Reconhecimento', 'Detecção'],
  ARRAY['Visão Computacional'],
  ARRAY['Reconhecimento facial', 'Carros autônomos', 'Análise médica de raio-X']
FROM glossary_categories WHERE slug = 'computer-vision';

INSERT INTO glossary_terms (title, slug, short_definition, definition, category_id, difficulty_level, tags, related_terms, synonyms, examples)
SELECT 
  'Natural Language Processing',
  'natural-language-processing',
  'IA que compreende e processa linguagem humana',
  'Natural Language Processing (NLP) é uma área da inteligência artificial que se concentra na interação entre computadores e linguagem humana, permitindo que máquinas compreendam, interpretem e gerem texto de forma natural.',
  id,
  'intermediario',
  ARRAY['NLP', 'linguagem', 'texto', 'processamento'],
  ARRAY['Text Mining', 'Sentiment Analysis', 'Tokenização'],
  ARRAY['PLN', 'Processamento de Linguagem Natural'],
  ARRAY['Tradutores automáticos', 'Chatbots', 'Análise de sentimentos']
FROM glossary_categories WHERE slug = 'nlp';

INSERT INTO glossary_terms (title, slug, short_definition, definition, category_id, difficulty_level, tags, related_terms, synonyms, examples)
SELECT 
  'Neural Network',
  'neural-network',
  'Modelo computacional inspirado no cérebro humano',
  'Neural Networks são modelos computacionais inspirados na estrutura e funcionamento dos neurônios do cérebro humano, compostos por camadas de nós interconectados que processam informações.',
  id,
  'intermediario',
  ARRAY['neurônios', 'camadas', 'conexões'],
  ARRAY['Perceptron', 'Backpropagation', 'Ativação'],
  ARRAY['Rede Neural', 'RNA'],
  ARRAY['Reconhecimento de padrões', 'Classificação de imagens', 'Previsão de séries temporais']
FROM glossary_categories WHERE slug = 'deep-learning';

INSERT INTO glossary_terms (title, slug, short_definition, definition, category_id, difficulty_level, tags, related_terms, synonyms, examples)
SELECT 
  'Algorithm',
  'algorithm',
  'Conjunto de instruções para resolver problemas',
  'Um algoritmo é uma sequência finita de instruções bem definidas e não ambíguas para resolver um problema ou executar uma tarefa específica em inteligência artificial e computação.',
  id,
  'iniciante',
  ARRAY['instruções', 'lógica', 'solução'],
  ARRAY['Lógica', 'Programação', 'Estrutura'],
  ARRAY['Algoritmo'],
  ARRAY['Algoritmo de busca', 'Algoritmo de ordenação', 'Algoritmo genético']
FROM glossary_categories WHERE slug = 'conceitos-basicos';