
import React, { useEffect, useState } from "react";
import { useImplementationProfile } from "@/hooks/useImplementationProfile";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState = {
  name: "", email: "", phone: "", linkedin: "",
  country: "", state: "", city: "",
  company_name: "", company_website: "",
  current_position: "", company_sector: "",
  company_size: "", annual_revenue: "",
  primary_goal: "", ai_knowledge_level: 1,
  business_challenges: [],
  weekly_availability: "",
  networking_interests: [],
};

const businessChallengeOptions = [
  "Aumentar Receita",
  "Otimizar Operações",
  "Melhorar Decisão",
  "Reduzir Custos",
  "Inovar com IA"
];

const networkingOptions = [
  "Mentoria",
  "Networking",
  "Parcerias",
  "Compartilhar Experiências"
];

export default function ImplementationProfilePage() {
  const { profile, loading, saving, saveProfile } = useImplementationProfile();
  const [values, setValues] = useState(initialState);

  useEffect(() => {
    if (profile) setValues({ ...initialState, ...profile });
  }, [profile]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setValues((old) => ({ ...old, [name]: value }));
  };

  const handleMultiChange = (name: string, value: string) => {
    setValues((old) => ({
      ...old,
      [name]: old[name].includes(value)
        ? old[name].filter((v: string) => v !== value)
        : [...(old[name] || []), value]
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    saveProfile(values);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin mr-2" />Carregando...</div>
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-2">Perfil de Implementação</h1>
      <p className="text-muted-foreground mb-6">
        Preencha seu perfil para criarmos sua trilha personalizada. 
      </p>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="name" value={values.name || ""} onChange={handleChange} placeholder="Nome completo" label="Nome*" required />
          <Input name="email" value={values.email || ""} onChange={handleChange} placeholder="E-mail*" required />
          <Input name="phone" value={values.phone || ""} onChange={handleChange} placeholder="Telefone" />
          <Input name="linkedin" value={values.linkedin || ""} onChange={handleChange} placeholder="LinkedIn" />
          <Input name="country" value={values.country || ""} onChange={handleChange} placeholder="País" required />
          <Input name="state" value={values.state || ""} onChange={handleChange} placeholder="Estado" />
          <Input name="city" value={values.city || ""} onChange={handleChange} placeholder="Cidade" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="company_name" value={values.company_name || ""} onChange={handleChange} placeholder="Empresa" />
          <Input name="company_website" value={values.company_website || ""} onChange={handleChange} placeholder="Site da Empresa" />
          <Input name="current_position" value={values.current_position || ""} onChange={handleChange} placeholder="Cargo Atual" />
          <Input name="company_sector" value={values.company_sector || ""} onChange={handleChange} placeholder="Setor" />
          <Input name="company_size" value={values.company_size || ""} onChange={handleChange} placeholder="Porte" />
          <Input name="annual_revenue" value={values.annual_revenue || ""} onChange={handleChange} placeholder="Faturamento Anual" />
        </div>
        <div>
          <label className="font-semibold">Desafios do momento:</label>
          <div className="flex flex-wrap gap-3 mt-2">
            {businessChallengeOptions.map(opt => (
              <Button
                key={opt}
                type="button"
                variant={values.business_challenges?.includes(opt) ? "default" : "outline"}
                onClick={() => handleMultiChange("business_challenges", opt)}
                className={values.business_challenges?.includes(opt) ? "bg-viverblue text-white" : ""}
              >
                {opt}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="font-semibold">Principal objetivo com IA</label>
          <Textarea name="primary_goal" value={values.primary_goal || ""} onChange={handleChange} placeholder="Descreva seu objetivo principal" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Nível de conhecimento em IA (1 a 5)</label>
            <Input name="ai_knowledge_level" type="number" min={1} max={5} value={values.ai_knowledge_level || 1} onChange={handleChange} />
          </div>
          <Input name="weekly_availability" value={values.weekly_availability || ""} onChange={handleChange} placeholder="Horas por semana disponível" />
        </div>
        <div>
          <label className="font-semibold">Interesses de networking</label>
          <div className="flex flex-wrap gap-3 mt-2">
            {networkingOptions.map(opt => (
              <Button
                key={opt}
                type="button"
                variant={values.networking_interests?.includes(opt) ? "default" : "outline"}
                onClick={() => handleMultiChange("networking_interests", opt)}
                className={values.networking_interests?.includes(opt) ? "bg-viverblue" : ""}
              >{opt}</Button>
            ))}
          </div>
        </div>
        <Button type="submit" className="w-full bg-viverblue hover:bg-viverblue/90" disabled={saving}>
          {saving ? <Loader2 className="animate-spin mr-2" /> : "Salvar"}
          Salvar Perfil
        </Button>
      </form>
    </div>
  );
}
