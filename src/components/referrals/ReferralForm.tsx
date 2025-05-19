
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useCreateReferral } from "@/hooks/referrals/useCreateReferral";
import { ReferralFormData } from "@/lib/supabase/types";
import { PhoneInput } from "../ui/phone-input";

export function ReferralForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState<ReferralFormData & { whatsappNumber?: string; useWhatsapp?: boolean }>({
    email: "",
    type: "club",
    notes: "",
    whatsappNumber: "",
    useWhatsapp: false
  });
  
  const { submitReferral, isSubmitting, success, resetForm } = useCreateReferral();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value as 'club' | 'formacao' }));
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, useWhatsapp: e.target.checked }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, whatsappNumber: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submitReferral({
      ...formData,
      whatsappNumber: formData.useWhatsapp ? formData.whatsappNumber : undefined
    });
    
    if (result?.success) {
      setFormData({
        email: "",
        type: "club",
        notes: "",
        whatsappNumber: "",
        useWhatsapp: false
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
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="useWhatsapp" 
            checked={formData.useWhatsapp}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, useWhatsapp: checked === true }))
            }
          />
          <Label htmlFor="useWhatsapp">Enviar também por WhatsApp</Label>
        </div>
        
        {formData.useWhatsapp && (
          <div className="mt-3 space-y-2">
            <Label htmlFor="whatsappNumber">Número de WhatsApp da pessoa</Label>
            <PhoneInput
              id="whatsappNumber"
              placeholder="+55 (99) 99999-9999"
              value={formData.whatsappNumber}
              onChange={handlePhoneChange}
              required={formData.useWhatsapp}
            />
            <p className="text-sm text-muted-foreground">
              Inclua o código do país e DDD
            </p>
          </div>
        )}
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
