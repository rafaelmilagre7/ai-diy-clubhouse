
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MessageSquareMore, 
  Send, 
  Plus,
  MoreHorizontal,
  Archive,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getInitials } from '@/utils/user';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  created_at: string;
  is_own: boolean;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar_url?: string;
    is_online?: boolean;
  };
  last_message: {
    content: string;
    created_at: string;
    is_own: boolean;
  };
  unread_count: number;
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    participant: {
      id: '1',
      name: 'Ana Costa',
      avatar_url: undefined,
      is_online: true
    },
    last_message: {
      content: 'Perfeito! Obrigada pela ajuda com a implementação.',
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      is_own: false
    },
    unread_count: 2
  },
  {
    id: '2',
    participant: {
      id: '2',
      name: 'Pedro Silva',
      avatar_url: undefined,
      is_online: false
    },
    last_message: {
      content: 'Vou testar e te dou um feedback.',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      is_own: true
    },
    unread_count: 0
  },
  {
    id: '3',
    participant: {
      id: '3',
      name: 'Maria Santos',
      avatar_url: undefined,
      is_online: true
    },
    last_message: {
      content: 'Consegui resolver o problema! Muito obrigada.',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      is_own: false
    },
    unread_count: 0
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Olá! Vi sua resposta sobre IA no e-commerce e gostaria de trocar uma ideia.',
    sender_id: '1',
    sender_name: 'Ana Costa',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    is_own: false
  },
  {
    id: '2',
    content: 'Oi Ana! Claro, seria um prazer conversar sobre isso. Qual aspecto específico te interessa mais?',
    sender_id: 'me',
    sender_name: 'Você',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    is_own: true
  },
  {
    id: '3',
    content: 'Estou particularmente interessada em como implementar recomendações personalizadas.',
    sender_id: '1',
    sender_name: 'Ana Costa',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    is_own: false
  },
  {
    id: '4',
    content: 'Perfeito! Obrigada pela ajuda com a implementação.',
    sender_id: '1',
    sender_name: 'Ana Costa',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    is_own: false
  }
];

const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'Data inválida';
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      sender_id: 'me',
      sender_name: 'Você',
      created_at: new Date().toISOString(),
      is_own: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Atualizar a conversa
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation 
          ? {
              ...conv,
              last_message: {
                content: message.content,
                created_at: message.created_at,
                is_own: true
              }
            }
          : conv
      )
    );
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mensagens</h1>
        <p className="text-muted-foreground">
          Converse diretamente com outros membros da comunidade
        </p>
      </div>
      
      <CommunityNavigation />
      
      <div className="mt-6">
        <Card className="h-[600px]">
          <CardContent className="p-0 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
              {/* Lista de conversas */}
              <div className="border-r bg-muted/10">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Conversas</h3>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar conversas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="overflow-y-auto h-[calc(600px-140px)]">
                  {filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <MessageSquareMore className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>Nenhuma conversa encontrada</p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedConversation === conversation.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <div className="flex gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversation.participant.avatar_url || ''} />
                              <AvatarFallback>
                                {getInitials(conversation.participant.name)}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.participant.is_online && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm truncate">
                                {conversation.participant.name}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(conversation.last_message.created_at)}
                                </span>
                                {conversation.unread_count > 0 && (
                                  <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                    {conversation.unread_count}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {conversation.last_message.is_own ? 'Você: ' : ''}
                              {conversation.last_message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Área de mensagens */}
              <div className="lg:col-span-2 flex flex-col">
                {selectedConv ? (
                  <>
                    {/* Header da conversa */}
                    <div className="p-4 border-b bg-muted/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={selectedConv.participant.avatar_url || ''} />
                              <AvatarFallback>
                                {getInitials(selectedConv.participant.name)}
                              </AvatarFallback>
                            </Avatar>
                            {selectedConv.participant.is_online && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{selectedConv.participant.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {selectedConv.participant.is_online ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Archive className="h-4 w-4 mr-2" />
                              Arquivar conversa
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir conversa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Mensagens */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.is_own ? 'justify-end' : ''}`}
                        >
                          {!message.is_own && (
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={selectedConv.participant.avatar_url || ''} />
                              <AvatarFallback className="text-xs">
                                {getInitials(selectedConv.participant.name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-xs lg:max-w-md ${message.is_own ? 'order-first' : ''}`}>
                            <div
                              className={`p-3 rounded-lg ${
                                message.is_own
                                  ? 'bg-primary text-primary-foreground ml-auto'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 text-right">
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Campo de nova mensagem */}
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Digite sua mensagem..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          rows={2}
                          className="resize-none"
                        />
                        <Button 
                          size="sm" 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center">
                    <div>
                      <MessageSquareMore className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                      <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
                      <p className="text-muted-foreground">
                        Escolha uma conversa da lista para começar a enviar mensagens
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessagesPage;
