
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OnboardingFormData, onboardingSchema, formOptions } from "@/types/onboardingForm";
import { saveOnboardingData, getUserOnboardingData } from "@/services/onboardingService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface OnboardingFormProps {
  onSuccess?: () => void;
}

export function OnboardingForm({ onSuccess }: OnboardingFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Definir o formulário com React Hook Form e validação Zod
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      nome_completo: "",
      email: "",
      perfil_usuario: "Empresário",
      areas_interesse: [],
      nivel_conhecimento: "Iniciante",
      experiencia_anterior: "Não sei nada",
      objetivos: [],
      preferencia_horario: [],
      interesse_networking: false,
      estado: "",
      cidade: "",
      permite_case: false,
      interesse_entrevista: false,
      observacoes: "",
    },
  });

  // Carregar dados existentes do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await getUserOnboardingData();
        
        if (error) {
          console.error("Erro ao carregar dados:", error);
          setLoadError("Não foi possível carregar seus dados. Por favor, tente novamente.");
          return;
        }
        
        if (data) {
          // Preencher o formulário com dados existentes
          form.reset({
            nome_completo: data.nome_completo || "",
            email: data.email || "",
            perfil_usuario: data.perfil_usuario as any || "Empresário",
            areas_interesse: data.areas_interesse || [],
            nivel_conhecimento: data.nivel_conhecimento as any || "Iniciante",
            experiencia_anterior: data.experiencia_anterior as any || "Não sei nada",
            objetivos: data.objetivos || [],
            preferencia_horario: data.preferencia_horario || [],
            interesse_networking: data.interesse_networking || false,
            estado: data.estado || "",
            cidade: data.cidade || "",
            permite_case: data.permite_case || false,
            interesse_entrevista: data.interesse_entrevista || false,
            observacoes: data.observacoes || "",
          });
          
          console.log("Dados carregados com sucesso:", data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados de usuário:", error);
        setLoadError("Ocorreu um erro ao carregar seus dados.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [form]);

  // Enviar formulário
  const onSubmit = async (data: OnboardingFormData) => {
    try {
      setIsSubmitting(true);
      const { success, error } = await saveOnboardingData(data);
      
      if (!success) {
        throw new Error(error);
      }
      
      setFormSuccess(true);
      toast.success("Informações salvas com sucesso!");
      
      // Aguardar 2 segundos e redirecionar ou chamar callback
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/dashboard");
        }
      }, 2000);
    } catch (error: any) {
      console.error("Erro ao salvar formulário:", error);
      toast.error("Erro ao salvar suas informações. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Carregando formulário...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{loadError}</AlertDescription>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline" 
          className="mt-2"
        >
          Tentar novamente
        </Button>
      </Alert>
    );
  }

  if (formSuccess) {
    return (
      <Alert variant="default" className="bg-green-50 border-green-200 mb-6">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>Sucesso!</AlertTitle>
        <AlertDescription>
          Obrigado! Suas informações foram salvas com sucesso.
          Você será redirecionado em instantes...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Seção 1: Informações Pessoais */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Preencha seus dados básicos para começarmos a personalizar sua experiência.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nome_completo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo*</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail*</FormLabel>
                    <FormControl>
                      <Input placeholder="seu.email@exemplo.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção 2: Perfil do Usuário */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Perfil do Usuário</CardTitle>
            <CardDescription>
              Conte-nos mais sobre você e seu perfil profissional.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="perfil_usuario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Você é*</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formOptions.perfilUsuario.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Seção 3: Interesses em IA */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Interesses em Inteligência Artificial</CardTitle>
            <CardDescription>
              Selecione as áreas de IA que mais interessam a você.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="areas_interesse"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Áreas de Interesse em IA*</FormLabel>
                    <FormDescription>
                      Selecione uma ou mais áreas de interesse.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {formOptions.areasInteresse.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="areas_interesse"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Seção 4: Conhecimento em IA */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Conhecimento em IA</CardTitle>
            <CardDescription>
              Conte-nos sobre seu nível de conhecimento em inteligência artificial.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="nivel_conhecimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Conhecimento em IA*</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu nível" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formOptions.nivelConhecimento.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experiencia_anterior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experiência Anterior</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione sua experiência" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formOptions.experienciaAnterior.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Seção 5: Objetivos com a Plataforma */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Objetivos com a Plataforma</CardTitle>
            <CardDescription>
              Quais são seus principais objetivos ao utilizar a plataforma VIVER DE IA?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="objetivos"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Quais seus principais objetivos com IA?</FormLabel>
                    <FormDescription>
                      Selecione um ou mais objetivos.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {formOptions.objetivos.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="objetivos"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Seção 6: Disponibilidade */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Disponibilidade</CardTitle>
            <CardDescription>
              Informe sua disponibilidade para eventos e networking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="preferencia_horario"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Preferência de Horário para Encontros</FormLabel>
                    <FormDescription>
                      Selecione um ou mais horários preferidos.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {formOptions.preferenciaHorario.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="preferencia_horario"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interesse_networking"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Interesse em Networking</FormLabel>
                    <FormDescription>
                      Gostaria de se conectar com outros membros da comunidade?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Seção 7: Localização */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Localização</CardTitle>
            <CardDescription>
              Informe onde você está localizado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado*</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu estado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade*</FormLabel>
                    <FormControl>
                      <Input placeholder="Sua cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção 8: Permissões e Consentimentos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Permissões e Consentimentos</CardTitle>
            <CardDescription>
              Suas preferências para comunicações e uso de dados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="permite_case"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Autorização de Case</FormLabel>
                    <FormDescription>
                      Autoriza uso do seu case como exemplo de sucesso?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interesse_entrevista"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Interesse em Entrevistas</FormLabel>
                    <FormDescription>
                      Interesse em participar de entrevistas/cases?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Seção 9: Observações Finais */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Observações Finais</CardTitle>
            <CardDescription>
              Algo mais que gostaria de compartilhar?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Alguma informação adicional que gostaria de compartilhar conosco?"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Este campo é opcional.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            * Campos obrigatórios
          </p>
          <Button type="submit" className="px-8" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Salvando...
              </>
            ) : (
              "Salvar Informações"
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
