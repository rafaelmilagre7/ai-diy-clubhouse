
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

const NewTopic = () => {
  const { categorySlug } = useParams();

  return (
    <div className="container py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-full bg-viverblue/10">
            <MessageSquare className="w-6 h-6 text-viverblue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Novo Tópico</h1>
            <p className="text-muted-foreground">
              Criar novo tópico na categoria {categorySlug}.
            </p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Tópico</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Formulário para criação de novo tópico será exibido aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewTopic;
