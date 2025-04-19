
import { Tool, BenefitType, ToolCategory, VideoTutorial } from '@/types/toolTypes';

export interface ToolFormProps {
  initialData?: Tool;
  onSubmit: (data: ToolFormValues) => Promise<boolean>;
  isSubmitting: boolean;
}

export interface ToolFormValues {
  name: string;
  description: string;
  official_url: string;
  category: ToolCategory;
  status: boolean;
  logo_url?: string | null;
  tags: string[];
  video_tutorials: VideoTutorial[];
  has_member_benefit?: boolean;
  benefit_type?: BenefitType | null;
  benefit_title?: string | null;
  benefit_description?: string | null;
  benefit_link?: string | null;
  benefit_badge_url?: string | null;
  formModified?: boolean; // Campo auxiliar para rastrear modificações no formulário
}
