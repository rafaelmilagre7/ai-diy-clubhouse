import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Award, Lightbulb } from "lucide-react";

// Loading state para lista de certificados
export const CertificateListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="relative overflow-hidden border-border/50 backdrop-blur-sm">
          {/* Header com gradiente */}
          <div className="bg-gradient-to-br from-primary/10 to-transparent pb-6 pt-8 relative overflow-hidden">
            <div className="flex justify-center relative z-10">
              <div className="bg-primary/15 rounded-full p-4">
                <Award className="h-16 w-16 text-primary animate-pulse" />
              </div>
            </div>
            
            <div className="absolute top-4 left-4">
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
          
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            
            <div className="bg-primary/5 rounded-lg p-4">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-6 w-full" />
            </div>
          </CardContent>
          
          <CardFooter className="pt-0 flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-10" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

// Loading state para preview de certificado
export const CertificatePreviewSkeleton = ({ scale = 0.5 }: { scale?: number }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      
      <div 
        className="bg-gradient-to-br from-background via-background to-primary/5 rounded-lg animate-pulse"
        style={{ 
          width: `${1123 * scale}px`, 
          height: `${920 * scale}px`,
          minHeight: '200px'
        }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <Award className="h-12 w-12 text-primary animate-pulse" />
            <div className="text-center space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading state para geração de PDF
export const PDFGenerationLoader = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border border-border rounded-lg p-8 shadow-xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Award className="h-16 w-16 text-primary animate-pulse" />
            <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin border-t-primary"></div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Gerando Certificado
            </h3>
            <p className="text-sm text-muted-foreground">
              Preparando seu certificado em PDF...
            </p>
          </div>
          
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading state específico para cada tipo de certificado
export const CertificateTypeSkeleton = ({ type }: { type: 'course' | 'solution' }) => {
  const Icon = type === 'solution' ? Lightbulb : Award;
  const color = type === 'solution' ? 'accent' : 'primary';
  
  return (
    <Card className="relative overflow-hidden border-border/50 backdrop-blur-sm">
      <div className={`bg-gradient-to-br from-${color}/10 to-transparent pb-6 pt-8 relative overflow-hidden`}>
        <div className="flex justify-center relative z-10">
          <div className={`bg-${color}/15 rounded-full p-4`}>
            <Icon className={`h-16 w-16 text-${color} animate-pulse`} />
          </div>
        </div>
        
        <div className="absolute top-4 left-4">
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        
        <div className={`bg-${color}/5 rounded-lg p-4`}>
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-6 w-full" />
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-10" />
      </CardFooter>
    </Card>
  );
};