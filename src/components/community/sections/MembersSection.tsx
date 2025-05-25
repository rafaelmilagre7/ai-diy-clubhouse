
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Users, MapPin, Briefcase } from 'lucide-react';

export const MembersSection = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Membros da Comunidade</h2>
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Minhas Conexões
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar membros por nome, empresa ou habilidade..."
          className="pl-10"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mock member cards */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`/avatars/member${i + 1}.jpg`} />
                  <AvatarFallback>M{i + 1}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Membro {i + 1}</h3>
                  <p className="text-muted-foreground">Especialista em IA</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  Tech Innovations Ltd.
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  São Paulo, Brasil
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                <Badge variant="secondary">Machine Learning</Badge>
                <Badge variant="secondary">Python</Badge>
                <Badge variant="secondary">ChatGPT</Badge>
              </div>
              
              <Button className="w-full" variant="outline">
                Conectar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
