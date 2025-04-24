
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingData, OnboardingFormData } from '@/types/onboarding';
import { ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PersonalFormProps {
  data: OnboardingData | null;
  onSubmit: (data: Partial<OnboardingFormData>) => Promise<boolean>;
  isSaving: boolean;
}

export const PersonalForm: React.FC<PersonalFormProps> = ({ data, onSubmit, isSaving }) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Partial<OnboardingFormData>>({
    defaultValues: {
      name: data?.name || '',
      email: data?.email || '',
      phone: data?.phone || '',
      ddi: data?.ddi || '+55',
      linkedin: data?.linkedin || '',
      instagram: data?.instagram || '',
      country: data?.country || 'Brasil',
      state: data?.state || '',
      city: data?.city || '',
      timezone: data?.timezone || 'America/Sao_Paulo',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              {...register('name', { required: 'Nome é obrigatório' })}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email', { 
                required: 'E-mail é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'E-mail inválido'
                }
              })}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="ddi">DDI</Label>
            <Select 
              defaultValue={data?.ddi || '+55'} 
              onValueChange={(value) => setValue('ddi', value)}
            >
              <SelectTrigger id="ddi">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+55">Brasil (+55)</SelectItem>
                <SelectItem value="+351">Portugal (+351)</SelectItem>
                <SelectItem value="+1">EUA/Canadá (+1)</SelectItem>
                <SelectItem value="+44">Reino Unido (+44)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="phone">Celular <span className="text-red-500">*</span></Label>
            <Input
              id="phone"
              placeholder="(99) 99999-9999"
              {...register('phone', { required: 'Celular é obrigatório' })}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              placeholder="linkedin.com/in/seu-perfil"
              {...register('linkedin')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              placeholder="@seu_instagram"
              {...register('instagram')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              placeholder="País"
              {...register('country')}
              defaultValue="Brasil"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              placeholder="Estado"
              {...register('state')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              placeholder="Cidade"
              {...register('city')}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSaving}
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
        >
          {isSaving ? (
            "Salvando..."
          ) : (
            <>
              Próximo <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
