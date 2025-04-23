
import React, { useEffect, useState } from "react";
import { useImplementationProfile } from "@/hooks/useImplementationProfile";
import { Loader2, Flag, Linkedin, Instagram, Building, Link as LinkIcon, Users, DollarSign, Brain, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth";
import { useIBGELocations } from "@/hooks/useIBGELocations";
import { toast } from "sonner";

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
const companySizeOptions = [
  "1-10 colaboradores",
  "11-50 colaboradores",
  "51-200 colaboradores",
  "201-500 colaboradores",
  "501-1000 colaboradores",
  "1000+ colaboradores"
];
const revenueOptions = [
  "Até R$ 360 mil",
  "R$ 360 mil - R$ 4,8 milhões",
  "R$ 4,8 milhões - R$ 16 milhões",
  "R$ 16 milhões - R$ 300 milhões",
  "Acima de R$ 300 milhões"
];
const aiKnowledgeLevels = [
  "Básico",
  "Intermediário",
  "Avançado",
  "Expert"
];
const mainGoalOptions = [
  "Aumentar Receita",
  "Otimizar Operações",
  "Melhorar Decisão",
  "Reduzir Custos",
  "Inovar com IA"
];

const initialState = {
  name: "", email: "", phone: "", phone_country_code: "+55", instagram: "", linkedin: "",
  country: "Brasil", state: "", city: "",
  company_name: "", company_website: "",
  current_position: "", company_sector: "",
  company_size: "", annual_revenue: "",
  primary_goal: "",
  business_challenges: [],
  ai_knowledge_level: "Básico",
  networking_interests: [],
  nps_score: "",
};

export default function ImplementationProfilePage() {
  const { profile, loading, saving, saveProfile } = useImplementationProfile();
  const { profile: authProfile } = useAuth();
  const [values, setValues] = useState(initialState);
  const { estados, cidadesPorEstado, isLoading: locLoading } = useIBGELocations();

  useEffect(() => {
    // Preenche nome/email com dados do perfil do usuário
    setValues((prev) => ({
      ...prev,
      name: authProfile?.name || "",
      email: authProfile?.email || "",
    }));
  }, [authProfile]);

  useEffect(() => {
    if (profile) setValues({ ...initialState, ...profile });
  }, [profile]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setValues((old) => ({ ...old, [name]: value }));
  };

  // Máscara de telefone simples (brasileiro)
  const formatPhone = (value: string) => {
    let onlyNums = value.replace(/\D/g, "");
    if (onlyNums.length <= 2) return `(${onlyNums}`;
    if (onlyNums.length <= 7) return `(${onlyNums.slice(0, 2)}) ${onlyNums.slice(2)}`;
    if (onlyNums.length <= 11) return `(${onlyNums.slice(0, 2)}) ${onlyNums.slice(2, 7)}-${onlyNums.slice(7)}`;
    return `(${onlyNums.slice(0, 2)}) ${onlyNums.slice(2, 7)}-${onlyNums.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: any) => {
    const raw = e.target.value.replace(/\D/g, "");
    let formatted = formatPhone(raw);
    setValues((old) => ({ ...old, phone: formatted }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    // Validação simples do site
    if (values.company_website && !/^https?:\/\/\S+\.\S+/.test(values.company_website)) {
      toast.error("Digite uma URL válida para o site da empresa (ex: https://minhaempresa.com)");
      return;
    }

    // Validar Instagram (opcional)
    if (values.instagram && !/^https?:\/\/(www\.)?instagram\.com\/[\w\.]+/i.test(values.instagram)) {
      toast.error("Digite uma URL válida para o Instagram ou deixe em branco");
      return;
    }

    // Validar Linkedin (opcional)
    if (values.linkedin && !/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\d-]+/i.test(values.linkedin)) {
      toast.error("Digite uma URL válida para o LinkedIn ou deixe em branco");
      return;
    }

    // Ajuste NPS
    if (
      values.nps_score !== "" &&
      (isNaN(Number(values.nps_score)) ||
        Number(values.nps_score) < 0 ||
        Number(values.nps_score) > 10)
    ) {
      toast.error("NPS deve ser um número entre 0 e 10");
      return;
    }

    // Simplesmente salva (envia para o Supabase neste formato)
    saveProfile(values);
  };

  if (loading || locLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin mr-2" />
        <span>Carregando perfil de implementação...</span>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <h1 className="text-2xl font-bold mb-2">Perfil de Implementação</h1>
      <p className="text-muted-foreground mb-6">
        Preencha seu perfil para criarmos sua trilha personalizada.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
        {/* Dados pessoais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome*</Label>
            <Input
              id="name"
              name="name"
              value={values.name}
              disabled
              className="bg-gray-100"
              iconleft={<User />}
            />
          </div>
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail*</Label>
            <Input
              id="email"
              name="email"
              value={values.email}
              disabled
              className="bg-gray-100"
              iconleft={<Flag />}
            />
          </div>
          {/* Telefone */}
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="phone">Telefone</Label>
            <div className="flex gap-2 items-center">
              <Select
                value={values.phone_country_code}
                onValueChange={val =>
                  setValues((old) => ({ ...old, phone_country_code: val }))
                }
              >
                <SelectTrigger className="w-20 rounded-md">
                  <span className="flex items-center">
                    <span className="mr-2" role="img" aria-label="Brasil">🇧🇷</span>
                    <SelectValue />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+55">
                    <span className="mr-2" role="img" aria-label="Brasil">🇧🇷</span> +55 BR
                  </SelectItem>
                  <SelectItem value="+1">
                    <span className="mr-2" role="img" aria-label="USA">🇺🇸</span> +1 US
                  </SelectItem>
                  <SelectItem value="+351">
                    <span className="mr-2" role="img" aria-label="Portugal">🇵🇹</span> +351 PT
                  </SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="phone"
                name="phone"
                value={values.phone || ""}
                onChange={handlePhoneChange}
                placeholder="(99) 99999-9999"
                maxLength={15}
              />
            </div>
          </div>
          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              name="instagram"
              value={values.instagram || ""}
              onChange={handleChange}
              placeholder="https://instagram.com/seuusuario"
              iconleft={<Instagram />}
            />
          </div>
          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              name="linkedin"
              value={values.linkedin || ""}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/seuusuario"
              iconleft={<Linkedin />}
            />
          </div>
          {/* País */}
          <div className="space-y-2">
            <Label htmlFor="country">País*</Label>
            <Select
              value={values.country}
              onValueChange={val => setValues((old) => ({ ...old, country: val }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Brasil">Brasil</SelectItem>
                <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                <SelectItem value="Portugal">Portugal</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Select
              value={values.state}
              onValueChange={val => setValues((old) => ({ ...old, state: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {estados.map(e => (
                  <SelectItem key={e.code} value={e.name}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Cidade */}
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Select
              value={values.city}
              onValueChange={val => setValues((old) => ({ ...old, city: val }))}
              disabled={!values.state}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                {(cidadesPorEstado[estados.find(e => e.name === values.state)?.code || ""] || []).map(c => (
                  <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Profissional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Empresa */}
          <div className="space-y-2">
            <Label htmlFor="company_name">Empresa</Label>
            <Input
              id="company_name"
              name="company_name"
              value={values.company_name || ""}
              onChange={handleChange}
              placeholder="Nome da empresa"
              iconleft={<Building />}
            />
          </div>
          {/* Site da Empresa */}
          <div className="space-y-2">
            <Label htmlFor="company_website">Site da Empresa</Label>
            <Input
              id="company_website"
              name="company_website"
              value={values.company_website || ""}
              onChange={handleChange}
              placeholder="https://empresa.com"
              iconleft={<LinkIcon />}
            />
          </div>
          {/* Cargo/posição */}
          <div className="space-y-2">
            <Label htmlFor="current_position">Cargo Atual</Label>
            <Input
              id="current_position"
              name="current_position"
              value={values.current_position || ""}
              onChange={handleChange}
              placeholder="Cargo Atual"
              iconleft={<Users />}
            />
          </div>
          {/* Setor */}
          <div className="space-y-2">
            <Label htmlFor="company_sector">Setor</Label>
            <Select
              value={values.company_sector || ""}
              onValueChange={val => setValues((old) => ({ ...old, company_sector: val }))}
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
          {/* Colaboradores */}
          <div className="space-y-2">
            <Label htmlFor="company_size">Nº de Colaboradores</Label>
            <Select
              value={values.company_size || ""}
              onValueChange={val => setValues((old) => ({ ...old, company_size: val }))}
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
          {/* Faturamento anual */}
          <div className="space-y-2">
            <Label htmlFor="annual_revenue">Faturamento Anual</Label>
            <Select
              value={values.annual_revenue || ""}
              onValueChange={val => setValues((old) => ({ ...old, annual_revenue: val }))}
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
        {/* Objetivo principal IA */}
        <div>
          <Label className="font-semibold block mb-2">Principal objetivo com IA</Label>
          <div className="flex flex-wrap gap-3 mt-2">
            {mainGoalOptions.map(opt => (
              <Button
                key={opt}
                type="button"
                variant={values.primary_goal === opt ? "default" : "outline"}
                onClick={() => setValues((old) => ({ ...old, primary_goal: opt }))}
                className={values.primary_goal === opt ? "bg-viverblue text-white" : ""}
              >
                {opt}
              </Button>
            ))}
          </div>
        </div>
        {/* Nível de conhecimento em IA */}
        <div>
          <Label htmlFor="ai_knowledge_level" className="font-semibold block">
            Nível de conhecimento em IA
          </Label>
          <Select
            value={values.ai_knowledge_level || "Básico"}
            onValueChange={val => setValues((old) => ({ ...old, ai_knowledge_level: val }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {aiKnowledgeLevels.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* NPS */}
        <div>
          <Label htmlFor="nps_score">De 0 a 10, qual a chance de você indicar o VIVER DE IA Club para um amigo?</Label>
          <Input
            id="nps_score"
            name="nps_score"
            type="number"
            min={0}
            max={10}
            value={values.nps_score}
            onChange={handleChange}
            className="w-32"
          />
        </div>
        <Button type="submit" className="w-full bg-viverblue hover:bg-viverblue/90" disabled={saving}>
          {saving ? <Loader2 className="animate-spin mr-2" /> : null}
          Salvar Perfil
        </Button>
      </form>
    </div>
  );
}
