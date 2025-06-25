
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedFieldIndicator } from '../components/EnhancedFieldIndicator';
import { User, Mail, Phone, Lock } from 'lucide-react';
import { OnboardingData } from '../types/onboardingTypes';

interface OnboardingStep1Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  memberType: 'club' | 'formacao';
  validationErrors: Array<{ field: string; message: string }>;
  getFieldError: (field: string) => string | undefined;
  disabled?: boolean;
  readOnly?: boolean;
  isLoading?: boolean;
  onNext?: () => Promise<void>;
  onPrev?: () => Promise<void>;
}

const OnboardingStep1: React.FC<OnboardingStep1Props> = ({
  data,
  onUpdateData,
  memberType,
  validationErrors,
  getFieldError,
  disabled = false,
  readOnly = false,
  isLoading = false
}) => {
  const handleInputChange = (field: string, value: string) => {
    if (disabled || readOnly) return;
    onUpdateData({ [field]: value });
  };

  const isFieldReadOnly = (field: string) => {
    switch (field) {
      case 'email':
        return data.isEmailFromInvite || false;
      case 'name':
        return data.isNameFromInvite || false;
      case 'phone':
        return data.isPhoneFromInvite || false;
      default:
        return readOnly;
    }
  };

  const getFieldIcon = (field: string) => {
    switch (field) {
      case 'email':
        return Mail;
      case 'name':
        return User;
      case 'phone':
        return Phone;
      default:
        return User;
    }
  };

  const renderField = (
    field: string,
    label: string,
    placeholder: string,
    type: 'text' | 'email' | 'tel' = 'text',
    required: boolean = true
  ) => {
    const isReadOnly = isFieldReadOnly(field);
    const fieldError = getFieldError(field);
    const hasValue = data[field as keyof OnboardingData] as string;
    const Icon = getFieldIcon(field);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={field} className="text-white font-medium flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {label}
            {required && <span className="text-red-400">*</span>}
          </Label>
          {isReadOnly && (
            <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-300 border-amber-500/30">
              <Lock className="w-3 h-3 mr-1" />
              Dados do Convite
            </Badge>
          )}
        </div>
        
        <div className="relative">
          <Input
            id={field}
            type={type}
            placeholder={placeholder}
            value={hasValue || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            disabled={disabled || isLoading}
            readOnly={isReadOnly}
            className={`
              bg-[#0F111A] border-gray-700 text-white placeholder:text-neutral-400 
              focus:border-viverblue focus:ring-viverblue
              ${isReadOnly ? 'bg-gray-800/50 cursor-not-allowed opacity-75' : ''}
              ${fieldError ? 'border-red-500 focus:border-red-500' : ''}
            `}
          />
          {isReadOnly && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
        
        <EnhancedFieldIndicator
          isValid={!fieldError && hasValue?.length > 0}
          isRequired={required}
          message={fieldError}
          showSuccess={!isReadOnly && hasValue?.length > 0}
        />
        
        {isReadOnly && (
          <p className="text-xs text-amber-300/80 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Este campo foi preenchido automaticamente pelo convite
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1A1E2E] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5 text-viverblue" />
            Informações Pessoais
          </CardTitle>
          <p className="text-neutral-300 text-sm">
            Vamos começar com suas informações básicas
          </p>
          {(data.isEmailFromInvite || data.isNameFromInvite || data.isPhoneFromInvite) && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <Lock className="w-4 h-4 text-amber-300" />
              <p className="text-sm text-amber-300">
                Alguns campos foram preenchidos automaticamente pelo seu convite
              </p>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderField('name', 'Nome Completo', 'Digite seu nome completo', 'text', true)}
          {renderField('email', 'E-mail', 'Digite seu e-mail', 'email', true)}
          {renderField('phone', 'Telefone/WhatsApp', 'Digite seu telefone', 'tel', false)}
          
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant={memberType === 'formacao' ? 'default' : 'secondary'}
                className={
                  memberType === 'formacao' 
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                    : 'bg-viverblue/20 text-viverblue border-viverblue/30'
                }
              >
                {memberType === 'formacao' ? 'Formação' : 'Membro Club'}
              </Badge>
            </div>
            <p className="text-xs text-neutral-400">
              Seu tipo de acesso foi definido pelo convite recebido
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingStep1;
