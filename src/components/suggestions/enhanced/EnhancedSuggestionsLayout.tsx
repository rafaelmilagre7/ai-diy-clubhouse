
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSuggestions } from '@/hooks/suggestions/useSuggestions';
import { SuggestionFilter } from '@/types/suggestionTypes';
import { EnhancedSuggestionsHeader } from './EnhancedSuggestionsHeader';
import { EnhancedSuggestionCard } from './EnhancedSuggestionCard';
import { SuggestionsEmptyState } from '../states/SuggestionsEmptyState';
import { SuggestionsPerformanceWrapper } from '../performance/SuggestionsPerformanceWrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const EnhancedSuggestionsLayout = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const {
    suggestions,
    isLoading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    refetch,
    error,
    isFetching,
    stats
  } = useSuggestions();

  const handleRetry = React.useCallback(() => {
    toast.info("Recarregando sugestões...");
    refetch();
  }, [refetch]);

  const handleFilterChange = React.useCallback((value: SuggestionFilter) => {
    setFilter(value);
  }, [setFilter]);

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value);
  }, [setSearchQuery]);

  // Enhanced Loading State
  if (isLoading) {
    return (
      <SuggestionsPerformanceWrapper>
        <div className="container py-8 space-y-8">
          <EnhancedSuggestionsHeader 
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            filter={filter}
            onFilterChange={handleFilterChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-80 bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-lg">
                  <div className="p-6 space-y-4 animate-pulse">
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 rounded-lg w-4/5" />
                      <div className="h-4 bg-gray-200 rounded w-2/5" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-4/5" />
                      <div className="h-4 bg-gray-200 rounded w-3/5" />
                    </div>
                    <div className="flex justify-between pt-6">
                      <div className="h-8 bg-gray-200 rounded-full w-20" />
                      <div className="h-8 bg-gray-200 rounded-full w-16" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SuggestionsPerformanceWrapper>
    );
  }

  return (
    <SuggestionsPerformanceWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container py-8 space-y-12">
          <EnhancedSuggestionsHeader 
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            filter={filter}
            onFilterChange={handleFilterChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert variant="destructive" className="mb-6 border-0 shadow-lg bg-red-50/80 backdrop-blur-sm">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="text-lg font-bold">Erro ao carregar sugestões</AlertTitle>
                <AlertDescription className="flex flex-col gap-4 mt-2">
                  <p>Não foi possível carregar as sugestões. Por favor, tente novamente.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRetry} 
                    className="gap-2 w-fit hover:bg-red-100"
                  >
                    <RefreshCw size={16} />
                    Tentar novamente
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          ) : suggestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <SuggestionsEmptyState searchQuery={searchQuery} />
            </motion.div>
          ) : (
            <>
              {/* Stats Overview */}
              {stats.total > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border-0 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-primary to-purple-600 text-white rounded-xl">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {stats.total} {stats.total === 1 ? 'sugestão encontrada' : 'sugestões encontradas'}
                        </h3>
                        <p className="text-gray-600">
                          {searchQuery ? `para "${searchQuery}"` : 'na comunidade'}
                        </p>
                      </div>
                    </div>
                    
                    {Object.keys(stats.byStatus).length > 1 && (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(stats.byStatus).map(([status, count]) => (
                          <div key={status} className="text-center">
                            <div className="text-sm font-bold text-gray-800">{count}</div>
                            <div className="text-xs text-gray-500 capitalize">{status}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Suggestions Grid */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={`${filter}-${searchQuery}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className={
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                      : "space-y-6"
                  }
                >
                  {suggestions.map((suggestion, index) => (
                    <EnhancedSuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      index={index}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Loading Indicator */}
              <AnimatePresence>
                {isFetching && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-8"
                  >
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                      />
                      <p className="text-sm font-medium text-gray-600">
                        Atualizando sugestões...
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Load More Indicator */}
              {suggestions.length > 9 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center py-8 border-t border-gray-200/50"
                >
                  <p className="text-gray-500 font-medium">
                    Mostrando {suggestions.length} {suggestions.length === 1 ? 'sugestão' : 'sugestões'}
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </SuggestionsPerformanceWrapper>
  );
};

export default EnhancedSuggestionsLayout;
