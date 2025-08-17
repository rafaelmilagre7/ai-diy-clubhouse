-- Adicionar tags específicas para IA e programação na categoria existente
INSERT INTO lesson_tags (name, description, color, category, order_index, is_active) VALUES
('Inteligência Artificial', 'Aplicações e conceitos de IA', '#8b5cf6', 'Tecnologia & Programação', 5, true),
('Programação', 'Desenvolvimento e código', '#8b5cf6', 'Tecnologia & Programação', 6, true),
('Machine Learning', 'Aprendizado de máquina', '#8b5cf6', 'Tecnologia & Programação', 7, true),
('APIs', 'Integração com APIs', '#8b5cf6', 'Tecnologia & Programação', 8, true),
('Desenvolvimento', 'Criação de soluções tecnológicas', '#8b5cf6', 'Tecnologia & Programação', 9, true)
ON CONFLICT (name) DO NOTHING;