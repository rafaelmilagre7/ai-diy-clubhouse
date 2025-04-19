
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BenefitType } from "@/types/toolTypes";
import { BenefitBadge } from "@/components/tools/BenefitBadge";
import { UseFormReturn } from "react-hook-form";
import { ToolFormValues } from "../types/toolFormTypes";

interface MemberBenefitProps {
  className?: string;
  form: UseFormReturn<ToolFormValues>;
}

export const MemberBenefit = ({ className, form }: MemberBenefitProps) => {
  const hasBenefit = form.watch("has_member_benefit");

  const handleToggleChange = (checked: boolean) => {
    form.setValue("has_member_benefit", checked);
    // Marcar que houve mudança
    form.setValue("formModified", true, { shouldDirty: true });
  };

  const handleFieldChange = (field: string, value: any) => {
    form.setValue(field as any, value);
    // Marcar que houve mudança
    form.setValue("formModified", true, { shouldDirty: true });
  };

  return (
    <div className={`space-y-4 border rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-medium">Benefício para Membros</h3>
      
      <FormField
        control={form.control}
        name="has_member_benefit"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between">
            <div>
              <FormLabel>Oferecer benefício exclusivo</FormLabel>
              <FormDescription>
                Ative para configurar um benefício especial para membros
              </FormDescription>
            </div>
            <FormControl>
              <Switch 
                checked={field.value} 
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  handleToggleChange(checked);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {hasBenefit && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="benefit_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Benefício</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleFieldChange("benefit_type", value);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de benefício" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="discount">
                      <div className="flex items-center gap-2">
                        <BenefitBadge type="discount" />
                      </div>
                    </SelectItem>
                    <SelectItem value="exclusive">
                      <div className="flex items-center gap-2">
                        <BenefitBadge type="exclusive" />
                      </div>
                    </SelectItem>
                    <SelectItem value="free">
                      <div className="flex items-center gap-2">
                        <BenefitBadge type="free" />
                      </div>
                    </SelectItem>
                    <SelectItem value="trial">
                      <div className="flex items-center gap-2">
                        <BenefitBadge type="trial" />
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-2">
                        <BenefitBadge type="other" />
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="benefit_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título do Benefício</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: 15% de desconto" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange("benefit_title", e.target.value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="benefit_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição do Benefício</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva detalhadamente o benefício para os membros."
                    className="resize-none"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange("benefit_description", e.target.value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="benefit_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link do Benefício</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://seusite.com/beneficio" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      handleFieldChange("benefit_link", e.target.value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};
