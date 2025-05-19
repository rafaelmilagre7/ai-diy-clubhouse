
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useCreateReferral } from "@/hooks/referrals/useCreateReferral";
import { ReferralFormData } from "@/lib/supabase/types";

export function ReferralForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState<ReferralFormData>({
    email: "",
    type: "club",
    notes: ""
  });
  
  const { submitReferral, isSubmitting, success, resetForm } = useCreateReferral();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value as 'club' | 'formacao' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submitReferral(formData);
    if (result?.success) {
      setFormData({
        email: "",
        type: "club",
        notes: ""
      });
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail da pessoa que você quer indicar</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="email@exemplo.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Tipo de indicação</Label>
        <RadioGroup 
          value={formData.type} 
          onValueChange={handleTypeChange}
          className="flex flex-col space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="club" id="club" />
            <Label htmlFor="club" className="font-normal">Viver de IA Club</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="formacao" id="formacao" />
            <Label htmlFor="formacao" className="font-normal">Formação Viver de IA</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Mensagem personalizada (opcional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Escreva uma mensagem para a pessoa que você está indicando..."
          value={formData.notes}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar Convite"}
      </Button>
    </form>
  );
}
