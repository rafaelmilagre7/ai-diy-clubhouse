
import { Tool } from '@/types/toolTypes';

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
}

export interface VideoTutorial {
  title: string;
  url: string;
}
