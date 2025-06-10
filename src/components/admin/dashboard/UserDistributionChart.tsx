
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/ui/chart";
import { Users, Crown, GraduationCap, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserDistributionChartProps {
  data: { role: string; count: number }[];
  loading: boolean;
}

export const UserDistributionChart = ({ data, loading }: UserDistributionChartProps) => {
  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'formacao':
        return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case 'member':
        return <User className="h-4 w-4 text-green-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Administradores';
      case 'formacao':
        return 'Formação';
      case 'member':
        return 'Membros';
      default:
        return role;
    }
  };

  const chartData = data.map((item, index) => ({
    name: getRoleDisplayName(item.role),
    value: item.count,
    fill: index === 0 ? '#0ABAB5' : index === 1 ? '#6366F1' : '#10B981'
  }));

  const totalUsers = data.reduce((sum, item) => sum + item.count, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Usuários</CardTitle>
          <CardDescription>Por tipo de acesso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Distribuição de Usuários
        </CardTitle>
        <CardDescription>
          Total de {totalUsers} usuários por tipo de acesso
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum dado de usuário disponível</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Lista de roles */}
            <div className="space-y-2">
              {data.map((item) => (
                <div key={item.role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(item.role)}
                    <span className="text-sm font-medium">
                      {getRoleDisplayName(item.role)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {item.count}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ({totalUsers > 0 ? Math.round((item.count / totalUsers) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Gráfico de pizza */}
            {chartData.length > 0 && (
              <div className="h-[200px]">
                <PieChart 
                  data={chartData}
                  category="value"
                  index="name"
                  valueFormatter={(value) => `${value} usuário${value !== 1 ? 's' : ''}`}
                  colors={['#0ABAB5', '#6366F1', '#10B981', '#F59E0B', '#EF4444']}
                  className="h-full"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
