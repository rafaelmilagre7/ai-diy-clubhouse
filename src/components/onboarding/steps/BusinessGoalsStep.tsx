
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { OnboardingData } from "@/types/onboarding";

// Opções de setor, tamanho e faturamento
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
  "Outro",
];
const sizeOptions = [
  "Autônomo/MEI",
  "1-10 colaboradores",
  "11-50 colaboradores",
  "51-200 colaboradores",
  "201-500 colaboradores",
  "501-1000 colaboradores",
  "Mais de 1000",
];
const revenueOptions = [
  "Até R$ 100 mil",
  "R$ 100 mil - R$ 500 mil",
  "R$ 500 mil - R$ 2 milhões",
  "R$ 2 milhões - R$ 10 milhões",
  "R$ 10 milhões - R$ 50 milhões",
  "Acima de R$ 50 milhões",
  "Prefiro não informar",
];

interface BusinessGoalsStepProps {
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  onComplete: () => void;
  initialData?: any;
  personalInfo?: OnboardingData["personal_info"];
  onPrevious?: () => void;
}

export const BusinessGoalsStep = ({
  onSubmit,
  isSubmitting,
  initialData,
  personalInfo,
  onPrevious,
}: BusinessGoalsStepProps) => {
  // Estados para cada campo
  const [companyName, setCompanyName] = useState(initialData?.company_name || "");
  const [companySize, setCompanySize] = useState(initialData?.company_size || "");
  const [companySector, setCompanySector] = useState(initialData?.company_sector || "");
  const [companyWebsite, setCompanyWebsite] = useState(initialData?.company_website || "");
  const [currentPosition, setCurrentPosition] = useState(initialData?.current_position || "");
  const [annualRevenue, setAnnualRevenue] = useState(initialData?.annual_revenue || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const professionalData: Partial<OnboardingData> = {
      professional_info: {
        company_name: companyName,
        company_size: companySize,
        company_sector: companySector,
        company_website: companyWebsite,
        current_position: currentPosition,
        annual_revenue: annualRevenue,
      },
    };
    onSubmit("goals", professionalData);
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-170px)] py-8 sm:py-16 bg-[#f6f6f7]">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* TOP: Botão voltar igual 1ª etapa, alinhado topo card principal */}
        <div className="self-start mb-3">
          <Button
            variant="ghost"
            onClick={onPrevious}
            className="flex items-center gap-2 text-[#0ABAB5] px-1 py-1 hover:bg-[#eafaf9] rounded-lg"
            style={{ fontWeight: 500 }}
            type="button"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Voltar
          </Button>
        </div>

        {/* Mensagem do Milagrinho igual ao print, só um card (não banner nem block extra) */}
        <div className="w-full mb-6">
          <div className="flex items-center gap-3 rounded-xl bg-white border border-[#0ABAB5]/20 px-5 py-4 shadow-none">
            <div className="flex items-center justify-center bg-[#eafaf9] rounded-full h-11 w-11">
              {/* Ícone estilo print */}
              <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="14" fill="#0ABAB5"/>
                <text x="14" y="19" textAnchor="middle" fill="white" fontSize="17" fontFamily="Arial" fontWeight="bold">🤖</text>
              </svg>
            </div>
            <div>
              <span className="block text-[#0ABAB5] font-semibold mb-0.5" style={{ fontSize: 16 }}>
                {personalInfo?.name ? `E aí ${personalInfo.name}!` : "Olá!"}
              </span>
              <span className="text-[#1A2228] text-base">
                Eu sou o Milagrinho, seu assistente de IA do VIVER DE IA Club. Vamos começar conhecendo um pouco sobre você.
                <br className="hidden sm:block" />
                Estas informações vão me ajudar a personalizar sua experiência, onde você vai encontrar uma comunidade incrível de pessoas transformando negócios com IA.
              </span>
            </div>
          </div>
        </div>

        {/* Card principal do formulário */}
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white rounded-2xl shadow-lg p-5 sm:p-8 border border-gray-100 flex flex-col gap-7"
          style={{ minWidth: 0 }}
        >
          {/* Título do bloco (ficou "Objetivos do Negócio" no print) */}
          <h2 className="text-xl font-semibold text-[#15192C] mb-3 ml-1">
            Objetivos do Negócio
          </h2>
          <div className="flex flex-col gap-5">
            <div>
              <Label htmlFor="company_name" className="text-[#222] font-medium mb-1 block">
                Nome da empresa<span className="text-[#0ABAB5] ml-1">*</span>
              </Label>
              <Input
                id="company_name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                placeholder="Ex: Milagre Digital"
                className="mt-1 bg-[#f6f8fa] border-[1.4px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
                maxLength={80}
                autoComplete="organization"
              />
            </div>
            <div>
              <Label htmlFor="company_size" className="text-[#222] font-medium mb-1 block">
                Tamanho da empresa<span className="text-[#0ABAB5] ml-1">*</span>
              </Label>
              <Select
                value={companySize}
                onValueChange={setCompanySize}
                required
              >
                <SelectTrigger
                  id="company_size"
                  className="mt-1 bg-[#f6f8fa] border-[1.4px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
                >
                  <SelectValue placeholder="Selecione o porte" />
                </SelectTrigger>
                <SelectContent className="bg-white text-[#121212] shadow-lg z-50">
                  {sizeOptions.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="company_sector" className="text-[#222] font-medium mb-1 block">
                Setor de atuação<span className="text-[#0ABAB5] ml-1">*</span>
              </Label>
              <Select
                value={companySector}
                onValueChange={setCompanySector}
                required
              >
                <SelectTrigger
                  id="company_sector"
                  className="mt-1 bg-[#f6f8fa] border-[1.4px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
                >
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent className="bg-white text-[#121212] shadow-lg z-50">
                  {sectorOptions.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="company_website" className="text-[#222] font-medium mb-1 block">
                Website da empresa
              </Label>
              <Input
                id="company_website"
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="Ex: https://minhaempresa.com.br"
                className="mt-1 bg-[#f6f8fa] border-[1.4px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
                maxLength={120}
                autoComplete="url"
              />
            </div>
            <div>
              <Label htmlFor="current_position" className="text-[#222] font-medium mb-1 block">
                Seu cargo atual<span className="text-[#0ABAB5] ml-1">*</span>
              </Label>
              <Input
                id="current_position"
                value={currentPosition}
                onChange={(e) => setCurrentPosition(e.target.value)}
                required
                placeholder="Ex: Diretor, CEO, Marketing..."
                className="mt-1 bg-[#f6f8fa] border-[1.4px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
                maxLength={48}
                autoComplete="organization-title"
              />
            </div>
            <div>
              <Label htmlFor="annual_revenue" className="text-[#222] font-medium mb-1 block">
                Faturamento anual<span className="text-[#0ABAB5] ml-1">*</span>
              </Label>
              <Select
                value={annualRevenue}
                onValueChange={setAnnualRevenue}
                required
              >
                <SelectTrigger
                  id="annual_revenue"
                  className="mt-1 bg-[#f6f8fa] border-[1.4px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
                >
                  <SelectValue placeholder="Selecione o faturamento" />
                </SelectTrigger>
                <SelectContent className="bg-white text-[#121212] shadow-lg z-50">
                  {revenueOptions.map((revenue) => (
                    <SelectItem key={revenue} value={revenue}>
                      {revenue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#0ABAB5] hover:bg-[#099388] font-semibold text-white transition-colors rounded-xl text-lg py-2 mt-2 shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Avançar para a próxima etapa"}
          </Button>
        </form>
      </div>
    </div>
  );
};
