
import { Link } from 'react-router-dom';
import { Tool } from '@/types/toolTypes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { MemberBenefitModal } from '@/components/tools/MemberBenefitModal';

interface ToolHeaderProps {
  tool: Tool;
}

export const ToolHeader = ({ tool }: ToolHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
      <div className="flex-1">
        <Link to="/tools" className="inline-flex items-center text-sm text-[#0ABAB5] hover:underline mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar para ferramentas
        </Link>
        
        <div className="flex items-center gap-4 mb-2">
          <div className="h-16 w-16 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden">
            {tool.logo_url ? (
              <img 
                src={tool.logo_url} 
                alt={tool.name} 
                className="h-full w-full object-contain" 
              />
            ) : (
              <div className="text-2xl font-bold text-[#0ABAB5]">
                {tool.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{tool.name}</h1>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="outline" className="bg-[#0ABAB5]/10 text-[#0ABAB5]">
                {tool.category}
              </Badge>
              {tool.tags && tool.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tool.has_member_benefit && tool.benefit_link && (
          <MemberBenefitModal tool={tool} />
        )}
        
        <Button className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90" onClick={() => window.open(tool.official_url, '_blank')}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Visitar website
        </Button>
      </div>
    </div>
  );
};
