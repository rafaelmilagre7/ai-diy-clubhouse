
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PersonalInfo } from '@/types/onboarding';
import { Loader2 } from 'lucide-react';

export interface PersonalInfoFormProps {
  formData: PersonalInfo;
  errors: Record<string, string>;
  isSubmitting: boolean;
  onChange: (field: keyof PersonalInfo, value: string) => void;
  onSubmit: () => void;
  isSaving?: boolean;
  lastSaveTime?: number;
  readOnly?: boolean;
}

export const PersonalInfoStep: React.FC<PersonalInfoFormProps> = ({
  formData,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
  isSaving = false,
  lastSaveTime = 0,
  readOnly = false
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            placeholder="Seu nome completo"
            value={formData.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            disabled={isSubmitting || readOnly}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            disabled={isSubmitting || readOnly}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            placeholder="(99) 99999-9999"
            value={formData.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            disabled={isSubmitting || readOnly}
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            placeholder="https://linkedin.com/in/seuusuario"
            value={formData.linkedin || ''}
            onChange={(e) => onChange('linkedin', e.target.value)}
            disabled={isSubmitting || readOnly}
            className={errors.linkedin ? 'border-red-500' : ''}
          />
          {errors.linkedin && <p className="text-red-500 text-sm">{errors.linkedin}</p>}
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-end pt-4">
          <Button 
            type="button" 
            onClick={onSubmit} 
            disabled={isSubmitting || isSaving}
            className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          >
            {isSubmitting || isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Continuar'
            )}
          </Button>
        </div>
      )}

      {lastSaveTime > 0 && (
        <p className="text-sm text-gray-500 text-right">
          Última atualização: {new Date(lastSaveTime).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};
