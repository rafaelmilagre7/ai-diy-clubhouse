
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Lightbulb, Zap } from "lucide-react";

export const NoSolutionsPlaceholder = () => {
  return (
    <div className="text-center py-12">
      <div className="mb-8">
        <div className="flex justify-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <Lightbulb className="w-8 h-8 text-purple-600" />
          </div>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Zap className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Bem-vindo à plataforma!
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Suas soluções de IA aparecerão aqui assim que estiverem disponíveis. 
          Em breve você terá acesso a conteúdos personalizados para transformar seu negócio.
        </p>
      </div>

      <Card className="max-w-lg mx-auto">
        <CardContent className="p-6">
          <h4 className="font-semibold text-gray-900 mb-2">
            O que você pode fazer enquanto isso:
          </h4>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li>• Complete seu perfil para receber recomendações personalizadas</li>
            <li>• Explore a comunidade e conecte-se com outros membros</li>
            <li>• Acesse ferramentas disponíveis na seção Tools</li>
            <li>• Participe de eventos e webinars</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
