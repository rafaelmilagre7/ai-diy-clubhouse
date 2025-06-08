
import React from 'react';
import { OnboardingStepProps } from '@/types/onboarding';
import { FormField } from '../FormField';
import { NavigationButtons } from '../NavigationButtons';
import { 
  BUSINESS_SECTORS, 
  COMPANY_SIZES, 
  REVENUE_RANGES, 
  COMPANY_POSITIONS 
} from '@/constants/onboarding';

export const BusinessProfileStep: React.FC<OnboardingStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isLoading
}) => {
  const isFormValid = data.companyName && data.businessSector && data.companySize && data.position;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-3">
          Perfil Empresarial 🏢
        </h1>
        <p className="text-lg text-muted-foreground">
          Agora vamos entender melhor seu contexto profissional
        </p>
      </div>

      {/* AI Message Placeholder */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
            IA
          </div>
          <div className="flex-1">
            <p className="text-sm">
              Excelente! Agora preciso entender seu contexto empresarial para personalizar as soluções de IA 
              que serão mais relevantes para sua realidade de negócio.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Informações da Empresa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nome da empresa"
            type="text"
            value={data.companyName || ''}
            onChange={(value) => onDataChange({ companyName: value })}
            placeholder="Nome da sua empresa"
            required
          />
          <FormField
            label="Site da empresa (opcional)"
            type="text"
            value={data.companySite || ''}
            onChange={(value) => onDataChange({ companySite: value })}
            placeholder="www.suaempresa.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Setor de atuação"
            type="select"
            value={data.businessSector || ''}
            onChange={(value) => onDataChange({ businessSector: value })}
            options={BUSINESS_SECTORS}
            placeholder="Selecione o setor"
            required
          />
          <FormField
            label="Tamanho da empresa"
            type="select"
            value={data.companySize || ''}
            onChange={(value) => onDataChange({ companySize: value })}
            options={COMPANY_SIZES}
            placeholder="Número de funcionários"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Faturamento anual"
            type="select"
            value={data.annualRevenue || ''}
            onChange={(value) => onDataChange({ annualRevenue: value })}
            options={REVENUE_RANGES}
            placeholder="Faixa de faturamento"
          />
          <FormField
            label="Seu cargo/posição"
            type="select"
            value={data.position || ''}
            onChange={(value) => onDataChange({ position: value })}
            options={COMPANY_POSITIONS}
            placeholder="Sua posição na empresa"
            required
          />
        </div>
      </div>

      <NavigationButtons
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={!isFormValid}
        isLoading={isLoading}
        nextLabel="Continuar"
      />
    </div>
  );
};
