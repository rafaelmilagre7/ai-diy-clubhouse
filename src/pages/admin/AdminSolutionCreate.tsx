import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/utils/slugify';
import BasicInfoForm from '@/components/admin/solution/BasicInfoForm';
import { SolutionFormValues } from '@/components/admin/solution/form/solutionFormSchema';
import { FileText } from 'lucide-react';
import SolutionCreateWizardSteps from "@/components/admin/solution/SolutionCreateWizardSteps";

const AdminSolutionCreate = () => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log("Renderizando AdminSolutionCreate");

  // Valores padrão para o formulário
  const defaultValues: SolutionFormValues = {
    title: "",
    description: "",
    category: "Receita",
    difficulty: "medium",
    thumbnail_url: "",
    published: false,
    slug: "",
  };

  const handleSubmit = async (values: SolutionFormValues) => {
    try {
      setSaving(true);

      // Gerar um slug único a partir do título
      const slug = slugify(values.title, true);

      // Preparar dados para salvar
      const newSolution = {
        title: values.title,
        description: values.description,
        category: values.category,
        difficulty: values.difficulty,
        slug: slug,
        thumbnail_url: values.thumbnail_url || null,
        published: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Criar nova solução
      const { data, error } = await supabase
        .from("solutions")
        .insert(newSolution)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        toast({
          title: "Solução criada",
          description: "A nova solução foi criada com sucesso.",
        });
        navigate(`/admin/solutions/${data[0].id}`);
      }
    } catch (error: any) {
      console.error("Erro ao criar solução:", error);
      toast({
        title: "Erro ao criar solução",
        description: error.message || "Ocorreu um erro ao tentar criar a solução.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nova Solução</h1>
        <p className="text-muted-foreground">
          Crie uma nova solução para a plataforma VIVER DE IA Club.
        </p>
      </div>
      
      {/* Wizard visual de etapas do cadastro */}
      <SolutionCreateWizardSteps currentStep={0} />

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-2 text-muted-foreground">
            <FileText className="h-5 w-5" />
            <span>Preencha as informações básicas para começar</span>
          </div>
          <BasicInfoForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            saving={saving}
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button
          variant="link"
          onClick={() => navigate("/admin/solutions")}
          className="text-muted-foreground"
        >
          Voltar para lista de soluções
        </Button>
      </div>
    </div>
  );
};

export default AdminSolutionCreate;
