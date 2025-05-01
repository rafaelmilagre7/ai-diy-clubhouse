
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Certificate } from "@/types/learningTypes";
import { useNavigate, useParams } from "react-router-dom";
import { Check, Loader2, Search, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ValidateCertificate = () => {
  const { code } = useParams<{ code?: string }>();
  const [validationCode, setValidationCode] = useState(code || "");
  const navigate = useNavigate();
  
  const validation = useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase
        .from('learning_certificates')
        .select(`
          *,
          profiles:user_id (name, email),
          learning_courses:course_id (title, description)
        `)
        .eq('validation_code', code.toUpperCase())
        .single();
        
      if (error) throw error;
      
      return data as any;
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationCode) {
      validation.mutate(validationCode);
    }
  };
  
  const handleSearchAgain = () => {
    validation.reset();
    setValidationCode("");
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Verificação de Certificados</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            Voltar para o início
          </Button>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-12">
        <div className="max-w-2xl mx-auto">
          {!validation.data ? (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Validação de Certificado</h2>
                <p className="text-muted-foreground">
                  Verifique a autenticidade de um certificado emitido pela nossa plataforma.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="validation_code">Código de Verificação</Label>
                  <div className="flex gap-2">
                    <Input
                      id="validation_code"
                      value={validationCode}
                      onChange={(e) => setValidationCode(e.target.value)}
                      placeholder="Exemplo: ABCD-1234-XYZ9"
                      className="flex-1"
                      required
                    />
                    <Button type="submit" disabled={validation.isPending || !validationCode}>
                      {validation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Verificar
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Digite o código exatamente como aparece no certificado, incluindo os hifens.
                  </p>
                </div>
              </form>
              
              {validation.isError && (
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertTitle>Certificado não encontrado</AlertTitle>
                  <AlertDescription>
                    Não foi possível encontrar um certificado com este código. Verifique se o código foi digitado corretamente.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <Alert variant="success" className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Certificado Válido</AlertTitle>
                <AlertDescription className="text-green-700">
                  Este certificado é autêntico e foi emitido pela nossa plataforma.
                </AlertDescription>
              </Alert>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-primary/10 p-4 border-b">
                  <h3 className="font-semibold">Detalhes do Certificado</h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Aluno</h4>
                      <p>{validation.data.profiles?.name}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Curso</h4>
                      <p>{validation.data.learning_courses?.title}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Data de Emissão</h4>
                      <p>
                        {format(new Date(validation.data.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Código de Validação</h4>
                      <p className="font-mono">{validation.data.validation_code}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button variant="outline" onClick={handleSearchAgain}>
                  Verificar outro certificado
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="border-t">
        <div className="container mx-auto py-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Viver de IA - Sistema de Verificação de Certificados
        </div>
      </footer>
    </div>
  );
};

export default ValidateCertificate;
