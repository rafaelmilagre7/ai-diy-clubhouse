import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 bg-surface-elevated/50 border-aurora/20 hover:border-aurora/40 transition-all hover:shadow-lg backdrop-blur-sm">
        <div className="flex gap-4">
          <div className="flex-shrink-0 p-3 rounded-xl bg-aurora/10 border border-aurora/20">
            <Icon className="w-6 h-6 text-aurora" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-text-primary">{title}</h4>
            <p className="text-sm text-text-muted leading-relaxed">{description}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
