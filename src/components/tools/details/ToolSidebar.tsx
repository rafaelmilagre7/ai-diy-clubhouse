
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Tag, Gift, Shield } from 'lucide-react';
import { Tool } from '@/types/toolTypes';
import { MemberBenefitModal } from '@/components/tools/MemberBenefitModal';
import { Badge } from '@/components/ui/badge';

interface ToolSidebarProps {
  tool: Tool;
}

export const ToolSidebar = ({ tool }: ToolSidebarProps) => {
  return (
    <>
      <Card className="border-white/10 shadow-md">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-lg text-textPrimary">Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div>
            <h3 className="text-sm font-medium text-textSecondary mb-2">Categoria</h3>
            <Badge variant="outline" className="bg-viverblue/10 text-viverblue border-viverblue/30">
              {tool.category}
            </Badge>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-textSecondary mb-2">Site Oficial</h3>
            <a 
              href={tool.official_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-viverblue hover:text-viverblue-light transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Visitar site oficial
            </a>
          </div>
          
          {tool.tags && tool.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-textSecondary mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {tool.tags.map((tag, index) => (
                  <div key={index} className="inline-flex items-center px-2 py-1 rounded-md bg-backgroundLight border border-white/5 text-xs text-textSecondary">
                    <Tag className="h-3 w-3 mr-1 text-textMuted" />
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Button 
            className="w-full bg-viverblue hover:bg-viverblue-dark text-white"
            onClick={() => window.open(tool.official_url, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Acessar ferramenta
          </Button>
        </CardContent>
      </Card>
      
      {tool.has_member_benefit && (
        <Card className="bg-gradient-to-br from-viverblue/10 to-viverblue/5 border-viverblue/20 shadow-md mt-6">
          <CardHeader className="border-b border-viverblue/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-textPrimary">
                <Gift className="h-5 w-5 text-viverblue" />
                Benefício para Membros
              </CardTitle>
              
              {tool.is_access_restricted === true && !tool.has_access && (
                <Badge variant="outline" className="bg-amber-900/30 text-amber-300 border-amber-700/50">
                  <Shield className="h-3 w-3 mr-1" />
                  <span>Acesso Restrito</span>
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {tool.benefit_title && (
              <div>
                <h3 className="font-medium text-textPrimary">{tool.benefit_title}</h3>
              </div>
            )}
            
            {tool.benefit_description && (
              <p className="text-sm text-textSecondary">
                {tool.benefit_description}
              </p>
            )}
            
            <div className="pt-2">
              <MemberBenefitModal
                tool={tool}
                variant="default"
                size="default"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
