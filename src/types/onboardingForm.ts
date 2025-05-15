
import { z } from "zod";

// Esquema de validação com Zod
export const onboardingSchema = z.object({
  nome_completo: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  telefone: z.string().min(10, "Telefone é obrigatório com no mínimo 10 dígitos"),
  nome_empresa: z.string().optional(),
  segmento_empresa: z.string().optional(),
  como_conheceu: z.string().min(1, "Como você nos conheceu é obrigatório"),
  quem_indicou: z.string().optional(),
  perfil_usuario: z.enum(["Empresário", "Estudante", "Profissional", "Outro"], {
    required_error: "Selecione seu perfil",
  }),
  areas_interesse: z.array(z.string()).min(1, "Selecione pelo menos uma área de interesse"),
  nivel_conhecimento: z.enum(["Iniciante", "Intermediário", "Avançado", "Especialista"], {
    required_error: "Selecione seu nível de conhecimento",
  }),
  experiencia_anterior: z.enum([
    "Não sei nada", 
    "Só Chat GPT", 
    "Uso várias ferramentas de mercado", 
    "Já faço automação com IA", 
    "Tenho um produto que usa IA"
  ]).optional(),
  objetivos: z.array(z.string()).default([]),
  preferencia_horario: z.array(z.string()).default([]),
  interesse_networking: z.boolean().default(false),
  estado: z.string().min(1, "Estado é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  permite_case: z.boolean().default(false),
  interesse_entrevista: z.boolean().default(false),
  observacoes: z.string().optional(),
}).refine(data => {
  // Validação condicional: se como_conheceu é "Indicação", quem_indicou é obrigatório
  if (data.como_conheceu === "Indicação" && (!data.quem_indicou || data.quem_indicou.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Por favor, informe quem indicou a plataforma",
  path: ["quem_indicou"]
});

// Tipo derivado do esquema Zod
export type OnboardingFormData = z.infer<typeof onboardingSchema>;

// Opções para os selects do formulário
export const formOptions = {
  perfilUsuario: ["Empresário", "Estudante", "Profissional", "Outro"],
  areasInteresse: [
    "IA Generativa (ChatGPT, Claude, etc)",
    "Automação de Processos",
    "Chatbots e Assistentes Virtuais",
    "Análise de Dados",
    "IA para Marketing",
    "IA para RH",
    "IA para Vendas",
    "IA para Suporte ao Cliente",
    "Visão Computacional",
    "Outros"
  ],
  nivelConhecimento: ["Iniciante", "Intermediário", "Avançado", "Especialista"],
  experienciaAnterior: [
    "Não sei nada", 
    "Só Chat GPT", 
    "Uso várias ferramentas de mercado", 
    "Já faço automação com IA", 
    "Tenho um produto que usa IA"
  ],
  objetivos: [
    "Aumentar vendas",
    "Gerar mais leads",
    "Melhorar processos internos",
    "Automatizar atendimento",
    "Desenvolver novos produtos",
    "Melhorar tomadas de decisão",
    "Expandir para novos mercados",
    "Outros"
  ],
  preferenciaHorario: [
    "Manhã (8h–12h)",
    "Tarde (13h–18h)",
    "Noite (19h–22h)"
  ],
  segmentoEmpresa: [
    "Tecnologia",
    "Saúde",
    "Educação",
    "Comércio",
    "Serviços",
    "Indústria",
    "Inteligência Artificial",
    "Finanças",
    "Marketing/Publicidade",
    "Varejo/E-commerce",
    "Logística",
    "Alimentos/Bebidas",
    "Outro"
  ],
  comoConheceu: [
    "Instagram",
    "YouTube",
    "Google",
    "Indicação",
    "LinkedIn",
    "Facebook",
    "TikTok",
    "Podcast",
    "Outro"
  ]
};
