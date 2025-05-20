
import React from "react";
import { MessageSquare, Users, BarChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ForumStatisticsProps {
  topicCount: number;
  postCount: number;
  activeUserCount: number;
  isLoading: boolean;
}

export const ForumStatistics = ({
  topicCount,
  postCount,
  activeUserCount,
  isLoading
}: ForumStatisticsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <Card className="p-4 flex items-center gap-3">
        <div className="bg-primary/20 p-3 rounded-full">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Tópicos</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-bold">{topicCount}</p>
          )}
        </div>
      </Card>
      
      <Card className="p-4 flex items-center gap-3">
        <div className="bg-primary/20 p-3 rounded-full">
          <BarChart className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Mensagens</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-bold">{postCount}</p>
          )}
        </div>
      </Card>
      
      <Card className="p-4 flex items-center gap-3">
        <div className="bg-primary/20 p-3 rounded-full">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Membros ativos</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-bold">{activeUserCount}</p>
          )}
        </div>
      </Card>
    </div>
  );
};
