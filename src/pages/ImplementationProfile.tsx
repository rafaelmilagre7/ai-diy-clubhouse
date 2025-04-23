
import React, { useEffect, useState } from "react";
import { useImplementationProfile } from "@/hooks/useImplementationProfile";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const { profile, loading, saving, saveProfile, errorMessage } = useImplementationProfile();
  const [values, setValues] = useState(initialState);
  const [hasAttemptedRetry, setHasAttemptedRetry] = useState(false);

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
      [name]: old[name]?.includes(value)
        ? old[name].filter((v: string) => v !== value)
        : [...(old[name] || []), value]
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    saveProfile(values);
  };
  
  const handleRetry = () => {
    setHasAttemptedRetry(true);
    window.location.reload(); // Recarregar a página para tentar novamente
  };

  if (loading) {
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
      
      {errorMessage && !hasAttemptedRetry && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar perfil</AlertTitle>
          <AlertDescription className="mt-2">
            <p>{errorMessage}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome*</Label>
            <Input id="name" name="name" value={values.name || ""} onChange={handleChange} placeholder="Nome completo" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail*</Label>
            <Input id="email" name="email" value={values.email || ""} onChange={handleChange} placeholder="E-mail" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" name="phone" value={values.phone || ""} onChange={handleChange} placeholder="Telefone" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" name="linkedin" value={values.linkedin || ""} onChange={handleChange} placeholder="LinkedIn" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">País*</Label>
            <Input id="country" name="country" value={values.country || ""} onChange={handleChange} placeholder="País" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input id="state" name="state" value={values.state || ""} onChange={handleChange} placeholder="Estado" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" name="city" value={values.city || ""} onChange={handleChange} placeholder="Cidade" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Empresa</Label>
            <Input id="company_name" name="company_name" value={values.company_name || ""} onChange={handleChange} placeholder="Empresa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_website">Site da Empresa</Label>
            <Input id="company_website" name="company_website" value={values.company_website || ""} onChange={handleChange} placeholder="Site da Empresa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_position">Cargo Atual</Label>
            <Input id="current_position" name="current_position" value={values.current_position || ""} onChange={handleChange} placeholder="Cargo Atual" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_sector">Setor</Label>
            <Input id="company_sector" name="company_sector" value={values.company_sector || ""} onChange={handleChange} placeholder="Setor" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_size">Porte</Label>
            <Input id="company_size" name="company_size" value={values.company_size || ""} onChange={handleChange} placeholder="Porte" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="annual_revenue">Faturamento Anual</Label>
            <Input id="annual_revenue" name="annual_revenue" value={values.annual_revenue || ""} onChange={handleChange} placeholder="Faturamento Anual" />
          </div>
        </div>
        <div>
          <Label className="font-semibold block mb-2">Desafios do momento:</Label>
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
          <Label htmlFor="primary_goal" className="font-semibold block mb-2">Principal objetivo com IA</Label>
          <Textarea id="primary_goal" name="primary_goal" value={values.primary_goal || ""} onChange={handleChange} placeholder="Descreva seu objetivo principal" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ai_knowledge_level" className="font-semibold block">Nível de conhecimento em IA (1 a 5)</Label>
            <Input id="ai_knowledge_level" name="ai_knowledge_level" type="number" min={1} max={5} value={values.ai_knowledge_level || 1} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weekly_availability" className="font-semibold block">Horas por semana disponível</Label>
            <Input id="weekly_availability" name="weekly_availability" value={values.weekly_availability || ""} onChange={handleChange} placeholder="Horas por semana disponível" />
          </div>
        </div>
        <div>
          <Label className="font-semibold block mb-2">Interesses de networking</Label>
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
          {saving ? <Loader2 className="animate-spin mr-2" /> : null}
          Salvar Perfil
        </Button>
      </form>
    </div>
  );
}
