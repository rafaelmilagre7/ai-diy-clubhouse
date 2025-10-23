import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock, ArrowRight } from 'lucide-react';

interface AutomationStep {
  id: string;
  tool_name: string;
  tool_icon: string;
  title: string;
  description: string;
  estimated_time: string;
  tutorial_link?: string;
  order: number;
}

interface AutomationJourneyFlowProps {
  data: {
    steps: AutomationStep[];
    total_time: string;
    difficulty: string;
  };
}

export const AutomationJourneyFlow = ({ data }: AutomationJourneyFlowProps) => {
  const { steps, total_time, difficulty } = data;

  return (
    <div className="space-y-6">
      {/* Header com métricas */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">Jornada de Automação</h3>
          <p className="text-muted-foreground">
            Siga estas etapas para configurar sua automação
          </p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="px-4 py-2">
            <Clock className="h-4 w-4 mr-2" />
            {total_time}
          </Badge>
          <Badge 
            variant={
              difficulty === 'Fácil' ? 'default' : 
              difficulty === 'Intermediário' ? 'secondary' : 
              'destructive'
            }
            className="px-4 py-2"
          >
            {difficulty}
          </Badge>
        </div>
      </div>

      {/* Timeline de etapas */}
      <div className="relative">
        {/* Linha conectora */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

        <div className="space-y-6">
          {steps
            .sort((a, b) => a.order - b.order)
            .map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Card className="ml-0 md:ml-16 hover:shadow-lg transition-shadow">
                  {/* Indicador de número */}
                  <div className="absolute -left-16 top-6 hidden md:flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl shadow-lg">
                    {step.order}
                  </div>

                  <CardHeader className="space-y-0 pb-4">
                    <div className="flex items-start gap-4">
                      {/* Logo da ferramenta */}
                      <div className="flex-shrink-0 mt-1">
                        <img 
                          src={step.tool_icon} 
                          alt={step.tool_name}
                          className="h-12 w-12 rounded-lg object-contain bg-white p-2 border border-border"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/48?text=' + step.tool_name.charAt(0);
                          }}
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        {/* Badge mobile com número */}
                        <Badge className="md:hidden mb-2">
                          Etapa {step.order}
                        </Badge>
                        
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground font-medium">
                            {step.tool_name}
                          </p>
                          <h4 className="text-xl font-bold leading-tight">
                            {step.title}
                          </h4>
                        </div>

                        <Badge variant="secondary" className="w-fit">
                          <Clock className="h-3 w-3 mr-1" />
                          {step.estimated_time}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {step.description}
                    </p>

                    {step.tutorial_link && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                        className="w-full sm:w-auto"
                      >
                        <a 
                          href={step.tutorial_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver tutorial
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Seta conectora (não mostrar na última) */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-2 md:ml-16">
                    <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
                  </div>
                )}
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};
