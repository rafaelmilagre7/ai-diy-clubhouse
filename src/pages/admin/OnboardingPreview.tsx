import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw, 
  User, 
  Building2, 
  MapPin, 
  Target,
  CheckCircle2,
  Circle
} from "lucide-react";

const OnboardingPreview = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const onboardingSteps = [
    {
      id: 1,
      title: "Informações Pessoais",
      description: "Nome, cargo e informações básicas",
      status: "completed" as const,
      fields: ["Nome completo", "Email", "Cargo atual"]
    },
    {
      id: 2,
      title: "Empresa",
      description: "Dados da organização",
      status: "completed" as const,
      fields: ["Nome da empresa", "Setor de atuação", "Tamanho da empresa"]
    },
    {
      id: 3,
      title: "Localização",
      description: "Onde você está localizado",
      status: "current" as const,
      fields: ["País", "Estado/Região", "Cidade"]
    },
    {
      id: 4,
      title: "Objetivos",
      description: "O que você quer alcançar",
      status: "pending" as const,
      fields: ["Objetivos principais", "Desafios atuais", "Expectativas"]
    },
    {
      id: 5,
      title: "Experiência com IA",
      description: "Seu nível de conhecimento",
      status: "pending" as const,
      fields: ["Nível de experiência", "Ferramentas utilizadas", "Projetos anteriores"]
    },
    {
      id: 6,
      title: "Finalização",
      description: "Confirmação e bem-vindo",
      status: "pending" as const,
      fields: ["Revisão dos dados", "Termos de uso", "Conclusão"]
    }
  ];

  const mockUserData = {
    name: "João Silva",
    email: "joao.silva@empresa.com",
    position: "Gerente de Tecnologia",
    company: "TechCorp Ltda",
    sector: "Tecnologia",
    companySize: "51-200 funcionários",
    country: "Brasil",
    state: "São Paulo",
    city: "São Paulo"
  };

  const handleStepNavigation = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const togglePreview = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Simular progressão automática
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= 6) {
            setIsPlaying(false);
            clearInterval(interval);
            return 1;
          }
          return prev + 1;
        });
      }, 2000);
    }
  };

  const resetPreview = () => {
    setCurrentStep(1);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Preview do Onboarding
          </h1>
          <p className="text-muted-foreground mt-2">
            Teste e visualize o fluxo completo de onboarding dos usuários
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetPreview}
            disabled={isPlaying}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reiniciar
          </Button>
          <Button
            onClick={togglePreview}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Reproduzir
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="steps" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Dados de Teste
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                Progresso do Onboarding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {onboardingSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      step.id === currentStep
                        ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950'
                        : step.status === 'completed'
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950'
                    }`}
                    onClick={() => handleStepNavigation(step.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {step.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : step.id === currentStep ? (
                        <Circle className="h-4 w-4 text-purple-600 animate-pulse" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium">Etapa {step.id}</span>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{step.title}</h4>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Step Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">Etapa {currentStep}</Badge>
                  {onboardingSteps[currentStep - 1]?.title}
                </CardTitle>
                <Badge variant={
                  onboardingSteps[currentStep - 1]?.status === 'completed' ? 'default' :
                  onboardingSteps[currentStep - 1]?.status === 'current' ? 'secondary' : 'outline'
                }>
                  {onboardingSteps[currentStep - 1]?.status === 'completed' ? 'Concluída' :
                   onboardingSteps[currentStep - 1]?.status === 'current' ? 'Atual' : 'Pendente'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {onboardingSteps[currentStep - 1]?.description}
                </p>
                
                <div className="grid gap-4">
                  <h4 className="font-medium">Campos da etapa:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {onboardingSteps[currentStep - 1]?.fields.map((field, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-2">
                          {currentStep === 1 && <User className="h-4 w-4 text-blue-600" />}
                          {currentStep === 2 && <Building2 className="h-4 w-4 text-green-600" />}
                          {currentStep === 3 && <MapPin className="h-4 w-4 text-orange-600" />}
                          {currentStep === 4 && <Target className="h-4 w-4 text-purple-600" />}
                          {currentStep >= 5 && <Settings className="h-4 w-4 text-gray-600" />}
                          <span className="text-sm font-medium">{field}</span>
                        </div>
                        {/* Simulação de valor preenchido para alguns campos */}
                        {currentStep <= 3 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {field === "Nome completo" && mockUserData.name}
                            {field === "Email" && mockUserData.email}
                            {field === "Cargo atual" && mockUserData.position}
                            {field === "Nome da empresa" && mockUserData.company}
                            {field === "Setor de atuação" && mockUserData.sector}
                            {field === "Tamanho da empresa" && mockUserData.companySize}
                            {field === "País" && mockUserData.country}
                            {field === "Estado/Região" && mockUserData.state}
                            {field === "Cidade" && mockUserData.city}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="steps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração das Etapas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {onboardingSteps.map((step) => (
                  <div key={step.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Etapa {step.id}: {step.title}</h4>
                      <Badge variant="outline">{step.fields.length} campos</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {step.fields.map((field, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados de Teste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Informações Pessoais</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nome:</span>
                      <span className="font-medium">{mockUserData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{mockUserData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cargo:</span>
                      <span className="font-medium">{mockUserData.position}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Empresa</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Empresa:</span>
                      <span className="font-medium">{mockUserData.company}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Setor:</span>
                      <span className="font-medium">{mockUserData.sector}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tamanho:</span>
                      <span className="font-medium">{mockUserData.companySize}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Localização</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">País:</span>
                      <span className="font-medium">{mockUserData.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado:</span>
                      <span className="font-medium">{mockUserData.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cidade:</span>
                      <span className="font-medium">{mockUserData.city}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OnboardingPreview;