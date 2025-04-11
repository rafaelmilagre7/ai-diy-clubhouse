
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, UserProfile } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  MoreVertical,
  User,
  Shield,
  MailIcon,
  Trash2,
  UserX,
  UserCog,
  UserPlus,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";

const UserManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  
  // Mock data for now
  useEffect(() => {
    const mockUsers = [
      {
        id: "1",
        email: "admin@viverdeiaclub.com.br",
        name: "Admin User",
        avatar_url: null,
        role: "admin",
        company_name: "VIVER DE IA Club",
        industry: "Educação",
        created_at: "2025-01-01T00:00:00Z",
      },
      {
        id: "2",
        email: "joao.silva@example.com",
        name: "João Silva",
        avatar_url: null,
        role: "member",
        company_name: "Tech Solutions",
        industry: "Tecnologia",
        created_at: "2025-01-15T10:30:00Z",
      },
      {
        id: "3",
        email: "maria.oliveira@example.com",
        name: "Maria Oliveira",
        avatar_url: null,
        role: "member",
        company_name: "Marketing Pro",
        industry: "Marketing",
        created_at: "2025-02-10T14:45:00Z",
      },
      {
        id: "4",
        email: "pedro.santos@example.com",
        name: "Pedro Santos",
        avatar_url: null,
        role: "member",
        company_name: "Consultoria Santos",
        industry: "Consultoria",
        created_at: "2025-02-20T09:15:00Z",
      },
      {
        id: "5",
        email: "ana.pereira@example.com",
        name: "Ana Pereira",
        avatar_url: null,
        role: "member",
        company_name: "Pereira Imóveis",
        industry: "Imobiliário",
        created_at: "2025-03-05T16:20:00Z",
      },
    ] as UserProfile[];
    
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    setLoading(false);
  }, []);
  
  // Filter users when search or role filter changes
  useEffect(() => {
    let filtered = [...users];
    
    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          (user.company_name && user.company_name.toLowerCase().includes(query)) ||
          (user.industry && user.industry.toLowerCase().includes(query))
      );
    }
    
    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, users]);
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };
  
  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };
  
  const handleUpdateRole = async (userId: string, newRole: "admin" | "member") => {
    try {
      // In a real implementation, this would update the role in Supabase
      
      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      toast({
        title: "Função atualizada",
        description: `Usuário atualizado para ${newRole === "admin" ? "Administrador" : "Membro"}.`,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Erro ao atualizar função",
        description: "Ocorreu um erro ao tentar atualizar a função do usuário.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuários</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os membros e administradores da plataforma
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar usuários..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as funções</SelectItem>
            <SelectItem value="admin">Administradores</SelectItem>
            <SelectItem value="member">Membros</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Mais Filtros
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Membro desde</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.company_name || "-"}</TableCell>
                  <TableCell>
                    {user.role === "admin" ? (
                      <Badge variant="outline" className="bg-viverblue/10 text-viverblue border-viverblue/30">
                        <Shield className="mr-1 h-3 w-3" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                        <User className="mr-1 h-3 w-3" />
                        Membro
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewUser(user)}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Ver detalhes</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MailIcon className="mr-2 h-4 w-4" />
                          <span>Enviar mensagem</span>
                        </DropdownMenuItem>
                        {user.role === "member" ? (
                          <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "admin")}>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Tornar admin</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "member")}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Tornar membro</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <UserX className="mr-2 h-4 w-4" />
                          <span>Desativar conta</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <UserCog className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">Nenhum usuário encontrado</h3>
                    <p className="text-muted-foreground mt-1">
                      {searchQuery || roleFilter !== "all"
                        ? "Tente mudar os filtros para encontrar outros usuários."
                        : "Não há usuários cadastrados no sistema."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* User details dialog */}
      {selectedUser && (
        <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Detalhes do Usuário</DialogTitle>
              <DialogDescription>
                Informações detalhadas e estatísticas do usuário.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center py-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={selectedUser.avatar_url || undefined} />
                <AvatarFallback className="text-xl">{getInitials(selectedUser.name)}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold mt-4">{selectedUser.name}</h2>
              <p className="text-muted-foreground">{selectedUser.email}</p>
              
              <div className="mt-2">
                {selectedUser.role === "admin" ? (
                  <Badge variant="outline" className="bg-viverblue/10 text-viverblue border-viverblue/30">
                    <Shield className="mr-1 h-3 w-3" />
                    Administrador
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                    <User className="mr-1 h-3 w-3" />
                    Membro
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Empresa</p>
                <p className="font-medium">{selectedUser.company_name || "Não informado"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Indústria</p>
                <p className="font-medium">{selectedUser.industry || "Não informado"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Membro desde</p>
                <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  Ativo
                </p>
              </div>
            </div>
            
            <div className="space-y-2 py-2">
              <h3 className="font-medium">Estatísticas</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-md border p-3 text-center">
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-muted-foreground">Implementações</p>
                </div>
                <div className="rounded-md border p-3 text-center">
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                </div>
                <div className="rounded-md border p-3 text-center">
                  <p className="text-2xl font-bold">67%</p>
                  <p className="text-xs text-muted-foreground">Taxa de conclusão</p>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" className="sm:w-auto">
                <MailIcon className="mr-2 h-4 w-4" />
                Enviar mensagem
              </Button>
              {selectedUser.role === "member" ? (
                <Button onClick={() => handleUpdateRole(selectedUser.id, "admin")}>
                  <Shield className="mr-2 h-4 w-4" />
                  Tornar admin
                </Button>
              ) : (
                <Button onClick={() => handleUpdateRole(selectedUser.id, "member")}>
                  <User className="mr-2 h-4 w-4" />
                  Tornar membro
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserManagement;
