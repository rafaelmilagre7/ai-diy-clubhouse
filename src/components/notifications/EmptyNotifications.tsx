import { Bell, CheckCircle, AtSign } from 'lucide-react';

interface Props {
  filter: 'all' | 'unread' | 'mentions';
}

export const EmptyNotifications = ({ filter }: Props) => {
  const configs = {
    all: {
      icon: Bell,
      title: 'Nenhuma notificação',
      description: 'Você está em dia! Quando houver novidades, elas aparecerão aqui.'
    },
    unread: {
      icon: CheckCircle,
      title: 'Tudo lido!',
      description: 'Você leu todas as suas notificações. Parabéns!'
    },
    mentions: {
      icon: AtSign,
      title: 'Sem menções',
      description: 'Ninguém mencionou você recentemente.'
    }
  };
  
  const { icon: Icon, title, description } = configs[filter];
  
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="h-10 w-10 text-textSecondary/50" />
      </div>
      <h3 className="text-xl font-semibold text-textPrimary mb-2">{title}</h3>
      <p className="text-textSecondary max-w-sm">{description}</p>
    </div>
  );
};
