-- Inserir mais artigos de exemplo para o Wiki
INSERT INTO public.wiki_articles (title, slug, content, excerpt, category_id, tags, difficulty_level, reading_time_minutes, is_featured) VALUES
('Introdução ao Machine Learning', 'introducao-machine-learning',
'# Introdução ao Machine Learning

**Machine Learning (ML)** é um subcampo da Inteligência Artificial que permite que computadores aprendam e melhorem automaticamente através da experiência, sem serem explicitamente programados para cada tarefa específica.

## O que é Machine Learning?

Machine Learning é baseado na ideia de que máquinas podem aprender com dados, identificar padrões e tomar decisões com mínima intervenção humana.

### Conceitos Fundamentais

#### Algoritmos
- **Supervisionado**: Aprende com dados rotulados
- **Não-supervisionado**: Encontra padrões em dados não rotulados  
- **Por Reforço**: Aprende através de tentativa e erro

#### Dados de Treino
- Conjunto de dados usado para ensinar o algoritmo
- Qualidade dos dados é crucial para o sucesso

#### Modelo
- Resultado do algoritmo treinado nos dados
- Usado para fazer previsões em novos dados

## Tipos de Machine Learning

### Aprendizado Supervisionado
- **Classificação**: Prever categorias (spam/não spam)
- **Regressão**: Prever valores contínuos (preços, temperaturas)

### Aprendizado Não-supervisionado
- **Clustering**: Agrupar dados similares
- **Redução de Dimensionalidade**: Simplificar dados complexos

### Aprendizado por Reforço
- **Agentes**: Entidades que tomam decisões
- **Recompensas**: Feedback para melhorar decisões

## Aplicações Práticas

- **Netflix**: Recomendação de filmes e séries
- **Google**: Algoritmos de busca e tradução
- **Bancos**: Detecção de fraudes
- **Medicina**: Diagnóstico por imagem
- **Carros**: Direção autônoma

Machine Learning está revolucionando como resolvemos problemas complexos e tomamos decisões baseadas em dados.',
'Fundamentos essenciais do Machine Learning: tipos, algoritmos e aplicações práticas no mundo real.',
(SELECT id FROM public.wiki_categories WHERE slug = 'machine-learning'),
ARRAY['ML', 'algoritmos', 'dados', 'supervisionado'],
'iniciante',
7,
true),

('LLMs: Large Language Models Explicados', 'llms-large-language-models',
'# LLMs: Large Language Models Explicados

**Large Language Models (LLMs)** são modelos de IA treinados em enormes quantidades de texto para entender e gerar linguagem humana de forma contextual e coerente.

## O que são LLMs?

LLMs são redes neurais massivas, tipicamente baseadas na arquitetura Transformer, que podem:

- **Compreender contexto** em conversas longas
- **Gerar texto** fluente e coerente  
- **Traduzir** entre idiomas
- **Resumir** documentos complexos
- **Responder perguntas** sobre diversos tópicos

## Como Funcionam?

### Arquitetura Transformer
- **Attention Mechanism**: Foco em partes relevantes do texto
- **Parallel Processing**: Processamento eficiente de sequências
- **Self-Attention**: Compreensão de relações dentro do texto

### Processo de Treinamento

#### 1. Pré-treinamento
- Treinamento em bilhões de palavras da internet
- Aprendizado de padrões de linguagem
- Desenvolvimento de conhecimento geral

#### 2. Fine-tuning
- Ajuste para tarefas específicas
- Melhoria da qualidade das respostas
- Alinhamento com valores humanos

#### 3. RLHF (Reinforcement Learning from Human Feedback)
- Refinamento baseado em feedback humano
- Redução de respostas inadequadas
- Melhoria da utilidade e segurança

## Principais LLMs

### GPT (Generative Pre-trained Transformer)
- **GPT-3**: 175 bilhões de parâmetros
- **GPT-4**: Capacidades multimodais avançadas
- **ChatGPT**: Interface conversacional popular

### Claude (Anthropic)
- Foco em segurança e alinhamento
- Conversas mais longas e detalhadas
- Menor propensão a alucinações

### LLaMA (Meta)
- Modelos de código aberto
- Eficiência computacional
- Pesquisa acadêmica acessível

## Aplicações Práticas

### Assistentes Virtuais
- Atendimento ao cliente automatizado
- Suporte técnico inteligente
- Agendamento e organização

### Criação de Conteúdo
- Redação de artigos e blogs
- Roteiros e narrativas
- Tradução profissional

### Programação
- Geração de código
- Debug e otimização
- Documentação automática

### Análise de Dados
- Interpretação de relatórios
- Insights de negócio
- Resumos executivos

## Limitações e Desafios

### Alucinações
- Geração de informações incorretas
- Confiança excessiva em respostas falsas
- Necessidade de verificação humana

### Viés
- Reprodução de preconceitos dos dados de treino
- Representação desigual de grupos
- Impacto em decisões importantes

### Recursos Computacionais
- Alto custo de treinamento e execução
- Impacto ambiental significativo
- Acesso limitado para organizações menores

## Futuro dos LLMs

- **Modelos Multimodais**: Integração de texto, imagem e áudio
- **Eficiência**: Modelos menores e mais eficientes
- **Especialização**: LLMs focados em domínios específicos
- **Democratização**: Acesso mais amplo e ferramentas simplificadas

Os LLMs representam um marco na evolução da IA, transformando como interagimos com tecnologia e informação.',
'Guia completo sobre Large Language Models: funcionamento, aplicações e o futuro da IA conversacional.',
(SELECT id FROM public.wiki_categories WHERE slug = 'llms-nlp'),
ARRAY['LLM', 'GPT', 'transformer', 'NLP'],
'intermediario',
12,
true),

('RPA: Robotic Process Automation', 'rpa-robotic-process-automation',
'# RPA: Robotic Process Automation

**RPA (Robotic Process Automation)** é uma tecnologia que utiliza "robôs de software" para automatizar tarefas repetitivas e baseadas em regras, anteriormente executadas por humanos.

## O que é RPA?

RPA permite criar bots que podem:

- **Interagir** com aplicações como humanos
- **Processar dados** estruturados e semi-estruturados
- **Seguir regras** pré-definidas consistentemente
- **Trabalhar 24/7** sem interrupções
- **Integrar sistemas** sem modificações técnicas

## Como Funciona?

### Componentes Principais

#### Bot Designer/Studio
- Interface para criar automações
- Drag-and-drop para workflows
- Gravação de ações humanas

#### Bot Runner
- Executa os processos automatizados
- Pode rodar em máquinas virtuais
- Escalabilidade sob demanda

#### Control Center
- Gerenciamento centralizado de bots
- Monitoramento e relatórios
- Agendamento de execuções

## Tipos de RPA

### RPA Assistido (Attended)
- Trabalhador humano inicia o bot
- Interação colaborativa
- Ideal para processos que precisam de julgamento humano

### RPA Não Assistido (Unattended)
- Execução completamente automática
- Triggered por eventos ou horários
- Processamento em lote eficiente

### RPA Híbrido
- Combinação dos dois modelos
- Flexibilidade máxima
- Otimização baseada no processo

## Casos de Uso Comuns

### Recursos Humanos
- **Onboarding**: Criação de contas e acessos
- **Processamento de férias**: Aprovações automáticas
- **Relatórios de ponto**: Compilação e validação

### Financeiro
- **Contas a pagar**: Validação e processamento de faturas
- **Reconciliação bancária**: Comparação automática de extratos
- **Fechamento mensal**: Geração de relatórios contábeis

### Atendimento ao Cliente
- **Triagem de tickets**: Classificação automática
- **Atualizações de status**: Comunicação proativa
- **Consultas simples**: Respostas automatizadas

### Vendas e Marketing
- **Lead scoring**: Classificação de prospects
- **Relatórios de vendas**: Compilação de dados
- **Campanhas email**: Segmentação e envio

## Principais Ferramentas RPA

### UiPath
- Interface visual intuitiva
- Marketplace de automações
- IA integrada para documentos

### Automation Anywhere
- Cloud-native architecture
- Bot marketplace
- Cognitive automation

### Blue Prism
- Enterprise-grade security
- Governança robusta
- Escalabilidade empresarial

### Microsoft Power Automate
- Integração com Office 365
- Conectores nativos abundantes
- Pricing acessível

## Benefícios do RPA

### Eficiência
- **Redução de tempo**: 30-50% menos tempo para processos
- **Eliminação de erros**: Precisão de 99.9%
- **Disponibilidade**: 24x7x365

### Custos
- **ROI rápido**: Retorno em 6-12 meses típico
- **Redução de custos**: 25-50% em processos automatizados
- **Sem mudanças de sistema**: Uso de interfaces existentes

### Qualidade
- **Consistência**: Mesma execução sempre
- **Auditoria completa**: Log de todas as ações
- **Compliance**: Seguimento rigoroso de regras

## Desafios e Considerações

### Governança
- **Change management**: Mudança de processos organizacionais
- **Manutenção**: Bots precisam de atualizações regulares
- **Segurança**: Acesso privilegiado dos bots

### Limitações Técnicas
- **Interfaces instáveis**: Sites que mudam frequentemente
- **Dados não estruturados**: Limitações com documentos complexos
- **Decisões complexas**: Necessidade de julgamento humano

### Aspectos Humanos
- **Resistência à mudança**: Medo de substituição
- **Requalificação**: Necessidade de novas habilidades
- **Gestão de expectativas**: RPA não é AI

## Futuro do RPA

### Intelligent Automation
- **IA integrada**: OCR, NLP, Machine Learning
- **Decisões cognitivas**: Capacidade de julgamento
- **Aprendizado contínuo**: Melhoria automática

### Hyperautomation
- **Orquestração de tecnologias**: RPA + AI + Analytics
- **End-to-end automation**: Processos completos
- **Ecosystem approach**: Plataformas integradas

RPA é uma ponte essencial para a transformação digital, oferecendo benefícios imediatos enquanto prepara organizações para automação mais avançada.',
'Guia completo de RPA: conceitos, ferramentas, casos de uso e como implementar automação robótica de processos.',
(SELECT id FROM public.wiki_categories WHERE slug = 'automacao'),
ARRAY['RPA', 'automação', 'bots', 'processos'],
'intermediario',
10,
false),

('Computer Vision: Fundamentos', 'computer-vision-fundamentos',
'# Computer Vision: Fundamentos

**Computer Vision** é um campo da Inteligência Artificial que permite que computadores interpretem e compreendam informações visuais do mundo real, incluindo imagens e vídeos.

## O que é Computer Vision?

Computer Vision combina técnicas de processamento de imagem, aprendizado de máquina e matemática para:

- **Detectar objetos** em imagens e vídeos
- **Reconhecer faces** e expressões
- **Ler texto** em documentos e placas
- **Analisar movimentos** e gestos
- **Reconstruir cenas** em 3D

## Como Funciona?

### Processamento de Imagem
#### Aquisição
- Captura através de câmeras ou sensores
- Conversão em formato digital
- Normalização e pré-processamento

#### Filtragem
- **Filtros de ruído**: Limpeza da imagem
- **Detecção de bordas**: Identificação de contornos
- **Segmentação**: Separação de regiões de interesse

### Extração de Features
#### Features Tradicionais
- **SIFT**: Scale-Invariant Feature Transform
- **HOG**: Histogram of Oriented Gradients
- **LBP**: Local Binary Patterns

#### Deep Learning Features
- **CNNs**: Convolutional Neural Networks
- **Aprendizado automático**: Features aprendidas pelos dados
- **Transfer Learning**: Uso de modelos pré-treinados

## Técnicas Principais

### Classificação de Imagens
- **Objetivo**: Identificar o que está na imagem
- **Exemplos**: "Esta é uma foto de um gato"
- **Arquiteturas**: ResNet, EfficientNet, Vision Transformer

### Detecção de Objetos
- **Objetivo**: Encontrar e localizar objetos específicos
- **Output**: Caixas delimitadoras + classificações
- **Algoritmos**: YOLO, R-CNN, SSD

### Segmentação
#### Semântica
- Classificação de cada pixel da imagem
- Separação por classes (pessoa, carro, árvore)

#### Instância
- Separação de objetos individuais
- Útil quando há múltiplos objetos da mesma classe

### Reconhecimento Facial
- **Detecção**: Encontrar faces na imagem
- **Verificação**: Confirmar identidade
- **Identificação**: Determinar quem é a pessoa
- **Análise de expressão**: Emoções e estados

## Aplicações Práticas

### Segurança e Vigilância
- **Monitoramento**: Câmeras inteligentes
- **Controle de acesso**: Reconhecimento facial
- **Detecção de comportamento**: Atividades suspeitas

### Automobilística
- **Carros autônomos**: Detecção de obstáculos
- **ADAS**: Sistemas de assistência ao motorista
- **Reconhecimento de placas**: Controle de tráfego

### Medicina
- **Diagnóstico por imagem**: Raios-X, ressonância
- **Cirurgia robótica**: Orientação visual
- **Telemedicina**: Análise remota de exames

### Varejo e E-commerce
- **Busca visual**: Encontrar produtos por foto
- **Análise de prateleiras**: Monitoramento de estoque
- **Experiência AR**: Provadores virtuais

### Agricultura
- **Monitoramento de culturas**: Saúde das plantas
- **Detecção de pragas**: Identificação precoce
- **Agricultura de precisão**: Otimização de recursos

## Ferramentas e Tecnologias

### Bibliotecas Python
#### OpenCV
- Processamento de imagem tradicional
- Ampla gama de algoritmos
- Interface simples e eficiente

#### TensorFlow/Keras
- Deep learning para visão computacional
- Modelos pré-treinados disponíveis
- Ecosystem completo para ML

#### PyTorch
- Pesquisa e desenvolvimento ágil
- Interface pythônica intuitiva
- Forte comunidade acadêmica

### Plataformas Cloud
#### Google Cloud Vision
- APIs prontas para uso
- Reconhecimento de texto e objetos
- Integração com outros serviços Google

#### Amazon Rekognition
- Análise de imagens e vídeos
- Reconhecimento facial robusto
- Detecção de conteúdo inadequado

#### Azure Computer Vision
- Análise cognitiva de imagens
- OCR avançado
- Integração com Office 365

## Desafios Atuais

### Variações de Iluminação
- **Sombras e reflexos**: Podem mascarar objetos
- **Condições extremas**: Muito escuro ou claro
- **Soluções**: Normalização e augmentação de dados

### Oclusão
- **Objetos parcialmente escondidos**: Detecção incompleta
- **Sobreposição**: Separação de instâncias
- **Abordagens**: Modelos robustos e context awareness

### Diversidade de Dados
- **Viés nos datasets**: Representação desigual
- **Generalização**: Performance em novos domínios
- **Ética**: Fairness e inclusividade

### Processamento em Tempo Real
- **Latência**: Decisões rápidas necessárias
- **Hardware**: Limitações computacionais
- **Otimização**: Model compression e edge computing

## Futuro da Computer Vision

### Modelos Multimodais
- **Integração texto-imagem**: CLIP, DALL-E
- **Compreensão contextual**: Além da detecção simples
- **Reasoning visual**: Capacidade de raciocínio

### Edge Computing
- **Processamento local**: Menor latência
- **Privacy**: Dados não deixam o dispositivo
- **Eficiência**: Modelos otimizados para hardware específico

### Computer Vision Generativa
- **Síntese de imagens**: GANs e diffusion models
- **Edição inteligente**: Modificação semântica
- **Realidade aumentada**: Sobreposição de conteúdo

Computer Vision está transformando como máquinas percebem e interagem com o mundo visual, abrindo possibilidades infinitas para automação e análise inteligente.',
'Fundamentos de Computer Vision: técnicas, aplicações e tecnologias para análise inteligente de imagens.',
(SELECT id FROM public.wiki_categories WHERE slug = 'computer-vision'),
ARRAY['computer vision', 'CNN', 'reconhecimento', 'deep learning'],
'intermediario',
15,
false);