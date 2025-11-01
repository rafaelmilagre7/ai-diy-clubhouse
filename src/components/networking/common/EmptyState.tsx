import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="text-center py-20 space-y-4"
  >
    <motion.div 
      className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-aurora/10 border border-aurora/20"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
    >
      <Icon className="w-8 h-8 text-aurora" aria-hidden="true" />
    </motion.div>
    <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
    <p className="text-text-muted max-w-md mx-auto">{description}</p>
    {actionLabel && onAction && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button 
          onClick={onAction} 
          variant="outline" 
          className="gap-2 focus-visible:ring-2 focus-visible:ring-aurora focus-visible:ring-offset-2"
        >
          {actionLabel}
        </Button>
      </motion.div>
    )}
  </motion.div>
);
