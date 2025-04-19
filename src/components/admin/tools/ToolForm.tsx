
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { BasicInfo } from './components/BasicInfo';
import { TagManager } from './components/TagManager';
import { VideoTutorials } from './components/VideoTutorials';
import { MemberBenefit } from './components/MemberBenefit';
import { toolFormSchema } from './schema/toolFormSchema';
import { ToolFormProps } from './types/toolFormTypes';

export const ToolForm = ({ initialData, onSubmit, isSubmitting }: ToolFormProps) => {
  const form = useForm({
    resolver: zodResolver(toolFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      official_url: initialData?.official_url || '',
      category: initialData?.category || '',
      status: initialData?.status ?? true,
      logo_url: initialData?.logo_url || '',
      tags: initialData?.tags || [],
      video_tutorials: initialData?.video_tutorials || [],
      has_member_benefit: initialData?.has_member_benefit || false,
      benefit_title: initialData?.benefit_title || '',
      benefit_description: initialData?.benefit_description || '',
      benefit_link: initialData?.benefit_link || '',
      benefit_badge_url: initialData?.benefit_badge_url || ''
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <BasicInfo form={form} />
        <TagManager form={form} />
        <MemberBenefit form={form} />
        <VideoTutorials form={form} />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Ferramenta'}
        </Button>
      </form>
    </Form>
  );
};
