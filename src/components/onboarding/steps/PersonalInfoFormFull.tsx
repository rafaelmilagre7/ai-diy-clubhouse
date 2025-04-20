
import { useState } from "react";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const PersonalInfoFormFull = () => {
  const { progress, updateProgress } = useProgress();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: progress?.personal_info?.name || "",
    email: progress?.personal_info?.email || "",
    phone: progress?.personal_info?.phone || "",
    linkedin: progress?.personal_info?.linkedin || "",
    instagram: progress?.personal_info?.instagram || "",
    country: progress?.personal_info?.country || "Brasil",
    state: progress?.personal_info?.state || "",
    city: progress?.personal_info?.city || "",
    timezone: progress?.personal_info?.timezone || "Horário de Brasília (GMT-3)",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProgress({
        personal_info: formData,
        current_step: 'business_goals',
        completed_steps: [...(progress?.completed_steps || []), 'personal_info']
      });

      toast.success("Dados salvos com sucesso!");
      navigate("/onboarding/business-goals");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo*</Label>
          <Input
            type="text"
            id="name"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Seu nome completo"
            required
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email*</Label>
          <Input
            type="email"
            id="email"
            value={formData.email}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="seu.email@exemplo.com"
            required
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone/WhatsApp*</Label>
          <Input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(00) 00000-0000"
            required
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            type="url"
            id="linkedin"
            value={formData.linkedin}
            onChange={e => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
            placeholder="linkedin.com/in/seuperfil"
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            type="text"
            id="instagram"
            value={formData.instagram}
            onChange={e => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
            placeholder="@seuinstagram"
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">País*</Label>
          <Select 
            value={formData.country} 
            onValueChange={value => setFormData(prev => ({ ...prev, country: value }))}
          >
            <SelectTrigger id="country" className="bg-white">
              <SelectValue placeholder="Selecione seu país" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Brasil">Brasil</SelectItem>
              <SelectItem value="Portugal">Portugal</SelectItem>
              <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Estado*</Label>
          <Input
            type="text"
            id="state"
            value={formData.state}
            onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
            placeholder="Seu estado"
            required
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Cidade*</Label>
          <Input
            type="text"
            id="city"
            value={formData.city}
            onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
            placeholder="Sua cidade"
            required
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Fuso Horário*</Label>
          <Select 
            value={formData.timezone} 
            onValueChange={value => setFormData(prev => ({ ...prev, timezone: value }))}
          >
            <SelectTrigger id="timezone" className="bg-white">
              <SelectValue placeholder="Selecione seu fuso horário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Horário de Brasília (GMT-3)">Horário de Brasília (GMT-3)</SelectItem>
              <SelectItem value="Fernando de Noronha (GMT-2)">Fernando de Noronha (GMT-2)</SelectItem>
              <SelectItem value="Manaus (GMT-4)">Manaus (GMT-4)</SelectItem>
              <SelectItem value="Acre (GMT-5)">Acre (GMT-5)</SelectItem>
              <SelectItem value="Horário de Lisboa (GMT+0)">Horário de Lisboa (GMT+0)</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" disabled className="min-w-[120px]">
          Anterior
        </Button>
        <Button 
          type="submit" 
          className="min-w-[120px] bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : (
            <span className="flex items-center gap-2">
              Próximo
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};
