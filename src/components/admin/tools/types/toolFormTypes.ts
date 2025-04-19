
import { Tool, BenefitType } from '@/types/toolTypes';

export interface ToolFormProps {
  initialData?: Tool;
  onSubmit: (data: ToolFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export interface ToolFormValues {
  name: string;
  description: string;
  official_url: string;
  category: string;
  status: boolean;
  logo_url: string;
  tags: string[];
  video_tutorials: VideoTutorial[];
  has_member_benefit?: boolean;
  benefit_type?: BenefitType;
  benefit_title?: string;
  benefit_description?: string;
  benefit_link?: string;
  benefit_badge_url?: string;
  formModified?: boolean; // Campo auxiliar para rastrear modificações no formulário
}

export interface VideoTutorial {
  title: string;
  url: string;
  type: 'youtube' | 'upload';
}
