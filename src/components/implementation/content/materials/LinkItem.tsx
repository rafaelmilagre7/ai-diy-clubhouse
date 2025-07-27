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
    <div className="bg-[#1A1E2E] border border-white/10 rounded-lg p-4 flex items-start space-x-4">
      <div className="bg-viverblue/20 text-viverblue p-2 rounded-md">
        <LinkIcon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-base font-medium mb-1 text-neutral-100">
          {link.title}
        </h4>
        
        {link.description && (
          <p className="text-sm text-neutral-400 mb-3 line-clamp-2">{link.description}</p>
        )}
        
        <p className="text-xs text-neutral-500 truncate">{link.url}</p>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-transparent border-viverblue/20 text-viverblue hover:bg-viverblue/10"
        onClick={handleOpenLink}
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        Acessar
      </Button>
    </div>
  );
};