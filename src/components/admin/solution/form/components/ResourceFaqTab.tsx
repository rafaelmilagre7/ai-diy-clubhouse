
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Save, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ResourceFormValues, TEMPLATES } from "../hooks/useResourcesFormData";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResourceFaqTabProps {
  form: UseFormReturn<ResourceFormValues>;
}

interface FaqItem {
  question: string;
  answer: string;
}

const ResourceFaqTab: React.FC<ResourceFaqTabProps> = ({ form }) => {
  const [faqItems, setFaqItems] = useState<FaqItem[]>(() => {
    try {
      const currentValue = form.getValues().faq || TEMPLATES.faq;
      return JSON.parse(currentValue);
    } catch (e) {
      console.error("Error parsing FAQ data:", e);
      return JSON.parse(TEMPLATES.faq);
    }
  });
  
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  // Update the form value whenever faqItems changes
  React.useEffect(() => {
    try {
      const faqString = JSON.stringify(faqItems, null, 2);
      form.setValue('faq', faqString);
    } catch (e) {
      console.error("Error stringifying FAQ items:", e);
    }
  }, [faqItems, form]);
  
  const handleAddItem = () => {
    if (newQuestion.trim() && newAnswer.trim()) {
      setFaqItems([...faqItems, { question: newQuestion, answer: newAnswer }]);
      setNewQuestion("");
      setNewAnswer("");
      setShowForm(false);
    }
  };
  
  const handleCancel = () => {
    setNewQuestion("");
    setNewAnswer("");
    setShowForm(false);
  };
  
  const handleRemoveItem = (index: number) => {
    const newItems = [...faqItems];
    newItems.splice(index, 1);
    setFaqItems(newItems);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Perguntas Frequentes (FAQ)</h3>
        <Button 
          onClick={() => setShowForm(true)} 
          variant="outline" 
          className="bg-[#0ABAB5] text-white hover:bg-[#0ABAB5]/90"
          disabled={showForm}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Pergunta
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Gerencie as perguntas e respostas frequentes relacionadas a esta solução.
      </p>
      
      {showForm && (
        <Card className="p-4 border border-[#0ABAB5]/30 bg-[#0ABAB5]/5">
          <CardContent className="p-0 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="question" className="font-medium">Pergunta</Label>
                <Input 
                  id="question" 
                  value={newQuestion} 
                  onChange={(e) => setNewQuestion(e.target.value)} 
                  placeholder="Digite a pergunta..." 
                />
              </div>
              
              <div>
                <Label htmlFor="answer" className="font-medium">Resposta</Label>
                <Textarea 
                  id="answer" 
                  value={newAnswer} 
                  onChange={(e) => setNewAnswer(e.target.value)} 
                  placeholder="Digite a resposta..." 
                  rows={4} 
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddItem} 
                  disabled={!newQuestion.trim() || !newAnswer.trim()}
                  className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Pergunta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <ScrollArea className="h-[500px] rounded-md border">
        <div className="p-4 space-y-4">
          {faqItems.length > 0 ? (
            faqItems.map((item, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 w-full">
                      <div>
                        <h4 className="font-semibold">Pergunta:</h4>
                        <p>{item.question}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Resposta:</h4>
                        <p className="text-gray-600">{item.answer}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma pergunta frequente adicionada ainda.</p>
              <p className="text-sm">Clique em "Adicionar Pergunta" para começar.</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Hidden input to hold the JSON value */}
      <input type="hidden" {...form.register('faq')} />
    </div>
  );
};

export default ResourceFaqTab;
