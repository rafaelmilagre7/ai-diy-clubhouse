-- Inserir tags padrão para classificação de aulas
INSERT INTO lesson_tags (name, description, color, category, order_index, is_active) VALUES
  -- Vendas & Comercial
  ('Vendas', 'Técnicas e estratégias de vendas', '#22c55e', 'Vendas & Comercial', 1, true),
  ('Negociação', 'Processos de negociação', '#22c55e', 'Vendas & Comercial', 2, true),
  ('Prospecção', 'Técnicas de prospecção de clientes', '#22c55e', 'Vendas & Comercial', 3, true),
  ('CRM', 'Gestão de relacionamento com cliente', '#22c55e', 'Vendas & Comercial', 4, true),
  ('Vendas Digitais', 'Estratégias de vendas online', '#22c55e', 'Vendas & Comercial', 5, true),
  
  -- Marketing & Conteúdo
  ('Marketing Digital', 'Estratégias de marketing online', '#3b82f6', 'Marketing & Conteúdo', 1, true),
  ('Conteúdo', 'Criação e estratégia de conteúdo', '#3b82f6', 'Marketing & Conteúdo', 2, true),
  ('SEO', 'Otimização para mecanismos de busca', '#3b82f6', 'Marketing & Conteúdo', 3, true),
  ('Redes Sociais', 'Gestão de mídias sociais', '#3b82f6', 'Marketing & Conteúdo', 4, true),
  ('Copywriting', 'Redação persuasiva', '#3b82f6', 'Marketing & Conteúdo', 5, true),
  
  -- Gestão & Operações
  ('Gestão', 'Princípios de gestão empresarial', '#f59e0b', 'Gestão & Operações', 1, true),
  ('Liderança', 'Desenvolvimento de liderança', '#f59e0b', 'Gestão & Operações', 2, true),
  ('Processos', 'Otimização de processos', '#f59e0b', 'Gestão & Operações', 3, true),
  ('Produtividade', 'Técnicas de produtividade', '#f59e0b', 'Gestão & Operações', 4, true),
  ('Planejamento', 'Estratégias de planejamento', '#f59e0b', 'Gestão & Operações', 5, true),
  
  -- Casos & Atendimento
  ('Caso de Sucesso', 'Estudos de caso reais', '#ef4444', 'Casos & Atendimento', 1, true),
  ('Atendimento', 'Excelência no atendimento', '#ef4444', 'Casos & Atendimento', 2, true),
  ('Experiência do Cliente', 'Melhoria da experiência', '#ef4444', 'Casos & Atendimento', 3, true),
  ('Retenção', 'Estratégias de retenção', '#ef4444', 'Casos & Atendimento', 4, true),
  
  -- Tecnologia & Programação
  ('Automação', 'Ferramentas de automação', '#8b5cf6', 'Tecnologia & Programação', 1, true),
  ('Integração', 'Integração de sistemas', '#8b5cf6', 'Tecnologia & Programação', 2, true),
  ('Analytics', 'Análise de dados e métricas', '#8b5cf6', 'Tecnologia & Programação', 3, true),
  ('Ferramentas', 'Uso de ferramentas digitais', '#8b5cf6', 'Tecnologia & Programação', 4, true),
  
  -- Análise de Dados
  ('Métricas', 'Indicadores e KPIs', '#06b6d4', 'Análise de Dados', 1, true),
  ('Relatórios', 'Criação de relatórios', '#06b6d4', 'Análise de Dados', 2, true),
  ('Dashboard', 'Painéis de controle', '#06b6d4', 'Análise de Dados', 3, true),
  ('ROI', 'Retorno sobre investimento', '#06b6d4', 'Análise de Dados', 4, true)

ON CONFLICT (name) DO NOTHING;