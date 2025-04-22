
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface DiscoverySourceSectionProps {
  form: UseFormReturn<any>;
}

const discoverOptions = [
  { value: "google", label: "Google" },
  { value: "social_media", label: "Redes Sociais" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "recommendation", label: "Recomendação" },
  { value: "event", label: "Evento" },
  { value: "podcast", label: "Podcast" },
  { value: "webinar", label: "Webinar" },
  { value: "news", label: "Notícia/Blog" },
  { value: "ads", label: "Anúncio" },
  { value: "partner", label: "Parceiro" },
  { value: "tiktok", label: "TikTok" },
  { value: "other", label: "Outro" }
];

export const DiscoverySourceSection = ({ form }: DiscoverySourceSectionProps) => {
  const { watch, setValue, register } = form;
  const sourceType = watch("how_found_us");

  return (
    <div className="bg-card p-6 rounded-lg border border-border space-y-4">
      <Label className="text-lg font-semibold">
        Como você conheceu o VIVER DE IA Club?
      </Label>
      <Select
        defaultValue={watch("how_found_us") || ""}
        onValueChange={(value) => setValue("how_found_us", value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          {discoverOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {sourceType === "recommendation" && (
        <div className="space-y-2">
          <Label htmlFor="referred_by">Quem indicou você para o VIVER DE IA Club?</Label>
          <Input
            id="referred_by"
            placeholder="Digite o nome da pessoa que te indicou"
            {...register("referred_by")}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Nos ajuda a agradecer quem está divulgando o VIVER DE IA Club
          </p>
        </div>
      )}
    </div>
  );
};
