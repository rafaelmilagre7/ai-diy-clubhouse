
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

const CategoryView = () => {
  const { slug } = useParams();

  return (
    <div className="container py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-full bg-viverblue/10">
            <MessageSquare className="w-6 h-6 text-viverblue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Categoria: {slug}</h1>
            <p className="text-muted-foreground">
              Tópicos da categoria {slug}.
            </p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Tópicos da Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Lista de tópicos desta categoria será exibida aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryView;
