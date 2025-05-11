
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Categoria</h3>
            <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
              {tool.category}
            </span>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Site Oficial</h3>
            <a 
              href={tool.official_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Visitar site oficial
            </a>
          </div>
          
          {tool.tags && tool.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {tool.tags.map((tag, index) => (
                  <div key={index} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs">
                    <Tag className="h-3 w-3 mr-1 text-gray-500" />
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Button 
            className="w-full"
            onClick={() => window.open(tool.official_url, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Acessar ferramenta
          </Button>
        </CardContent>
      </Card>
      
      {tool.has_member_benefit && (
        <Card className="bg-gradient-to-br from-[#10b981]/10 to-[#10b981]/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-[#10b981]" />
                Benefício para Membros
              </CardTitle>
              
              {tool.is_access_restricted === true && !tool.has_access && (
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Acesso Restrito</span>
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {tool.benefit_title && (
              <div>
                <h3 className="font-medium">{tool.benefit_title}</h3>
              </div>
            )}
            
            {tool.benefit_description && (
              <p className="text-sm text-muted-foreground">
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
