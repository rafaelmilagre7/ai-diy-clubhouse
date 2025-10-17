
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useNavigate, useParams } from "react-router-dom";
import { Check, Loader2, Search, X, Award } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ValidateCertificate = () => {
  const { code } = useParams<{ code?: string }>();
  const [validationCode, setValidationCode] = useState(code || "");
  const navigate = useNavigate();
  
  const validation = useMutation({
    mutationFn: async (code: string) => {
      const cleanCode = code.toUpperCase().trim();
      
      // Primeiro tentar validar como certificado de solução
      try {
        const { data: solutionData, error: solutionError } = await supabase.rpc('validate_solution_certificate', {
          p_validation_code: cleanCode
        });
        
        if (!solutionError && solutionData?.valid) {
          return {
            type: 'solution',
            data: solutionData
          };
        }
      } catch (error) {
        console.log('Não é certificado de solução, tentando curso...');
      }
      
      // Se não for certificado de solução, tentar como certificado de curso
      const { data: courseData, error: courseError } = await supabase
        .from('learning_certificates')
        .select(`
          *,
          profiles:user_id (name, email),
          learning_courses:course_id (title, description)
        `)
        .eq('validation_code', cleanCode)
        .single();
        
      if (courseError) {
        throw new Error('Certificado não encontrado');
      }
      
      return {
        type: 'course',
        data: courseData
      };
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
  
  const renderCertificateDetails = (result: any) => {
    if (result.type === 'solution') {
      const data = result.data;
      return (
        <div className="border rounded-lg overflow-hidden bg-card border-aurora-primary/20">
          <div className="bg-aurora-primary/10 p-4 border-b border-aurora-primary/20">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-aurora-primary" />
              <h3 className="font-semibold text-aurora-primary">Certificado de Implementação de Solução</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400">Aluno</h4>
                <p className="text-white">{data.user_name}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400">Solução</h4>
                <p className="text-white">{data.solution_title}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400">Categoria</h4>
                <p className="text-white">{data.solution_category}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400">Data de Implementação</h4>
                <p className="text-white">
                  {format(new Date(data.implementation_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400">Data de Emissão</h4>
                <p className="text-white">
                  {format(new Date(data.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400">Código de Validação</h4>
                <p className="font-mono text-aurora-primary">{data.validation_code}</p>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      const data = result.data;
      return (
        <div className="border rounded-lg overflow-hidden bg-card border-aurora-primary/20">
          <div className="bg-aurora-primary/10 p-4 border-b border-aurora-primary/20">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-aurora-primary" />
              <h3 className="font-semibold text-aurora-primary">Certificado de Curso</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400">Aluno</h4>
                <p className="text-white">{data.profiles?.name}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400">Curso</h4>
                <p className="text-white">{data.learning_courses?.title}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400">Data de Emissão</h4>
                <p className="text-white">
                  {format(new Date(data.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400">Código de Validação</h4>
                <p className="font-mono text-aurora-primary">{data.validation_code}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-base to-surface-raised text-white flex flex-col">
      <header className="border-b border-neutral-700/50">
        <div className="container mx-auto py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Verificação de Certificados</h1>
          <Button variant="outline" onClick={() => navigate("/")} className="border-neutral-600 text-gray-300 hover:text-white">
            Voltar para o início
          </Button>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-12">
        <div className="max-w-2xl mx-auto">
          {!validation.data ? (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Validação de Certificado</h2>
                <p className="text-gray-300">
                  Verifique a autenticidade de um certificado emitido pela nossa plataforma.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="validation_code" className="text-white">Código de Verificação</Label>
                  <div className="flex gap-2">
                    <Input
                      id="validation_code"
                      value={validationCode}
                      onChange={(e) => setValidationCode(e.target.value)}
                      placeholder="Exemplo: ABCD-1234-XYZ9"
                      className="flex-1 bg-card border-border text-white placeholder:text-neutral-500"
                      required
                    />
                    <Button type="submit" disabled={validation.isPending || !validationCode} variant="aurora-primary">
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
                  <p className="text-xs text-gray-400">
                    Digite o código exatamente como aparece no certificado, incluindo os hifens.
                  </p>
                </div>
              </form>
              
              {validation.isError && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-700">
                  <X className="h-4 w-4" />
                  <AlertTitle className="text-red-300">Certificado não encontrado</AlertTitle>
                  <AlertDescription className="text-red-200">
                    Não foi possível encontrar um certificado com este código. Verifique se o código foi digitado corretamente.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <Alert className="bg-green-900/20 border-green-700">
                <Check className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-300">Certificado Válido</AlertTitle>
                <AlertDescription className="text-green-200">
                  Este certificado é autêntico e foi emitido pela nossa plataforma.
                </AlertDescription>
              </Alert>
              
              {renderCertificateDetails(validation.data)}
              
              <div className="flex justify-center">
                <Button variant="outline" onClick={handleSearchAgain} className="border-neutral-600 text-gray-300 hover:text-white">
                  Verificar outro certificado
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="border-t border-neutral-700/50">
        <div className="container mx-auto py-4 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Viver de IA - Sistema de Verificação de Certificados
        </div>
      </footer>
    </div>
  );
};

export default ValidateCertificate;
