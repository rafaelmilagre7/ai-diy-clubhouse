
import { z } from "zod";

// Este arquivo contém os tipos legacy que ainda podem ser usados em algumas partes
// Mantendo apenas os tipos essenciais para compatibilidade

// Opções para os selects que ainda podem ser utilizadas
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
