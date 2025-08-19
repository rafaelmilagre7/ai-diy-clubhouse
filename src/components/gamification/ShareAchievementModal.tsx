import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Trophy, Star, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ShareAchievementModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
}

export const ShareAchievementModal = ({
  achievement,
  isOpen,
  onClose,
  onShare
}: ShareAchievementModalProps) => {
  if (!achievement) return null;

  const rarityColors = {
    common: 'bg-slate-100 text-slate-700 border-slate-300',
    rare: 'bg-blue-100 text-blue-700 border-blue-300',
    epic: 'bg-purple-100 text-purple-700 border-purple-300',
    legendary: 'bg-amber-100 text-amber-700 border-amber-300'
  };

  const rarityGlow = {
    common: 'shadow-slate-500/20',
    rare: 'shadow-blue-500/30',
    epic: 'shadow-purple-500/40',
    legendary: 'shadow-amber-500/50'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            🎉 Conquista Desbloqueada!
          </DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-6 py-4">
          {/* Ícone da conquista com animação */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 10,
              delay: 0.2 
            }}
            className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-2xl ${rarityGlow[achievement.rarity || 'common']}`}
          >
            <span className="text-4xl">{achievement.icon}</span>
          </motion.div>

          {/* Título e descrição */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <h3 className="text-2xl font-bold text-foreground">
              {achievement.title}
            </h3>
            <p className="text-muted-foreground text-sm">
              {achievement.description}
            </p>
          </motion.div>

          {/* Badge de raridade e pontos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-3"
          >
            {achievement.rarity && (
              <Badge className={rarityColors[achievement.rarity]}>
                <Star className="w-3 h-3 mr-1" />
                {achievement.rarity.toUpperCase()}
              </Badge>
            )}
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
              <Trophy className="w-3 h-3 mr-1" />
              +{achievement.points} XP
            </Badge>
          </motion.div>

          {/* Botões de ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-3 pt-4"
          >
            <Button
              onClick={onShare}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar Conquista
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Continuar
            </Button>
          </motion.div>

          {/* Efeito de confete */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ 
              duration: 2,
              times: [0, 0.5, 1],
              delay: 0.1
            }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: '50%', 
                  y: '50%',
                  scale: 0,
                  rotate: 0
                }}
                animate={{ 
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: [0, 1, 0],
                  rotate: 360
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut'
                }}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: [
                    '#3B82F6', '#8B5CF6', '#EF4444', 
                    '#F59E0B', '#10B981', '#F97316'
                  ][Math.floor(Math.random() * 6)]
                }}
              />
            ))}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};