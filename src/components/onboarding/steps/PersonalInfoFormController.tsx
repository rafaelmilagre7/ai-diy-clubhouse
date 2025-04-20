
import { useState, useEffect, useCallback } from "react";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PersonalInfoInputs } from "./PersonalInfoInputs";
import { NavigationButtons } from "./NavigationButtons";

export const PersonalInfoFormController = () => {
  const { progress, updateProgress } = useProgress();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preencher nome e email do perfil (e proteger contra edição)
  const [formData, setFormData] = useState({
    name: profile?.name || progress?.personal_info?.name || "",
    email: profile?.email || progress?.personal_info?.email || "",
    phone: progress?.personal_info?.phone || "",
    ddi: progress?.personal_info?.ddi || "+55",
    linkedin: progress?.personal_info?.linkedin || "",
    instagram: progress?.personal_info?.instagram || "",
    country: progress?.personal_info?.country || "Brasil",
    state: progress?.personal_info?.state || "",
    city: progress?.personal_info?.city || "",
    timezone: progress?.personal_info?.timezone || "GMT-3",
  });

  // Usando useCallback para evitar recriações desnecessárias
  const updateFormData = useCallback(() => {
    if (profile || progress?.personal_info) {
      setFormData(prev => ({
        ...prev,
        name: profile?.name || progress?.personal_info?.name || "",
        email: profile?.email || progress?.personal_info?.email || "",
        phone: progress?.personal_info?.phone || "",
        ddi: progress?.personal_info?.ddi || "+55",
        linkedin: progress?.personal_info?.linkedin || "",
        instagram: progress?.personal_info?.instagram || "",
        country: progress?.personal_info?.country || "Brasil",
        state: progress?.personal_info?.state || "",
        city: progress?.personal_info?.city || "",
        timezone: progress?.personal_info?.timezone || "GMT-3",
      }));
    }
  }, [profile, progress?.personal_info]);

  useEffect(() => {
    updateFormData();
  }, [updateFormData]);

  const handleChange = (field: string, value: string) => {
    // Impede edição em nome e e-mail (proteção extra contra tentativa de edição)
    if (field === "name" || field === "email") return;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Reset dependent fields when country changes
      if (field === "country") {
        newData.state = "";
        newData.city = "";
      }

      // Reset city when state changes
      if (field === "state") {
        newData.city = "";
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      await updateProgress({
        personal_info: {
          ...formData,
          name: profile?.name || formData.name,
          email: profile?.email || formData.email,
        },
        current_step: "business_goals",
        completed_steps: [...(progress?.completed_steps || []), "personal_info"],
      });

      toast.success("Dados salvos com sucesso!");
      navigate("/onboarding/business-goals", { replace: true });
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      <PersonalInfoInputs formData={formData} onChange={handleChange} disabled={isSubmitting} readOnly />
      <NavigationButtons isSubmitting={isSubmitting} />
    </form>
  );
};
