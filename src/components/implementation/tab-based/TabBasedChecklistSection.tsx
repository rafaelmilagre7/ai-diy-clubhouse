
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface TabBasedChecklistSectionProps {
  onSectionComplete: () => void;
  isCompleted: boolean;
}

// Mock checklist data - in a real app this would come from the solution data
const mockChecklistItems = [
  {
    id: "1",
    title: "Configurar ambiente de desenvolvimento",
    description: "Instalar todas as dependências necessárias e configurar o ambiente",
    completed: false,
    category: "setup"
  },
  {
    id: "2", 
    title: "Conectar APIs necessárias",
    description: "Integrar com as APIs de terceiros mencionadas na solução",
    completed: false,
    category: "integration"
  },
  {
    id: "3",
    title: "Configurar banco de dados",
    description: "Criar estrutura de dados e configurar conexões",
    completed: false,
    category: "database"
  },
  {
    id: "4",
    title: "Implementar funcionalidades core",
    description: "Desenvolver as principais funcionalidades da solução",
    completed: false,
    category: "development"
  },
  {
    id: "5",
    title: "Realizar testes",
    description: "Executar testes de funcionalidade e performance",
    completed: false,
    category: "testing"
  },
  {
    id: "6",
    title: "Deploy em produção",
    description: "Publicar a solução no ambiente de produção",
    completed: false,
    category: "deployment"
  }
];

export const TabBasedChecklistSection = ({ onSectionComplete, isCompleted }: TabBasedChecklistSectionProps) => {
  const [checklistItems, setChecklistItems] = useState(mockChecklistItems);
  const [showAllCompleted, setShowAllCompleted] = useState(false);

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const allCompleted = completedCount === totalCount;

  useEffect(() => {
    if (allCompleted && !showAllCompleted) {
      setShowAllCompleted(true);
      setTimeout(() => {
        setShowAllCompleted(false);
      }, 3000);
    }
  }, [allCompleted, showAllCompleted]);

  const toggleItem = (itemId: string) => {
    setChecklistItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const categoryColors = {
    setup: "info",
    integration: "warning", 
    database: "neutral",
    development: "success",
    testing: "info",
    deployment: "success"
  } as const;

  return (
    <div className="space-y-6">
      <Card className="border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Checklist de Implementação
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Acompanhe cada etapa da implementação desta solução
            </p>
          </div>
          {isCompleted && (
            <CheckCircle className="w-6 h-6 text-green-500" />
          )}
        </CardHeader>
      </Card>

      {/* Progress Overview */}
      <Card className="border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Progresso</h3>
            <span className="text-sm font-medium">
              {completedCount}/{totalCount} concluídos
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <motion.div
              className="bg-viverblue h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <AnimatePresence>
            {allCompleted && showAllCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700"
              >
                <p className="text-green-800 dark:text-green-300 font-medium">
                  🎉 Todos os itens foram concluídos!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <div className="space-y-3">
        {checklistItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`border-white/10 cursor-pointer transition-all hover:shadow-md ${
                item.completed ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-700' : ''
              }`}
              onClick={() => toggleItem(item.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="mt-1"
                  >
                    {item.completed ? (
                      <CheckSquare className="w-5 h-5 text-green-500" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </motion.div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${
                        item.completed ? 'line-through text-gray-500' : ''
                      }`}>
                        {item.title}
                      </h4>
                      <Badge variant={categoryColors[item.category]} className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <p className={`text-sm text-gray-600 dark:text-gray-400 ${
                      item.completed ? 'line-through' : ''
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={onSectionComplete}
          disabled={isCompleted}
          className="bg-viverblue hover:bg-viverblue-dark"
        >
          {isCompleted ? "Seção Concluída" : "Marcar como Concluída"}
        </Button>
      </div>
    </div>
  );
};
