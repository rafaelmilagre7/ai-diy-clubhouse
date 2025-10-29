
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToastModern } from "@/hooks/useToastModern";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProfileImageUpload } from "@/components/profile/ProfileImageUpload";

const EditProfile = () => {
  const { profile, user, setProfile } = useAuth();
  const { showSuccess, showError } = useToastModern();
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

  const handleImageUpdate = (newImageUrl: string) => {
    setAvatarUrl(newImageUrl);
    showSuccess("Imagem atualizada", "Sua imagem de perfil foi alterada. Clique em Salvar para confirmar.");
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const updateData = {
        name: name.trim(),
        avatar_url: avatarUrl || null
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

      showSuccess("Perfil atualizado", "Suas informações foram atualizadas com sucesso.");

      navigate("/profile");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      showError("Erro ao atualizar perfil", "Não foi possível atualizar suas informações.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Editar Perfil</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Imagem de Perfil */}
        <div className="md:col-span-1">
          <ProfileImageUpload
            currentImageUrl={avatarUrl}
            userName={name}
            userId={user?.id}
            onImageUpdate={handleImageUpdate}
            disabled={isLoading}
          />
        </div>

        {/* Formulário de Edição */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium">
              Nome Completo
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome completo"
              maxLength={100}
              disabled={isLoading}
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
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Para alterar o email, entre em contato com o suporte
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button 
              onClick={handleUpdateProfile} 
              disabled={isLoading || !name.trim()}
              className="min-w-profile-button"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/profile")}
              disabled={isLoading}
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
