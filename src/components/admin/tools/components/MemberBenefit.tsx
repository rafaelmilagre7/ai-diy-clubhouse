
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { Badge, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { ToolFormValues } from '../types/toolFormTypes';

interface MemberBenefitProps {
  form: UseFormReturn<ToolFormValues>;
}

export const MemberBenefit = ({ form }: MemberBenefitProps) => {
  const hasBenefit = form.watch('has_member_benefit');

  useEffect(() => {
    // Quando o usuário desativa o benefício, limpa os campos relacionados
    if (!hasBenefit) {
      form.setValue('benefit_title', '');
      form.setValue('benefit_description', '');
      form.setValue('benefit_link', '');
      // Não limpa a imagem do badge para evitar perda de dados acidental
    }
  }, [hasBenefit, form]);

  // Renderização condicional do preview
  const renderPreview = () => {
    const benefitTitle = form.watch('benefit_title') || 'Título do Benefício';
    const benefitDescription = form.watch('benefit_description') || 'Descrição detalhada do benefício exclusivo para membros do VIVER DE IA Club.';
    const benefitBadgeUrl = form.watch('benefit_badge_url');

    return (
      <Card className="border-2 border-[#10b981]/30 mt-4">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center">
              {benefitBadgeUrl ? (
                <img src={benefitBadgeUrl} alt="Badge" className="w-8 h-8 object-contain" />
              ) : (
                <Gift className="h-6 w-6 text-[#10b981]" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <Badge className="mr-2 bg-[#10b981] hover:bg-[#10b981]/90">Benefício Membro</Badge>
                <h3 className="font-semibold">{benefitTitle}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{benefitDescription}</p>
              <Button 
                size="sm" 
                className="mt-2 bg-[#10b981] hover:bg-[#10b981]/90"
              >
                <Gift className="mr-2 h-4 w-4" />
                Acessar benefício
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium border-b pb-2">Benefício para Membros</h2>
      
      <FormField
        control={form.control}
        name="has_member_benefit"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <FormLabel>Esta ferramenta oferece benefício exclusivo</FormLabel>
              <FormDescription>
                Ative para adicionar vantagens exclusivas para membros do VIVER DE IA Club
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      {hasBenefit && (
        <div className="space-y-4 pl-4 border-l-2 border-[#10b981]/30">
          <FormField
            control={form.control}
            name="benefit_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título do Benefício*</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 15% de desconto, 1 mês grátis" {...field} />
                </FormControl>
                <FormDescription>
                  Um título curto e direto da vantagem oferecida
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="benefit_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição do Benefício*</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva detalhadamente o benefício oferecido aos membros..." 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Detalhe como funciona o benefício, validade, eventuais restrições
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="benefit_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link de Afiliado/Benefício*</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.exemplo.com/oferta-especial" {...field} />
                </FormControl>
                <FormDescription>
                  URL para a página com a oferta exclusiva
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="benefit_badge_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Badge do Benefício (opcional)</FormLabel>
                <FormControl>
                  <FileUpload
                    bucketName="tool_badges"
                    onUploadComplete={(url) => form.setValue('benefit_badge_url', url)}
                    accept="image/*"
                    maxSize={1}
                    buttonText="Upload do Badge"
                    fieldLabel="Selecione uma imagem para o badge"
                  />
                </FormControl>
                <FormDescription>
                  Imagem ou ícone que representa visualmente o benefício
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="block">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Badge className="mr-2 h-4 w-4" />
                      Visualizar
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Preview do benefício como será exibido aos membros
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {renderPreview()}
          </div>
        </div>
      )}
    </div>
  );
};
