
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Opções de setor, tamanho e faturamento
export const sectorOptions = [
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

export const sizeOptions = [
  "Autônomo/MEI",
  "1-10 colaboradores",
  "11-50 colaboradores",
  "51-200 colaboradores",
  "201-500 colaboradores",
  "501-1000 colaboradores",
  "Mais de 1000",
];

export const revenueOptions = [
  "Até R$ 100 mil",
  "R$ 100 mil - R$ 500 mil",
  "R$ 500 mil - R$ 2 milhões",
  "R$ 2 milhões - R$ 10 milhões",
  "R$ 10 milhões - R$ 50 milhões",
  "Acima de R$ 50 milhões",
  "Prefiro não informar",
];

interface CompanyInputsProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  companySize: string;
  setCompanySize: (value: string) => void;
  companySector: string;
  setCompanySector: (value: string) => void;
  companyWebsite: string;
  setCompanyWebsite: (value: string) => void;
  currentPosition: string;
  setCurrentPosition: (value: string) => void;
  annualRevenue: string;
  setAnnualRevenue: (value: string) => void;
}

export const CompanyInputs: React.FC<CompanyInputsProps> = ({
  companyName,
  setCompanyName,
  companySize,
  setCompanySize,
  companySector,
  setCompanySector,
  companyWebsite,
  setCompanyWebsite,
  currentPosition,
  setCurrentPosition,
  annualRevenue,
  setAnnualRevenue,
}) => {
  return (
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
  );
};
