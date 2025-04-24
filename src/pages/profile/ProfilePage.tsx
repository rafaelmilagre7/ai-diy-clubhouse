
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth";
import { User, Settings, Bell, Shield, Award, Key } from "lucide-react";

const ProfilePage = () => {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || user?.user_metadata?.name || '',
    email: profile?.email || user?.email || '',
    company: profile?.company_name || '',
    industry: profile?.industry || ''
  });
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Em um caso real, enviaríamos os dados para atualização
    console.log("Dados a serem atualizados:", formData);
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Seu Perfil</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{formData.name}</h2>
              <p className="text-muted-foreground">{formData.email}</p>
              {profile?.company_name && (
                <p className="text-sm">{profile.company_name}</p>
              )}
              <Button variant="outline" className="mt-4 w-full">
                Alterar Foto
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Menu de Configurações</CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Informações Pessoais
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Notificações
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Key className="mr-2 h-4 w-4" />
                  Segurança
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Award className="mr-2 h-4 w-4" />
                  Conquistas
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Preferências
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Tabs defaultValue="personal">
            <TabsList className="mb-6">
              <TabsTrigger value="personal">Informações Pessoais</TabsTrigger>
              <TabsTrigger value="company">Empresa</TabsTrigger>
              <TabsTrigger value="preferences">Preferências</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>
                      Seus dados pessoais utilizados na plataforma
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancelar' : 'Editar'}
                  </Button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome Completo</Label>
                          {isEditing ? (
                            <Input 
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                            />
                          ) : (
                            <div className="px-3 py-2 rounded-md border bg-background">
                              {formData.name}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          {isEditing ? (
                            <Input 
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              type="email"
                              disabled
                            />
                          ) : (
                            <div className="px-3 py-2 rounded-md border bg-background">
                              {formData.email}
                            </div>
                          )}
                          {isEditing && (
                            <p className="text-xs text-muted-foreground">
                              O email não pode ser alterado diretamente.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {isEditing && (
                      <div className="mt-6 flex justify-end">
                        <Button type="submit">Salvar Alterações</Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="company">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Informações da Empresa</CardTitle>
                    <CardDescription>
                      Dados sobre sua empresa ou organização
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancelar' : 'Editar'}
                  </Button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company">Nome da Empresa</Label>
                          {isEditing ? (
                            <Input 
                              id="company"
                              name="company"
                              value={formData.company}
                              onChange={handleChange}
                            />
                          ) : (
                            <div className="px-3 py-2 rounded-md border bg-background">
                              {formData.company || '(Não informado)'}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="industry">Setor de Atuação</Label>
                          {isEditing ? (
                            <Input 
                              id="industry"
                              name="industry"
                              value={formData.industry}
                              onChange={handleChange}
                            />
                          ) : (
                            <div className="px-3 py-2 rounded-md border bg-background">
                              {formData.industry || '(Não informado)'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {isEditing && (
                      <div className="mt-6 flex justify-end">
                        <Button type="submit">Salvar Alterações</Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências</CardTitle>
                  <CardDescription>
                    Configure suas preferências de uso da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    Configurações de preferências estarão disponíveis em breve.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
