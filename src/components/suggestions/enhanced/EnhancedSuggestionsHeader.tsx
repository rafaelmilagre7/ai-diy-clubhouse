
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { SuggestionFilter } from '@/types/suggestionTypes';
import { 
  Plus, 
  Search, 
  TrendingUp, 
  Clock, 
  Settings, 
  CheckCircle, 
  Sparkles,
  Filter,
  Grid3x3,
  List,
  SortAsc,
  Zap
} from 'lucide-react';

interface EnhancedSuggestionsHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filter: SuggestionFilter;
  onFilterChange: (value: SuggestionFilter) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export const EnhancedSuggestionsHeader: React.FC<EnhancedSuggestionsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  viewMode = 'grid',
  onViewModeChange
}) => {
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filterOptions = [
    { value: 'popular', label: 'Populares', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
    { value: 'recent', label: 'Recentes', icon: Clock, color: 'from-blue-500 to-cyan-500' },
    { value: 'in_development', label: 'Em Desenvolvimento', icon: Settings, color: 'from-orange-500 to-yellow-500' },
    { value: 'completed', label: 'Implementadas', icon: CheckCircle, color: 'from-green-500 to-emerald-500' }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section with Animated Background */}
      <motion.div 
        className="relative text-center space-y-6 py-12 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated Background Gradient */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 rounded-3xl"
          animate={{ 
            background: [
              "linear-gradient(45deg, rgba(0,234,217,0.05), rgba(168,85,247,0.05), rgba(236,72,153,0.05))",
              "linear-gradient(90deg, rgba(168,85,247,0.05), rgba(236,72,153,0.05), rgba(0,234,217,0.05))",
              "linear-gradient(135deg, rgba(236,72,153,0.05), rgba(0,234,217,0.05), rgba(168,85,247,0.05))"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/20 rounded-full"
              animate={{
                y: [0, -100, 0],
                x: [0, Math.sin(i) * 50, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3
              }}
              style={{
                left: `${10 + (i * 8)}%`,
                top: '80%'
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-purple-500/10 backdrop-blur-sm text-primary rounded-full text-sm font-bold mb-6 border border-primary/20"
          >
            <Sparkles className="h-5 w-5" />
            Melhore a plataforma
            <Zap className="h-4 w-4" />
          </motion.div>

          <motion.h1 
            className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-800 via-primary to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Sugestões da Comunidade
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Compartilhe suas ideias e ajude a tornar nossa plataforma ainda melhor. 
            <span className="text-primary font-semibold"> Sua opinião faz a diferença!</span>
          </motion.p>
        </div>
      </motion.div>

      {/* Enhanced Controls */}
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {/* Search and Actions Row */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          {/* Enhanced Search */}
          <motion.div 
            className="relative w-full lg:w-96"
            whileFocus={{ scale: 1.02 }}
          >
            <div className={`
              relative transition-all duration-300 
              ${isSearchFocused ? 'scale-105 shadow-lg' : 'shadow-md'}
            `}>
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
              <Input
                placeholder="Buscar sugestões..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="pl-12 h-14 bg-white/80 backdrop-blur-sm border-0 rounded-2xl text-lg font-medium shadow-lg focus:bg-white/95 transition-all duration-300"
              />
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-purple-500/20 -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: isSearchFocused ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>

          {/* View Controls */}
          <div className="flex items-center gap-4">
            {onViewModeChange && (
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onViewModeChange('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3x3 className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onViewModeChange('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="h-5 w-5" />
                </motion.button>
              </div>
            )}

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => navigate('/suggestions/new')}
                size="lg"
                className="gap-3 font-bold text-lg px-8 py-4 h-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl"
              >
                <Plus className="h-6 w-6" />
                Nova Sugestão
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
          {filterOptions.map((option, index) => {
            const Icon = option.icon;
            const isActive = filter === option.value;
            
            return (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={isActive ? "default" : "outline"}
                  onClick={() => onFilterChange(option.value as SuggestionFilter)}
                  className={`
                    gap-3 h-12 px-6 rounded-2xl font-semibold transition-all duration-300
                    ${isActive 
                      ? `bg-gradient-to-r ${option.color} text-white shadow-lg border-0` 
                      : 'bg-white/80 backdrop-blur-sm hover:bg-white border-gray-200 shadow-md hover:shadow-lg'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{option.label}</span>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
