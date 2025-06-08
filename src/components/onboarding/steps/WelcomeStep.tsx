
import React from 'react';
import { OnboardingStepProps } from '@/types/onboarding';
import { FormField } from '../FormField';
import { NavigationButtons } from '../NavigationButtons';
import { AIMessage } from '../AIMessage';
import { BRAZILIAN_STATES } from '@/constants/onboarding';
import { validateWelcomeStep } from '@/utils/onboardingValidation';

export const WelcomeStep: React.FC<OnboardingStepProps> = ({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isLoading
}) => {
  const validation = validateWelcomeStep(data);
  const isFormValid = validation.isValid;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-3">
          Bem-vindo ao Viver de IA! 🎉
        </h1>
        <p className="text-lg text-muted-foreground">
          Vamos começar conhecendo você melhor para personalizar sua experiência
        </p>
      </div>

      {/* AI Message */}
      <AIMessage step={1} data={data} />

      {/* Progress indicator */}
      {validation.score > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Completude do perfil</span>
            <span>{validation.score}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ width: `${validation.score}%` }}
            />
          </div>
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Informações Pessoais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nome completo"
            type="text"
            value={data.fullName || ''}
            onChange={(value) => onDataChange({ fullName: value })}
            placeholder="Seu nome completo"
            required
            error={validation.errors.fullName}
          />
          <FormField
            label="Como prefere ser chamado(a)?"
            type="text"
            value={data.preferredName || ''}
            onChange={(value) => onDataChange({ preferredName: value })}
            placeholder="Nome de preferência"
            required
            error={validation.errors.preferredName}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="E-mail"
            type="email"
            value={data.email || ''}
            onChange={(value) => onDataChange({ email: value })}
            placeholder="seu@email.com"
            required
            error={validation.errors.email}
          />
          <FormField
            label="Telefone/WhatsApp"
            type="tel"
            value={data.phone || ''}
            onChange={(value) => onDataChange({ phone: value })}
            placeholder="(11) 99999-9999"
          />
        </div>

        {/* Redes Sociais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Instagram (opcional)"
            type="text"
            value={data.instagram || ''}
            onChange={(value) => onDataChange({ instagram: value })}
            placeholder="@seu_instagram"
          />
          <FormField
            label="LinkedIn (opcional)"
            type="text"
            value={data.linkedin || ''}
            onChange={(value) => onDataChange({ linkedin: value })}
            placeholder="linkedin.com/in/seu-perfil"
          />
        </div>

        {/* Localização */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Estado"
            type="select"
            value={data.state || ''}
            onChange={(value) => onDataChange({ state: value })}
            options={BRAZILIAN_STATES}
            placeholder="Selecione seu estado"
            required
            error={validation.errors.state}
          />
          <FormField
            label="Cidade"
            type="text"
            value={data.city || ''}
            onChange={(value) => onDataChange({ city: value })}
            placeholder="Sua cidade"
            required
            error={validation.errors.city}
          />
        </div>

        {/* Data de Nascimento */}
        <FormField
          label="Data de nascimento"
          type="date"
          value={data.birthDate || ''}
          onChange={(value) => onDataChange({ birthDate: value })}
        />

        {/* Curiosidade */}
        <FormField
          label="Conte uma curiosidade sobre você"
          type="textarea"
          value={data.curiosity || ''}
          onChange={(value) => onDataChange({ curiosity: value })}
          placeholder="Algo interessante que você gostaria de compartilhar..."
          description="Isso nos ajuda a conhecer melhor sua personalidade!"
        />
      </div>

      <NavigationButtons
        onNext={onNext}
        onPrevious={onPrevious}
        isNextDisabled={!isFormValid}
        isLoading={isLoading}
        nextLabel="Continuar"
        showPrevious={false}
      />
    </div>
  );
};
