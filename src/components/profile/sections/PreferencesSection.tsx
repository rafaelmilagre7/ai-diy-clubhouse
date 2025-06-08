
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Clock, BookOpen, Users, Shield, Calendar } from "lucide-react";
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface PreferencesSectionProps {
  data: OnboardingData;
}

export const PreferencesSection = ({ data }: PreferencesSectionProps) => {
  const getContentPreferenceInfo = (preference: string) => {
    const preferenceMap: Record<string, { label: string; color: string }> = {
      'theoretical': { label: 'Mais Teórico', color: 'bg-blue-500/20 text-blue-400' },
      'hands-on': { label: 'Mais Prático', color: 'bg-green-500/20 text-green-400' },
    };
    return preferenceMap[preference] || { label: preference, color: 'bg-gray-500/20 text-gray-400' };
  };

  const contentPreferenceInfo = data.contentPreference ? getContentPreferenceInfo(data.contentPreference) : null;

  return (
    <Card className="glass-dark">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-high-contrast">
          <Settings className="h-5 w-5 text-viverblue" />
          Preferências de Aprendizado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.weeklyLearningTime && (
            <div>
              <label className="text-sm text-medium-contrast flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Tempo Semanal
              </label>
              <Badge variant="outline" className="mt-1">
                {data.weeklyLearningTime}
              </Badge>
            </div>
          )}

          {contentPreferenceInfo && (
            <div>
              <label className="text-sm text-medium-contrast flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                Tipo de Conteúdo
              </label>
              <Badge className={`${contentPreferenceInfo.color} mt-1`}>
                {contentPreferenceInfo.label}
              </Badge>
            </div>
          )}

          {data.wantsNetworking && (
            <div>
              <label className="text-sm text-medium-contrast flex items-center gap-1">
                <Users className="h-4 w-4" />
                Interesse em Networking
              </label>
              <Badge 
                variant={data.wantsNetworking === 'yes' ? 'default' : 'outline'} 
                className="mt-1"
              >
                {data.wantsNetworking === 'yes' ? 'Sim' : 'Não'}
              </Badge>
            </div>
          )}

          {data.acceptsCaseStudy && (
            <div>
              <label className="text-sm text-medium-contrast flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Compartilhar Case de Sucesso
              </label>
              <Badge 
                variant={data.acceptsCaseStudy === 'yes' ? 'default' : 'outline'} 
                className="mt-1"
              >
                {data.acceptsCaseStudy === 'yes' ? 'Aceita' : 'Prefere Privacidade'}
              </Badge>
            </div>
          )}
        </div>

        {data.bestDays && data.bestDays.length > 0 && (
          <div>
            <label className="text-sm text-medium-contrast flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Melhores Dias
            </label>
            <div className="flex flex-wrap gap-1 mt-2">
              {data.bestDays.map((day, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {day}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {data.bestPeriods && data.bestPeriods.length > 0 && (
          <div>
            <label className="text-sm text-medium-contrast">Melhores Períodos</label>
            <div className="flex flex-wrap gap-1 mt-2">
              {data.bestPeriods.map((period, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {period}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
