
import { Mail, Users, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Invite } from "@/hooks/admin/invites/types";

interface InviteStatsProps {
  invites: Invite[];
}

const InviteStats = ({ invites }: InviteStatsProps) => {
  const totalInvites = invites.length;
  const usedInvites = invites.filter(invite => invite.used_at).length;
  const activeInvites = invites.filter(invite => 
    !invite.used_at && new Date(invite.expires_at) > new Date()
  ).length;
  const expiredInvites = invites.filter(invite => 
    !invite.used_at && new Date(invite.expires_at) <= new Date()
  ).length;

  const stats = [
    {
      label: "Total",
      value: totalInvites,
      icon: Mail,
      color: "text-blue-600"
    },
    {
      label: "Utilizados",
      value: usedInvites,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      label: "Ativos",
      value: activeInvites,
      icon: Clock,
      color: "text-orange-600"
    },
    {
      label: "Expirados",
      value: expiredInvites,
      icon: Users,
      color: "text-gray-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InviteStats;
