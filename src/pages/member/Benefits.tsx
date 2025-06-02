
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';

const Benefits = () => {
  return (
    <div className="container py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-full bg-viverblue/10">
            <Gift className="w-6 h-6 text-viverblue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Benefícios</h1>
            <p className="text-muted-foreground">
              Aproveite os benefícios exclusivos da comunidade.
            </p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Seus Benefícios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Lista de benefícios disponíveis será exibida aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Benefits;
