
import { FC } from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const NoSolutionsPlaceholder: FC = () => {
  const navigate = useNavigate();

  const handleExploreSolutions = () => {
    navigate('/solutions');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
      <div className="flex items-center justify-center w-20 h-20 bg-blue-500/10 rounded-full">
        <BookOpen className="h-10 w-10 text-blue-400" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">
          Bem-vindo à sua jornada!
        </h2>
        <p className="text-gray-400 max-w-md">
          Comece explorando nossas soluções personalizadas para fazer seu negócio crescer.
        </p>
      </div>

      <Button 
        onClick={handleExploreSolutions}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
      >
        Explorar Soluções
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};
