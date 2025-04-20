
// Formulário de Dados Profissionais da Empresa

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingData } from "@/types/onboarding";
import MilagrinhoAssistant from "./MilagrinhoAssistant";

// Principais setores incluindo IA
const sectorOptions = [
  "Agroindústria",
  "Alimentos e Bebidas",
  "Automotivo",
  "Bancos e Finanças",
  "Comércio e Varejo",
  "Construção Civil",
  "Educação",
  "Energia",
  "Entretenimento",
  "Imobiliário",
  "Indústria 4.0",
  "Logística e Transportes",
  "Saúde",
  "Seguros",
  "Serviços de Inteligência Artificial",
  "Tecnologia da Informação",
  "Turismo e Hotelaria",
  "Inteligência Artificial",
  "Outro"
];

// Tamanhos de empresa
const sizeOptions = [
  "Autônomo/MEI",
  "1-10 colaboradores",
  "11-50 colaboradores",
  "51-200 colaboradores",
  "201-500 colaboradores",
  "501-1000 colaboradores",
  "Mais de 1000"
];

// Faturamento anual (valores típicos no Brasil)
const revenueOptions = [
  "Até R$ 100 mil",
  "R$ 100 mil - R$ 500 mil",
  "R$ 500 mil - R$ 2 milhões",
  "R$ 2 milhões - R$ 10 milhões",
  "R$ 10 milhões - R$ 50 milhões",
  "Acima de R$ 50 milhões",
  "Prefiro não informar"
];

interface BusinessGoalsStepProps {
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  onComplete: () => void;
  initialData?: any;
  // Receber os dados pessoais para personalização
  personalInfo?: OnboardingData["personal_info"];
}

export const BusinessGoalsStep = ({
  onSubmit,
  isSubmitting,
  initialData,
  personalInfo
}: BusinessGoalsStepProps) => {
  // Carregar valores prévios se existirem
  const [companyName, setCompanyName] = useState(initialData?.company_name || "");
  const [companySize, setCompanySize] = useState(initialData?.company_size || "");
  const [companySector, setCompanySector] = useState(initialData?.company_sector || "");
  const [companyWebsite, setCompanyWebsite] = useState(initialData?.company_website || "");
  const [currentPosition, setCurrentPosition] = useState(initialData?.current_position || "");
  const [annualRevenue, setAnnualRevenue] = useState(initialData?.annual_revenue || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Estruturar os dados corretamente conforme o tipo OnboardingData
    const professionalData: Partial<OnboardingData> = {
      professional_info: {
        company_name: companyName,
        company_size: companySize,
        company_sector: companySector,
        company_website: companyWebsite,
        current_position: currentPosition,
        annual_revenue: annualRevenue
      }
    };

    // Enviar para o hook de atualização
    onSubmit("goals", professionalData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      <MilagrinhoAssistant userName={personalInfo?.name} />

      <div className="space-y-5">
        <div>
          <Label htmlFor="company_name" className="text-white">Nome da empresa</Label>
          <Input
            id="company_name"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            required
            placeholder="Ex: Milagre Digital"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="company_size" className="text-white">Tamanho da empresa</Label>
          <Select value={companySize} onValueChange={setCompanySize} required>
            <SelectTrigger id="company_size">
              <SelectValue placeholder="Selecione o porte" />
            </SelectTrigger>
            <SelectContent>
              {sizeOptions.map(size => (
                <SelectItem key={size} value={size}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="company_sector" className="text-white">Setor de atuação</Label>
          <Select value={companySector} onValueChange={setCompanySector} required>
            <SelectTrigger id="company_sector">
              <SelectValue placeholder="Selecione o setor" />
            </SelectTrigger>
            <SelectContent>
              {sectorOptions.map(sector => (
                <SelectItem key={sector} value={sector}>{sector}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="company_website" className="text-white">Website da empresa</Label>
          <Input
            id="company_website"
            type="url"
            value={companyWebsite}
            onChange={e => setCompanyWebsite(e.target.value)}
            placeholder="Ex: https://minhaempresa.com.br"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="current_position" className="text-white">Seu cargo atual</Label>
          <Input
            id="current_position"
            value={currentPosition}
            onChange={e => setCurrentPosition(e.target.value)}
            required
            placeholder="Ex: Diretor, CEO, Marketing..."
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="annual_revenue" className="text-white">Faturamento anual</Label>
          <Select value={annualRevenue} onValueChange={setAnnualRevenue} required>
            <SelectTrigger id="annual_revenue">
              <SelectValue placeholder="Selecione o faturamento" />
            </SelectTrigger>
            <SelectContent>
              {revenueOptions.map(revenue => (
                <SelectItem key={revenue} value={revenue}>{revenue}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button type="submit" className="w-full bg-[#0ABAB5] hover:bg-[#099388] font-semibold" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Avançar para a próxima etapa"}
      </Button>
    </form>
  );
};
