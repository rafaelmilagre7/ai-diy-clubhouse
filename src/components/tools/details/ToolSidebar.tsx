
import { Tool } from '@/types/toolTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink } from 'lucide-react';

interface ToolSidebarProps {
  tool: Tool;
}

export const ToolSidebar = ({ tool }: ToolSidebarProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">Informações</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Categoria</h3>
            <p>{tool.category}</p>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {tool.tags && tool.tags.length > 0 ? (
                tool.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))
              ) : (
                <p className="text-sm">Sem tags</p>
              )}
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Website oficial</h3>
            <a 
              href={tool.official_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#0ABAB5] hover:underline text-sm flex items-center mt-1"
            >
              {tool.official_url}
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
