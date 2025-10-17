import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeBlock } from './CodeBlock';

interface ComponentShowcaseProps {
  title: string;
  description?: string;
  preview?: ReactNode;
  code?: string;
  variants?: Array<{
    name: string;
    preview: ReactNode;
    code?: string;
  }>;
}

export function ComponentShowcase({ 
  title, 
  description, 
  preview, 
  code,
  variants 
}: ComponentShowcaseProps) {
  if (variants && variants.length > 0) {
    return (
      <Card className="surface-elevated">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={variants[0].name}>
            <TabsList className="w-full justify-start overflow-x-auto">
              {variants.map((variant) => (
                <TabsTrigger key={variant.name} value={variant.name}>
                  {variant.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {variants.map((variant) => (
              <TabsContent key={variant.name} value={variant.name} className="space-y-4">
                <div className="p-6 rounded-lg border border-border bg-card flex items-center justify-center min-h-[120px]">
                  {variant.preview}
                </div>
                {variant.code && (
                  <CodeBlock code={variant.code} title={`Código - ${variant.name}`} />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="surface-elevated">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-6 rounded-lg border border-border bg-card flex items-center justify-center min-h-[120px]">
          {preview}
        </div>
        {code && (
          <CodeBlock code={code} title="Código" />
        )}
      </CardContent>
    </Card>
  );
}