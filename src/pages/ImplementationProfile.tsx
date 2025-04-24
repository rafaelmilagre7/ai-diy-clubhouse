
import React, { useEffect, useState } from "react";
import { useImplementationProfile } from "@/hooks/useImplementationProfile";
import { Loader2, Users, DollarSign, Brain, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth";
import { useIBGELocations } from "@/hooks/useIBGELocations";
import { toast } from "sonner";

import { BasicInfoFields } from "@/components/implementation-profile/BasicInfoFields";
import { CompanyInfoFields } from "@/components/implementation-profile/CompanyInfoFields";
import { NPSSelector } from "@/components/implementation-profile/NPSSelector";

const mainGoalOptions = [
  "Aumentar Receita",
  "Otimizar Operações",
  "Melhorar Decisão",
  "Reduzir Custos",
  "Inovar com IA"
];

const aiKnowledgeLevels = [
  "Básico",
  "Intermediário",
  "Avançado",
  "Expert"
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
    setValues((prev) => ({
      ...prev,
      name: authProfile?.name || "",
      email: authProfile?.email || "",
    }));
  }, [authProfile]);

  useEffect(() => {
    if (profile) {
      // Converter o nível de conhecimento de IA de número para string se necessário
      let aiKnowledgeLevel = "Básico";
      
      if (profile.ai_knowledge_level !== null && profile.ai_knowledge_level !== undefined) {
        // Verificar se é um número ou string
        const level = typeof profile.ai_knowledge_level === 'number' 
          ? profile.ai_knowledge_level 
          : parseInt(profile.ai_knowledge_level as string);
        
        switch (level) {
          case 1: aiKnowledgeLevel = "Básico"; break;
          case 2: aiKnowledgeLevel = "Intermediário"; break;
          case 3: aiKnowledgeLevel = "Avançado"; break;
          case 4: aiKnowledgeLevel = "Expert"; break;
          default: aiKnowledgeLevel = "Básico";
        }
      }
      
      setValues({ 
        ...initialState, 
        ...profile, 
        ai_knowledge_level: aiKnowledgeLevel,
        nps_score: profile.nps_score !== null ? String(profile.nps_score) : ""
      });
    }
  }, [profile]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setValues((old) => ({ ...old, [name]: value }));
  };

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
    console.log("Submetendo formulário com valores:", values);

    if (values.company_website && !/^https?:\/\/\S+\.\S+/.test(values.company_website)) {
      toast.error("Digite uma URL válida para o site da empresa (ex: https://minhaempresa.com)");
      return;
    }

    if (values.instagram && !/^https?:\/\/(www\.)?instagram\.com\/[\w\.]+/i.test(values.instagram)) {
      toast.error("Digite uma URL válida para o Instagram ou deixe em branco");
      return;
    }

    if (values.linkedin && !/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\d-]+/i.test(values.linkedin)) {
      toast.error("Digite uma URL válida para o LinkedIn ou deixe em branco");
      return;
    }

    if (
      values.nps_score !== "" &&
      (isNaN(Number(values.nps_score)) ||
        Number(values.nps_score) < 0 ||
        Number(values.nps_score) > 10)
    ) {
      toast.error("NPS deve ser um número entre 0 e 10");
      return;
    }

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
        <BasicInfoFields
          values={values}
          estados={estados}
          cidadesPorEstado={cidadesPorEstado}
          onChange={handleChange}
          onPhoneChange={handlePhoneChange}
          setValues={setValues}
          locLoading={locLoading}
        />
        <CompanyInfoFields
          values={values}
          onChange={handleChange}
          setValues={setValues}
        />
        <div>
          <label className="font-semibold block mb-2">Principal objetivo com IA</label>
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
        <div>
          <label className="font-semibold block mb-2">Nível de conhecimento em IA</label>
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
        <div>
          <label className="font-semibold block mb-2">
            De 0 a 10, qual a chance de você indicar o VIVER DE IA Club para um amigo?
          </label>
          <NPSSelector
            value={values.nps_score}
            onChange={n => setValues((old) => ({ ...old, nps_score: n }))}
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
