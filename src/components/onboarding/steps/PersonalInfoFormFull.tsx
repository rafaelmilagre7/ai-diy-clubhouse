
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const estadosBrasil = [
  "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo", 
  "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba",
  "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul",
  "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"
];

const paises = ["Brasil"]; // Expandir se necessário
const fusos = [
  "Horário de Brasília (GMT-3)",
  "Fernando de Noronha (GMT-2)",
  "Manaus (GMT-4)",
  "Acre (GMT-5)",
];

export const PersonalInfoFormFull = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [pais, setPais] = useState("Brasil");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [fuso, setFuso] = useState("Horário de Brasília (GMT-3)");
  const [isLoading, setIsLoading] = useState(false);

  // Simula upload (futuro: armazenar no Supabase Storage)
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Preview - futuro, enviar para Supabase Storage:
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfilePic(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Salvar dados no Supabase (mock, implemente o request real conforme contexto do projeto)
    try {
      // TODO: Salvar info no onboarding_progress
      toast.success("Dados salvos com sucesso!");
      // Redirecionar para próxima etapa/avançar - implementar navegação real
    } catch (err: any) {
      toast.error("Erro ao enviar dados: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit} autoComplete="off">
      <div className="text-xl font-semibold text-gray-800 mb-2">
        Dados Pessoais
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1 space-y-3">
          <div>
            <Label htmlFor="nome">Nome Completo*</Label>
            <Input
              type="text"
              id="nome"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="email">Email*</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="telefone">Telefone/WhatsApp*</Label>
              <Input
                type="tel"
                id="telefone"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                type="url"
                id="linkedin"
                value={linkedin}
                onChange={e => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/seuperfil"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                type="text"
                id="instagram"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                placeholder="@seuinstagram"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="pais">País*</Label>
              <Select value={pais} onValueChange={setPais}>
                <SelectTrigger id="pais">
                  <SelectValue placeholder="Brasil" />
                </SelectTrigger>
                <SelectContent>
                  {paises.map((p, idx) => (
                    <SelectItem key={idx} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="estado">Estado*</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Selecione seu estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosBrasil.map((uf) => (
                    <SelectItem value={uf} key={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="cidade">Cidade*</Label>
              <Input
                type="text"
                id="cidade"
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                placeholder="Digite sua cidade"
                required
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="fuso">Fuso Horário*</Label>
              <Select value={fuso} onValueChange={setFuso}>
                <SelectTrigger id="fuso">
                  <SelectValue placeholder="Horário de Brasília (GMT-3)" />
                </SelectTrigger>
                <SelectContent>
                  {fusos.map((fusoItem, idx) => (
                    <SelectItem value={fusoItem} key={idx}>{fusoItem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* Avatar */}
        <div className="min-w-[160px] flex flex-col gap-2 items-center">
          <label className="flex flex-col items-center cursor-pointer group">
            <div className="w-28 h-28 bg-gray-100 rounded-full border border-[#0ABAB5] flex items-center justify-center overflow-hidden relative group-hover:opacity-80 transition-all mb-2">
              {profilePic ? (
                <img src={profilePic} alt="Foto perfil" className="object-cover w-full h-full rounded-full" />
              ) : (
                <div className="flex flex-col items-center text-gray-500 text-sm">
                  <svg className="mx-auto mb-1" width="32" height="32" fill="#0ABAB5" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4-1.6 4-4s-1.3-4-4-4-4 1.6-4 4 1.3 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z"/></svg>
                  Adicionar<br />foto de perfil
                </div>
              )}
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicChange} />
          </label>
          <span className="block text-xs text-gray-400 text-center">Adicionar foto de perfil</span>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" disabled className="min-w-[120px]">Anterior</Button>
        <Button type="submit" className="min-w-[120px]" disabled={isLoading}>
          {isLoading ? "Salvando..." : <span className="flex items-center gap-2">Próximo <svg width="17" height="17" className="inline" fill="#fff"><path d="M11.585 8l-4.293-4.293 1.414-1.414L15.414 8l-6.707 6.707-1.414-1.414z"/></svg></span>}
        </Button>
      </div>
    </form>
  );
};
