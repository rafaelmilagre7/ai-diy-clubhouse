
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { BasicInfo } from './components/BasicInfo';
import { MemberBenefit } from './components/MemberBenefit';
import { VideoTutorials } from './components/VideoTutorials';
import { TagManager } from './components/TagManager';
import { toolFormSchema } from './schema/toolFormSchema';
import type { ToolFormValues, ToolFormComponentProps } from './types/toolFormTypes';

export const ToolForm: React.FC<ToolFormComponentProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  onSaveSuccess
}) => {
  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      official_url: initialData?.official_url || '',
      category: (initialData?.category as any) || 'Outros',
      status: initialData?.status ?? true,
      logo_url: initialData?.logo_url || '',
      tags: initialData?.tags || [],
      video_tutorials: initialData?.video_tutorials || [],
      has_member_benefit: initialData?.has_member_benefit || false,
      benefit_type: (initialData?.benefit_type as any) || null,
      benefit_title: initialData?.benefit_title || '',
      benefit_description: initialData?.benefit_description || '',
      benefit_link: initialData?.benefit_link || '',
      benefit_badge_url: initialData?.benefit_badge_url || '',
      formModified: false
    }
  });

  const handleSubmit = async (data: ToolFormValues) => {
    const result = await onSubmit(data);
    if (result.success && result.data && onSaveSuccess) {
      onSaveSuccess(result.data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Ferramenta</CardTitle>
          </CardHeader>
          <CardContent>
            <BasicInfo form={form} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <TagManager form={form} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vídeos Tutoriais</CardTitle>
          </CardHeader>
          <CardContent>
            <VideoTutorials form={form} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Benefícios para Membros</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberBenefit form={form} />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Ferramenta
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
