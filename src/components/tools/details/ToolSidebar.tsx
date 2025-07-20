
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
      {/* Aurora Style Information Card */}
      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl shadow-2xl">
        <div className="absolute inset-0 opacity-5 pointer-events-none rounded-xl">
          <div className="absolute inset-0 rounded-xl" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
            backgroundSize: '15px 15px'
          }} />
        </div>
        
        <div className="relative">
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-white to-viverblue-light bg-clip-text text-transparent">
            Informações
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-neutral-400 mb-2">Categoria</h4>
              <Badge variant="outline" className="bg-viverblue/10 text-viverblue-light border-viverblue/20 hover:bg-viverblue/15 transition-colors">
                {tool.category}
              </Badge>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-neutral-400 mb-2">Site Oficial</h4>
              <a 
                href={tool.official_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-viverblue-light hover:text-viverblue transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Visitar site oficial
              </a>
            </div>
            
            {tool.tags && tool.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-neutral-400 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {tool.tags.map((tag, index) => (
                    <div key={index} className="inline-flex items-center px-2 py-1 rounded-md bg-viverblue/10 border border-viverblue/20 text-xs text-viverblue-light">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Button 
              className="w-full bg-gradient-to-r from-viverblue to-viverblue-dark hover:from-viverblue-light hover:to-viverblue text-white border-0 shadow-lg hover:shadow-viverblue/20 transition-all duration-300"
              onClick={() => window.open(tool.official_url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Acessar ferramenta
            </Button>
          </div>
        </div>
      </div>
      
      {/* Aurora Style Member Benefit Card */}
      {tool.has_member_benefit && (
        <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl shadow-2xl group hover:bg-white/8 transition-all duration-500">
          <div className="absolute inset-0 opacity-5 pointer-events-none rounded-xl">
            <div className="absolute inset-0 rounded-xl" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
              backgroundSize: '15px 15px'
            }} />
          </div>
          
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-viverblue/15 to-viverblue-dark/15 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 bg-gradient-to-r from-white to-viverblue-light bg-clip-text text-transparent">
                <Gift className="h-5 w-5 text-viverblue-light" />
                Benefício para Membros
              </h3>
              
              {tool.is_access_restricted === true && !tool.has_access && (
                <Badge variant="outline" className="bg-amber-900/30 text-amber-300 border-amber-700/50">
                  <Shield className="h-3 w-3 mr-1" />
                  <span>Acesso Restrito</span>
                </Badge>
              )}
            </div>
            
            <div className="space-y-4">
              {tool.benefit_title && (
                <div>
                  <h4 className="font-medium text-white">{tool.benefit_title}</h4>
                </div>
              )}
              
              {tool.benefit_description && (
                <p className="text-sm text-neutral-300">
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};
