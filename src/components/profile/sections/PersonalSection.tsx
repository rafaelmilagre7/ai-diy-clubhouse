
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Calendar, Heart } from "lucide-react";
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface PersonalSectionProps {
  data: OnboardingData;
}

export const PersonalSection = ({ data }: PersonalSectionProps) => {
  return (
    <Card className="glass-dark">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-high-contrast">
          <User className="h-5 w-5 text-viverblue" />
          Informações Pessoais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-medium-contrast">Nome Completo</label>
            <p className="text-high-contrast font-medium">{data.name || 'Não informado'}</p>
          </div>
          
          <div>
            <label className="text-sm text-medium-contrast">E-mail</label>
            <p className="text-high-contrast font-medium">{data.email || 'Não informado'}</p>
          </div>
          
          {(data.city || data.state) && (
            <div>
              <label className="text-sm text-medium-contrast flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Localização
              </label>
              <p className="text-high-contrast font-medium">
                {[data.city, data.state].filter(Boolean).join(', ') || 'Não informado'}
              </p>
            </div>
          )}

          {data.birthDate && (
            <div>
              <label className="text-sm text-medium-contrast flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Data de Nascimento
              </label>
              <p className="text-high-contrast font-medium">
                {new Date(data.birthDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </div>

        {data.curiosity && (
          <div>
            <label className="text-sm text-medium-contrast flex items-center gap-1">
              <Heart className="h-4 w-4" />
              Curiosidade Pessoal
            </label>
            <p className="text-high-contrast bg-neutral-800/50 p-3 rounded-lg mt-1">
              {data.curiosity}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {data.phone && (
            <Badge variant="outline" className="text-medium-contrast">
              📞 {data.phone}
            </Badge>
          )}
          {data.instagram && (
            <Badge variant="outline" className="text-medium-contrast">
              📷 Instagram
            </Badge>
          )}
          {data.linkedin && (
            <Badge variant="outline" className="text-medium-contrast">
              💼 LinkedIn
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
