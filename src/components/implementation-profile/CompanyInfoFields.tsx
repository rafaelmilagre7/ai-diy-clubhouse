
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Link as LinkIcon } from "lucide-react";

const positionOptions = [
  "CEO / Diretor(a) Executivo(a)",
  "CTO / Diretor(a) de Tecnologia",
  "COO / Diretor(a) de Operações",
  "CFO / Diretor(a) Financeiro",
  "CMO / Diretor(a) de Marketing",
  "CHRO / Diretor(a) de RH",
  "CIO / Diretor(a) de Informação",
  "CDO / Diretor(a) de Dados",
  "Gerente de Projeto",
  "Gerente de Produto",
  "Gerente de TI",
  "Gestor(a) de Operações",
  "Analista de Dados",
  "Cientista de Dados",
  "Desenvolvedor(a)",
  "Engenheiro(a) de Software",
  "Especialista em IA",
  "Consultor(a)",
  "Empreendedor(a)",
  "Acadêmico(a) / Professor(a)",
  "Estudante",
  "Outro"
];

const sectorOptions = [
  "Agronegócio",
  "Comércio",
  "Indústria",
  "Saúde",
  "Educação",
  "Serviços",
  "Startups",
  "Inteligência Artificial",
  "Tecnologia",
  "Consultoria",
  "Financeiro",
  "Outro"
];

// Novo: opções de faturamento anual "mais parecidas com o mercado"
const revenueOptions = [
  "Até R$ 81 mil",
  "R$ 81 mil a R$ 360 mil",
  "R$ 360 mil a R$ 1 milhão",
  "R$ 1 milhão a R$ 4,8 milhões",
  "R$ 4,8 milhões a R$ 16 milhões",
  "R$ 16 milhões a R$ 40 milhões",
  "R$ 40 milhões a R$ 90 milhões",
  "R$ 90 milhões a R$ 300 milhões",
  "Acima de R$ 300 milhões",
  "Entre R$ 300 milhões e R$ 1 bilhão",
  "Acima de R$ 1 bilhão",
  "Prefiro não informar"
];

const companySizeOptions = [
  "1-10 colaboradores",
  "11-50 colaboradores",
  "51-200 colaboradores",
  "201-500 colaboradores",
  "501-1000 colaboradores",
  "1001-5000 colaboradores",
  "5001-10000 colaboradores",
  "10000+ colaboradores"
];

type Props = {
  values: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setValues: (fn: (old: any) => any) => void;
};

export const CompanyInfoFields: React.FC<Props> = ({
  values,
  onChange,
  setValues
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="company_name">Empresa</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <Building size={16} />
        </span>
        <Input
          id="company_name"
          name="company_name"
          value={values.company_name || ""}
          onChange={onChange}
          placeholder="Nome da empresa"
          className="pl-10"
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="company_website">Site da Empresa</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <LinkIcon size={16} />
        </span>
        <Input
          id="company_website"
          name="company_website"
          value={values.company_website || ""}
          onChange={onChange}
          placeholder="https://empresa.com"
          className="pl-10"
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="current_position">Cargo Atual</Label>
      <Select
        value={values.current_position || ""}
        onValueChange={val => setValues((old: any) => ({ ...old, current_position: val }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione seu cargo" />
        </SelectTrigger>
        <SelectContent>
          {positionOptions.map(position => (
            <SelectItem key={position} value={position}>{position}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="company_sector">Setor</Label>
      <Select
        value={values.company_sector || ""}
        onValueChange={val => setValues((old: any) => ({ ...old, company_sector: val }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Setor" />
        </SelectTrigger>
        <SelectContent>
          {sectorOptions.map(opt => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="company_size">Nº de Colaboradores</Label>
      <Select
        value={values.company_size || ""}
        onValueChange={val => setValues((old: any) => ({ ...old, company_size: val }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Colaboradores" />
        </SelectTrigger>
        <SelectContent>
          {companySizeOptions.map(opt => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="annual_revenue">Faturamento Anual</Label>
      <Select
        value={values.annual_revenue || ""}
        onValueChange={val => setValues((old: any) => ({ ...old, annual_revenue: val }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Faturamento" />
        </SelectTrigger>
        <SelectContent>
          {revenueOptions.map(opt => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);
