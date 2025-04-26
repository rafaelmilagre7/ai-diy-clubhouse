
import React, { useEffect, useRef, useState } from 'react';
import { Tool } from '@/types/toolTypes';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BenefitBadge } from './BenefitBadge';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface ToolGridProps {
  tools: Tool[];
}

export const ToolGrid = ({ tools }: ToolGridProps) => {
  // Pré-carregar imagens das ferramentas
  useEffect(() => {
    tools.forEach(tool => {
      if (tool.logo_url) {
        const img = new Image();
        img.src = tool.logo_url;
      }
    });
  }, [tools]);

  if (tools.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhuma ferramenta encontrada.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </motion.div>
  );
};

interface ToolCardProps {
  tool: Tool;
}

const ToolCardSkeleton = () => (
  <Card className="flex flex-col h-full border overflow-hidden hover:shadow-md transition-shadow">
    <CardHeader className="pb-3 pt-6 px-6 flex-row items-center gap-4 relative">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div>
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-20" />
      </div>
    </CardHeader>
    <CardContent className="px-6 flex-1">
      <Skeleton className="h-16 w-full" />
    </CardContent>
    <CardFooter className="px-6 pb-6 pt-2 flex justify-between">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </CardFooter>
  </Card>
);

const ToolCard = ({ tool }: ToolCardProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Implementar fallback logo imediatamente, sem esperar erro de carregamento
  const showInitials = !tool.logo_url;
  const initials = tool.name.substring(0, 2).toUpperCase();
  
  // Usar Intersection Observer para carregar apenas quando visível
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    
    const currentElement = document.getElementById(`tool-${tool.id}`);
    if (currentElement) {
      observer.observe(currentElement);
    }
    
    return () => {
      if (currentElement) observer.unobserve(currentElement);
    };
  }, [tool.id]);

  // Se o elemento ainda não é visível, exiba um placeholder
  if (!isVisible) {
    return <ToolCardSkeleton />;
  }

  return (
    <motion.div
      id={`tool-${tool.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="flex flex-col h-full border overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 pt-6 px-6 flex-row items-center gap-4 relative">
          <div className="h-12 w-12 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden flex-shrink-0">
            {!showInitials ? (
              <>
                <img 
                  ref={imgRef}
                  src={tool.logo_url || ''} 
                  alt={tool.name} 
                  className={`h-full w-full object-contain transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  loading="lazy"
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => {
                    if (imgRef.current) {
                      imgRef.current.style.display = 'none';
                      // Mostrar iniciais como fallback
                      const parent = imgRef.current.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="text-xl font-bold text-[#0ABAB5]">${initials}</div>`;
                      }
                    }
                  }}
                />
                {!isImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-xl font-bold text-[#0ABAB5]">{initials}</div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-xl font-bold text-[#0ABAB5]">
                {initials}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{tool.name}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-[#0ABAB5]/10 text-[#0ABAB5]">
                {tool.category}
              </Badge>
              {tool.has_member_benefit && tool.benefit_type && (
                <BenefitBadge type={tool.benefit_type} />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 flex-1">
          <p className="text-muted-foreground line-clamp-3 text-sm">
            {tool.description}
          </p>
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-2 flex justify-between">
          <Link to={`/tools/${tool.id}`}>
            <Button variant="outline" size="sm">
              Ver detalhes
            </Button>
          </Link>
          <a href={tool.official_url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="ghost" className="text-[#0ABAB5]">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export { ToolCard };
