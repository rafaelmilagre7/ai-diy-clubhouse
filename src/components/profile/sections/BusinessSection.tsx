
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Briefcase, TrendingUp, Globe, DollarSign } from "lucide-react";
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface BusinessSectionProps {
  data: OnboardingData;
}

export const BusinessSection = ({ data }: BusinessSectionProps) => {
  const getCompanySizeBadge = (size: string) => {
    const sizeMap: Record<string, { label: string; color: string }> = {
      'micro': { label: 'Microempresa', color: 'bg-blue-500/20 text-blue-400' },
      'small': { label: 'Pequena', color: 'bg-green-500/20 text-green-400' },
      'medium': { label: 'Média', color: 'bg-yellow-500/20 text-yellow-400' },
      'large': { label: 'Grande', color: 'bg-purple-500/20 text-purple-400' },
    };
    return sizeMap[size] || { label: size, color: 'bg-gray-500/20 text-gray-400' };
  };

  const getRevenueBadge = (revenue: string) => {
    const revenueMap: Record<string, string> = {
      'up-to-100k': 'Até R$ 100k',
      '100k-500k': 'R$ 100k - 500k',
      '500k-2m': 'R$ 500k - 2M',
      '2m-10m': 'R$ 2M - 10M',
      'above-10m': 'Acima de R$ 10M',
    };
    return revenueMap[revenue] || revenue;
  };

  const companySizeBadge = data.companySize ? getCompanySizeBadge(data.companySize) : null;

  return (
    <Card className="glass-dark">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-high-contrast">
          <Building className="h-5 w-5 text-viverblue" />
          Perfil Empresarial
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-medium-contrast">Empresa</label>
            <p className="text-high-contrast font-medium">{data.companyName || 'Não informado'}</p>
          </div>
          
          <div>
            <label className="text-sm text-medium-contrast flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              Cargo/Posição
            </label>
            <p className="text-high-contrast font-medium">{data.position || 'Não informado'}</p>
          </div>
          
          <div>
            <label className="text-sm text-medium-contrast">Setor de Atuação</label>
            <p className="text-high-contrast font-medium">{data.businessSector || 'Não informado'}</p>
          </div>

          {data.companyWebsite && (
            <div>
              <label className="text-sm text-medium-contrast flex items-center gap-1">
                <Globe className="h-4 w-4" />
                Website
              </label>
              <a 
                href={data.companyWebsite} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-viverblue hover:underline font-medium"
              >
                {data.companyWebsite}
              </a>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {companySizeBadge && (
            <Badge className={companySizeBadge.color}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {companySizeBadge.label}
            </Badge>
          )}
          
          {data.annualRevenue && (
            <Badge variant="outline" className="text-medium-contrast">
              <DollarSign className="h-3 w-3 mr-1" />
              {getRevenueBadge(data.annualRevenue)}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
