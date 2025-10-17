import React from "react";
import { ExternalLink, LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Link {
  title: string;
  description: string;
  url: string;
}

interface LinkItemProps {
  link: Link;
}

export const LinkItem = ({ link }: LinkItemProps) => {
  const handleOpenLink = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <div className="bg-surface-elevated border border-border rounded-lg p-4 flex items-start space-x-4">
      <div className="bg-aurora-primary/20 text-aurora-primary p-2 rounded-md">
        <LinkIcon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-base font-medium mb-1 text-foreground">
          {link.title}
        </h4>
        
        {link.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{link.description}</p>
        )}
        
        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-transparent border-aurora-primary/20 text-aurora-primary hover:bg-aurora-primary/10"
        onClick={handleOpenLink}
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        Acessar
      </Button>
    </div>
  );
};