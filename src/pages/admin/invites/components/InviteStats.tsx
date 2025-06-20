
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle, Users } from "lucide-react";
import { Invite } from "@/hooks/admin/invites/types";

interface InviteStatsProps {
  invites: Invite[];
}

const InviteStats = ({ invites }: InviteStatsProps) => {
  const totalInvites = invites.length;
  const usedInvites = invites.filter(invite => invite.used_at).length;
  const expiredInvites = invites.filter(invite => 
    !invite.used_at && new Date(invite.expires_at) < new Date()
  ).length;
  const pendingInvites = invites.filter(invite => 
    !invite.used_at && new Date(invite.expires_at) > new Date()
  ).length;

  const stats = [
    {
      title: "Total de Convites",
      value: totalInvites,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Convites Usados",
      value: usedInvites,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Convites Pendentes",
      value: pendingInvites,
      icon: Clock,
      color: "text-yellow-600"
    },
    {
      title: "Convites Expirados",
      value: expiredInvites,
      icon: XCircle,
      color: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InviteStats;
