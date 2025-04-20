
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
  onPrevious?: () => void; // nova prop!
}

export const BusinessGoalsStep = ({
  onSubmit,
  isSubmitting,
  initialData,
  personalInfo,
  onPrevious, // nova prop
}: BusinessGoalsStepProps) => {
  // Pré-preenchimento dos dados
  const [companyName, setCompanyName] = useState(initialData?.company_name || "");
  const [companySize, setCompanySize] = useState(initialData?.company_size || "");
  const [companySector, setCompanySector] = useState(initialData?.company_sector || "");
  const [companyWebsite, setCompanyWebsite] = useState(initialData?.company_website || "");
  const [currentPosition, setCurrentPosition] = useState(initialData?.current_position || "");
  const [annualRevenue, setAnnualRevenue] = useState(initialData?.annual_revenue || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // A tipagem correta é professional_info
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
      <div className="w-full max-w-2xl p-0 sm:p-0 flex flex-col items-center">

        {/* TOPO: Botão voltar e mensagem assistente - idêntico ao print e primeira página */}
        <div className="w-full flex items-center justify-between mb-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onPrevious}
            className="flex items-center gap-2 text-[#0ABAB5] hover:bg-[#eafaf9] px-3 py-1 rounded-lg"
            style={{ fontWeight: 500 }}
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Voltar
          </Button>
          {/* Espaço para manter balanceado - pode colocar logo ou similar se quiser */}
          <div />
        </div>

        <div className="w-full mb-4">
          <div className="rounded-xl bg-white border border-[#0ABAB5]/15 p-5 flex items-center gap-3 shadow-sm">
            <span className="bg-[#eafaf9] rounded-full p-2">
              <svg width={26} height={26} viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="13" fill="#0ABAB5"/><text x="13" y="18" textAnchor="middle" fill="white" fontSize="16" fontFamily="Arial" fontWeight="bold">🤖</text></svg>
            </span>
            <div>
              <span className="block text-[#0ABAB5] font-semibold mb-1" style={{ fontSize: 16 }}>
                {personalInfo?.name ? `E aí ${personalInfo.name}!` : "Olá!"}
              </span>
              <span className="text-[#1a1a1a] text-base">Sou o Milagrinho, seu assistente de IA do VIVER DE IA Club.<br className="hidden sm:block"/>
              Vamos começar conhecendo um pouco sobre você.<br className="hidden sm:block"/>
              Essas informações vão me ajudar a personalizar sua experiência!</span>
            </div>
          </div>
        </div>

        {/* FORMULÁRIO PRINCIPAL */}
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white rounded-2xl shadow-lg p-5 sm:p-8 border border-gray-100 flex flex-col gap-6 animate-fade-in"
          style={{ minWidth: 0 }}
        >
          {/* Banner teal com mensagem secundária do print (não repetitiva) */}
          <div className="w-full rounded-lg bg-gradient-to-br from-[#0ABAB5] to-[#67e0d8] text-white text-base font-medium flex items-center px-5 py-4 mb-2 shadow-md">
            <span className="mr-3 text-2xl">🤖</span>
            Para te recomendar as melhores trilhas e soluções, me conta um pouco da empresa onde você trabalha!
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="company_name" className="text-[#222] font-medium">
                Nome da empresa
              </Label>
              <Input
                id="company_name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                placeholder="Ex: Milagre Digital"
                className="mt-2 bg-[#f6f8fa] border-[1.5px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
                maxLength={80}
                autoComplete="organization"
              />
            </div>
            <div>
              <Label htmlFor="company_size" className="text-[#222] font-medium">
                Tamanho da empresa
              </Label>
              <Select
                value={companySize}
                onValueChange={setCompanySize}
                required
              >
                <SelectTrigger
                  id="company_size"
                  className="mt-2 bg-[#f6f8fa] border-[1.5px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
                >
                  <SelectValue placeholder="Selecione o porte" />
                </SelectTrigger>
                <SelectContent className="bg-white text-[#1a1a1a] shadow-lg z-50">
                  {sizeOptions.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="company_sector" className="text-[#222] font-medium">
                Setor de atuação
              </Label>
              <Select
                value={companySector}
                onValueChange={setCompanySector}
                required
              >
                <SelectTrigger
                  id="company_sector"
                  className="mt-2 bg-[#f6f8fa] border-[1.5px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
                >
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent className="bg-white text-[#1a1a1a] shadow-lg z-50">
                  {sectorOptions.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="company_website" className="text-[#222] font-medium">
                Website da empresa
              </Label>
              <Input
                id="company_website"
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="Ex: https://minhaempresa.com.br"
                className="mt-2 bg-[#f6f8fa] border-[1.5px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
                maxLength={120}
                autoComplete="url"
              />
            </div>
            <div>
              <Label htmlFor="current_position" className="text-[#222] font-medium">
                Seu cargo atual
              </Label>
              <Input
                id="current_position"
                value={currentPosition}
                onChange={(e) => setCurrentPosition(e.target.value)}
                required
                placeholder="Ex: Diretor, CEO, Marketing..."
                className="mt-2 bg-[#f6f8fa] border-[1.5px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
                maxLength={48}
                autoComplete="organization-title"
              />
            </div>
            <div>
              <Label htmlFor="annual_revenue" className="text-[#222] font-medium">
                Faturamento anual
              </Label>
              <Select
                value={annualRevenue}
                onValueChange={setAnnualRevenue}
                required
              >
                <SelectTrigger
                  id="annual_revenue"
                  className="mt-2 bg-[#f6f8fa] border-[1.5px] border-[#eaeaea] focus:border-[#0ABAB5] text-[#232323] placeholder:text-gray-400"
                >
                  <SelectValue placeholder="Selecione o faturamento" />
                </SelectTrigger>
                <SelectContent className="bg-white text-[#1a1a1a] shadow-lg z-50">
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
