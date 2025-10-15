/**
 * Tipos do Database - Prevenção de erros de schema
 * 
 * Este arquivo documenta os tipos principais do banco de dados
 * para evitar erros de colunas inexistentes.
 */

export interface ProfileDatabase {
  id: string;
  name: string | null;
  email: string;
  company_name: string | null;
  current_position: string | null; // ⚠️ CORRETO: current_position (não "position")
  avatar_url: string | null;
  linkedin_url: string | null;
  whatsapp_number: string | null;
  industry: string | null;
  company_size: string | null;
  role_id: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NetworkingOpportunityDatabase {
  id: string;
  user_id: string;
  title: string;
  description: string;
  opportunity_type: 'parceria' | 'fornecedor' | 'cliente' | 'investimento' | 'outro';
  tags: string[];
  contact_preference: 'platform' | 'linkedin' | 'whatsapp' | 'email';
  is_active: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * NOTAS IMPORTANTES:
 * 
 * 1. A coluna de cargo no profiles é `current_position` (não `position`)
 * 2. Sempre use estes tipos ao fazer queries no Supabase
 * 3. Se adicionar novas colunas, atualize aqui primeiro
 */
