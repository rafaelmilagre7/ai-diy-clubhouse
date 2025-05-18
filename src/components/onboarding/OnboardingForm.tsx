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
import { AlertCircle, CheckCircle, Building } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { PhoneInput } from "@/components/onboarding/steps/inputs/PhoneInput";
import { supabase } from "@/lib/supabase";
import { showOnboardingSuccessToast } from "./OnboardingSuccessToast";

interface OnboardingFormProps {
  onSuccess?: () => void;
}

export function OnboardingForm({ onSuccess }: OnboardingFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{
    name?: string,
    email?: string,
    full_name?: string
  } | null>(null);
  const navigate = useNavigate();

  // Definir o formulário com React Hook Form e validação Zod
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      nome_completo: "",
      email: "",
      telefone: "",
      nome_empresa: "",
      segmento_empresa: "",
      como_conheceu: "",
      quem_indicou: "",
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
    mode: "onChange",
  });

  // Observar o valor do campo "como_conheceu" para mostrar/ocultar o campo "quem_indicou"
  const comoConheceu = form.watch("como_conheceu");
  const mostrarQuemIndicou = comoConheceu === "Indicação";

  // Obter os dados do usuário autenticado
  useEffect(() => {
    const getUserData = async () => {
      try {
        setIsLoading(true);
        // Buscar dados do usuário autenticado
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Erro ao obter dados do usuário:", userError);
          return;
        }

        if (user) {
          // Extrair nome de diversas possíveis fontes
          const userData = {
            email: user.email || '',
            name: user.user_metadata?.name || '',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || ''
          };
          
          console.log("Dados do usuário obtidos:", userData);
          setUserProfile(userData);

          // Usar os dados do usuário para preencher os campos do formulário
          if (userData.email) {
            form.setValue("email", userData.email);
          }
          
          if (userData.full_name) {
            form.setValue("nome_completo", userData.full_name);
          }
        }
      } catch (error) {
        console.error("Erro ao obter dados do usuário:", error);
        toast.error("Não foi possível carregar seus dados de perfil");
      }
    };
    
    getUserData();
  }, [form]);

  // Carregar dados existentes do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data, error } = await getUserOnboardingData();
        
        if (error) {
          console.error("Erro ao carregar dados:", error);
          setLoadError("Não foi possível carregar seus dados. Por favor, tente novamente.");
          return;
        }
        
        if (data) {
          // Mesclar dados existentes com dados do perfil
          // Mas não sobrescrever nome e email obtidos do perfil
          const mergedData = {
            ...data,
            // Manter email do perfil se existir
            email: userProfile?.email || data.email || "",
            // Manter nome do perfil se existir
            nome_completo: userProfile?.full_name || userProfile?.name || data.nome_completo || ""
          };
          
          // Preencher o formulário com dados mesclados
          form.reset(mergedData);
          console.log("Dados carregados e mesclados com sucesso:", mergedData);
        } else if (userProfile) {
          // Se não há dados existentes mas temos o perfil do usuário, pré-preencher nome e email
          form.setValue("nome_completo", userProfile.full_name || userProfile.name || "");
          form.setValue("email", userProfile.email || "");
        }
      } catch (error) {
        console.error("Erro ao carregar dados de usuário:", error);
        setLoadError("Ocorreu um erro ao carregar seus dados.");
      } finally {
        setIsLoading(false);
      }
    };

    // Só carregar dados quando o userProfile estiver disponível
    if (userProfile) {
      loadUserData();
    } else if (!isLoading) {
      // Se não houver perfil e não estiver carregando, finalizar loading
      setIsLoading(false);
    }
  }, [form, userProfile]);

  // Enviar formulário
  const onSubmit = async (data: OnboardingFormData) => {
    try {
      setIsSubmitting(true);
      const { success, error } = await saveOnboardingData(data);
      
      if (!success) {
        throw new Error(error);
      }
      
      setFormSuccess(true);
      
      // Use nosso novo toast personalizado ao invés do toast simples
      showOnboardingSuccessToast({
        title: "Informações salvas com sucesso!",
        message: "Suas informações foram registradas. Você será redirecionado para o dashboard em instantes."
      });
      
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
        {/* Seção 1: Informações Pessoais - CAMPOS OCULTOS */}
        <div className="hidden">
          <FormField
            control={form.control}
            name="nome_completo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">Nome Completo*</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Seu nome completo" 
                    {...field}
                    className="bg-slate-50" 
                  />
                </FormControl>
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
                  <Input 
                    placeholder="seu.email@exemplo.com" 
                    type="email" 
                    {...field} 
                    readOnly 
                    disabled
                    className="bg-slate-50" 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Seção 1: Informações Pessoais - CAMPOS VISÍVEIS */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Preencha seus dados básicos para começarmos a personalizar sua experiência.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone*</FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={form.formState.errors.telefone?.message}
                        ddi="+55"
                        onChangeDDI={(value) => console.log("DDI alterado:", value)}
                        isValid={!form.formState.errors.telefone}
                        showLabel={false} // Não mostrar a label no componente
                      />
                    </FormControl>
                    <FormDescription>
                      Digite seu número com DDD (Ex: 11 99999-9999)
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção 2: Informações da Empresa */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
            <CardDescription>
              Conte-nos um pouco sobre sua empresa (opcional).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nome_empresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Nome da Empresa
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-gray-400 text-xs">(opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da sua empresa" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="segmento_empresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Segmento da Empresa 
                      <span className="text-gray-400 text-xs ml-2">(opcional)</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o segmento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formOptions.segmentoEmpresa.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção 3: Como nos conheceu */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Como nos conheceu</CardTitle>
            <CardDescription>
              Queremos entender melhor como você chegou até nós.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="como_conheceu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Como você nos conheceu*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={cn(
                          form.formState.errors.como_conheceu ? "border-red-500" : ""
                        )}>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formOptions.comoConheceu.map((option) => (
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
              
              {mostrarQuemIndicou && (
                <FormField
                  control={form.control}
                  name="quem_indicou"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quem indicou*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nome de quem indicou" 
                          {...field} 
                          className={cn(
                            form.formState.errors.quem_indicou ? "border-red-500" : ""
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seção 3: Perfil do Usuário */}
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

        {/* Seção 4: Interesses em IA */}
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

        {/* Seção 5: Conhecimento em IA */}
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

        {/* Seção 6: Objetivos com a Plataforma */}
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

        {/* Seção 7: Disponibilidade */}
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

        {/* Seção 8: Localização */}
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

        {/* Seção 9: Permissões e Consentimentos */}
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

        {/* Seção 10: Observações Finais */}
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
          <Button 
            type="submit" 
            className="px-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            disabled={isSubmitting}
          >
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
