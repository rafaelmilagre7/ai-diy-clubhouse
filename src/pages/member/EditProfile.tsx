
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const EditProfile = () => {
  const { profile, user, setProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(profile?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleProfileImageUpload = async (filePath: string, fileName: string, fileSize: number) => {
    try {
      if (!user) return;

      setAvatarUrl(filePath);
      toast({
        title: "Imagem de perfil atualizada",
        description: "Sua imagem de perfil foi alterada. Clique em Salvar Alterações para confirmar.",
      });
    } catch (error) {
      console.error("Erro ao atualizar imagem de perfil:", error);
      toast({
        title: "Erro ao atualizar imagem",
        description: "Não foi possível atualizar sua imagem de perfil.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const updateData = {
        name: name,
        avatar_url: avatarUrl
      };

      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)
        .select("*")
        .single();

      if (error) throw error;

      // Atualizar o contexto de autenticação com os novos dados
      if (data && setProfile) {
        setProfile(data);
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informações de perfil foram atualizadas com sucesso.",
      });

      navigate("/profile");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Não foi possível atualizar suas informações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Editar Perfil</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Imagem de Perfil */}
        <div className="md:col-span-1 flex flex-col items-center">
          <Avatar className="w-40 h-40 mb-4">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <FileUpload
            bucketName="profile_images"
            folder={user?.id}
            onUploadComplete={handleProfileImageUpload}
            accept="image/*"
            maxSize={5}
            buttonText="Alterar Foto"
            fieldLabel="Selecione uma imagem de perfil"
          />
        </div>

        {/* Formulário de Edição */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium">
              Nome
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-muted-foreground">
              E-mail
            </label>
            <Input
              id="email"
              value={profile?.email || ""}
              disabled
              placeholder="Email não pode ser alterado"
            />
          </div>

          <div className="flex space-x-4 mt-6">
            <Button 
              variant="default" 
              onClick={handleUpdateProfile} 
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/profile")}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
