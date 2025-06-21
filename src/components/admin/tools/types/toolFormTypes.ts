
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { toolFormSchema } from '../schema/toolFormSchema';
import { Tool } from '@/types/toolTypes';

export type ToolFormValues = z.infer<typeof toolFormSchema>;

export interface ToolFormProps {
  initialData?: Tool;
  onSubmit: (data: ToolFormValues) => Promise<{ success: boolean; data?: Tool }>;
  isSubmitting: boolean;
}

export interface ToolFormComponentProps extends ToolFormProps {
  onSaveSuccess?: (savedData: Tool) => void;
}
