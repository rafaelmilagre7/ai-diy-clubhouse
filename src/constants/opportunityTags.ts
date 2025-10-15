import { LucideIcon, Cpu, TrendingUp, Globe, DollarSign, Rocket, Building2, Users, Heart, Leaf, GraduationCap, Smartphone, Briefcase } from 'lucide-react';

export interface OpportunityTag {
  id: string;
  label: string;
  category: 'setor' | 'foco' | 'alcance' | 'ticket' | 'estagio';
  icon: LucideIcon;
  color: string;
}

export const OPPORTUNITY_TAGS: OpportunityTag[] = [
  // Setores (12 tags)
  { id: 'tecnologia', label: 'Tecnologia', category: 'setor', icon: Cpu, color: 'hsl(var(--primary))' },
  { id: 'saude', label: 'Saúde', category: 'setor', icon: Heart, color: 'hsl(var(--aurora))' },
  { id: 'educacao', label: 'Educação', category: 'setor', icon: GraduationCap, color: 'hsl(var(--viverblue))' },
  { id: 'financeiro', label: 'Financeiro', category: 'setor', icon: DollarSign, color: 'hsl(var(--operational))' },
  { id: 'varejo', label: 'Varejo', category: 'setor', icon: Building2, color: 'hsl(var(--primary))' },
  { id: 'servicos', label: 'Serviços', category: 'setor', icon: Briefcase, color: 'hsl(var(--aurora))' },
  { id: 'industria', label: 'Indústria', category: 'setor', icon: Building2, color: 'hsl(var(--viverblue))' },
  { id: 'agronegocio', label: 'Agronegócio', category: 'setor', icon: Leaf, color: 'hsl(var(--operational))' },
  { id: 'mobile', label: 'Mobile', category: 'setor', icon: Smartphone, color: 'hsl(var(--primary))' },
  
  // Foco (6 tags)
  { id: 'b2b', label: 'B2B', category: 'foco', icon: Building2, color: 'hsl(var(--primary))' },
  { id: 'b2c', label: 'B2C', category: 'foco', icon: Users, color: 'hsl(var(--aurora))' },
  { id: 'b2g', label: 'B2G', category: 'foco', icon: Building2, color: 'hsl(var(--viverblue))' },
  { id: 'marketplace', label: 'Marketplace', category: 'foco', icon: Globe, color: 'hsl(var(--operational))' },
  { id: 'saas', label: 'SaaS', category: 'foco', icon: Cpu, color: 'hsl(var(--primary))' },
  { id: 'ecommerce', label: 'E-commerce', category: 'foco', icon: Smartphone, color: 'hsl(var(--aurora))' },
  
  // Alcance (4 tags)
  { id: 'local', label: 'Local', category: 'alcance', icon: Globe, color: 'hsl(var(--primary))' },
  { id: 'regional', label: 'Regional', category: 'alcance', icon: Globe, color: 'hsl(var(--aurora))' },
  { id: 'nacional', label: 'Nacional', category: 'alcance', icon: Globe, color: 'hsl(var(--viverblue))' },
  { id: 'internacional', label: 'Internacional', category: 'alcance', icon: Globe, color: 'hsl(var(--operational))' },
  
  // Ticket (4 tags)
  { id: 'baixo-ticket', label: 'Baixo Ticket', category: 'ticket', icon: DollarSign, color: 'hsl(var(--primary))' },
  { id: 'medio-ticket', label: 'Médio Ticket', category: 'ticket', icon: DollarSign, color: 'hsl(var(--aurora))' },
  { id: 'alto-ticket', label: 'Alto Ticket', category: 'ticket', icon: DollarSign, color: 'hsl(var(--viverblue))' },
  { id: 'enterprise', label: 'Enterprise', category: 'ticket', icon: Building2, color: 'hsl(var(--operational))' },
  
  // Estágio (5 tags)
  { id: 'idea', label: 'Ideia', category: 'estagio', icon: Rocket, color: 'hsl(var(--primary))' },
  { id: 'mvp', label: 'MVP', category: 'estagio', icon: Rocket, color: 'hsl(var(--aurora))' },
  { id: 'crescimento', label: 'Crescimento', category: 'estagio', icon: TrendingUp, color: 'hsl(var(--viverblue))' },
  { id: 'escalando', label: 'Escalando', category: 'estagio', icon: TrendingUp, color: 'hsl(var(--operational))' },
  { id: 'consolidado', label: 'Consolidado', category: 'estagio', icon: Building2, color: 'hsl(var(--primary))' },
];

export const TAG_CATEGORIES = {
  setor: 'Setor',
  foco: 'Foco de Negócio',
  alcance: 'Alcance',
  ticket: 'Ticket Médio',
  estagio: 'Estágio',
};

export const MAX_TAGS = 5;
