
import React from 'react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface ConditionalReferralInputProps {
  howFoundUs: string;
  referredBy: string;
  onReferredByChange: (value: string) => void;
}

export const ConditionalReferralInput: React.FC<ConditionalReferralInputProps> = ({
  howFoundUs,
  referredBy,
  onReferredByChange
}) => {
  const showReferralInput = howFoundUs === 'indicacao';

  return (
    <AnimatePresence>
      {showReferralInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="space-y-2"
        >
          <label className="block text-sm font-medium text-white">
            Quem te indicou? <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            value={referredBy}
            onChange={(e) => onReferredByChange(e.target.value)}
            placeholder="Nome de quem te indicou"
            className="h-12 bg-gray-800/50 border-gray-600 text-white focus:ring-viverblue/50"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
