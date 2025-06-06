
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { useTrailEnrichment } from "@/hooks/implementation/useTrailEnrichment";
import { useTrailSolutionsEnrichment } from "@/hooks/implementation/useTrailSolutionsEnrichment";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { useAuth } from "@/contexts/auth";
import { TrailHeroSection } from "./TrailHeroSection";
import { TrailProgressDashboard } from "./TrailProgressDashboard";
import { InteractiveTrailCard } from "./InteractiveTrailCard";
import { TrailFiltersBar } from "./TrailFiltersBar";
import { TrailWelcomePrompt } from "./TrailWelcomePrompt";
import { TrailStatsOverview } from "./TrailStatsOverview";
import { TrailLoadingState } from "../TrailLoadingState";
import { TrailErrorFallback } from "../TrailErrorFallback";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export const RedesignedImplementationTrailPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Trail data
  const { 
    trail, 
    isLoading, 
    regenerating, 
    error, 
    hasContent, 
    refreshTrail, 
    generateImplementationTrail 
  } = useImplementationTrail();
  
  // Solutions data
  const { solutions: allSolutions, loading: solutionsLoading } = useSolutionsData();
  
  // Enriched data
  const { enrichedLessons, isLoading: lessonsLoading } = useTrailEnrichment(trail);
  const { enrichedSolutions, isLoading: solutionsEnrichmentLoading } = useTrailSolutionsEnrichment(trail);

  // Local state for filters and interactions
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Combine all trail items
  const allTrailItems = useMemo(() => {
    const items: any[] = [];
    
    // Add enriched solutions
    if (enrichedSolutions) {
      enrichedSolutions.forEach(solution => {
        items.push({
          ...solution,
          type: 'solution' as const,
          isCompleted: false, // TODO: Get from user progress
          isFavorited: favorites.has(solution.id)
        });
      });
    }
    
    // Add enriched lessons
    if (enrichedLessons) {
      enrichedLessons.forEach(lesson => {
        items.push({
          ...lesson,
          type: 'lesson' as const,
          isCompleted: false, // TODO: Get from user progress
          isFavorited: favorites.has(lesson.id)
        });
      });
    }
    
    return items.sort((a, b) => (a.priority || 999) - (b.priority || 999));
  }, [enrichedSolutions, enrichedLessons, favorites]);

  // Apply filters
  const filteredItems = useMemo(() => {
    return allTrailItems.filter(item => {
      // Search filter
      if (searchQuery && !item.title?.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !item.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (selectedType !== "all" && item.type !== selectedType) {
        return false;
      }
      
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      
      // Difficulty filter
      if (selectedDifficulty !== "all" && item.difficulty !== selectedDifficulty) {
        return false;
      }
      
      // Favorites filter
      if (showFavoritesOnly && !item.isFavorited) {
        return false;
      }
      
      return true;
    });
  }, [allTrailItems, searchQuery, selectedType, selectedCategory, selectedDifficulty, showFavoritesOnly]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSolutions = enrichedSolutions?.length || 0;
    const totalLessons = enrichedLessons?.length || 0;
    const completedSolutions = 0; // TODO: Get from user progress
    const completedLessons = 0; // TODO: Get from user progress
    
    return {
      totalItems: totalSolutions + totalLessons,
      avgCompletionTime: 40, // Example data
      successRate: 87, // Example data
      activeUsers: 1247, // Example data
      totalSolutions,
      totalLessons,
      userProgress: 0, // TODO: Calculate actual progress
      streak: 3, // TODO: Get from user data
      completedSolutions,
      completedLessons,
      estimatedTime: 25, // TODO: Calculate from items
      currentStreak: 3 // TODO: Get from user data
    };
  }, [enrichedSolutions, enrichedLessons]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedType !== "all") count++;
    if (selectedCategory !== "all") count++;
    if (selectedDifficulty !== "all") count++;
    if (showFavoritesOnly) count++;
    return count;
  }, [selectedType, selectedCategory, selectedDifficulty, showFavoritesOnly]);

  // Event handlers
  const handleGenerateTrail = async () => {
    try {
      await generateImplementationTrail();
    } catch (error) {
      console.error('Erro ao gerar trilha:', error);
    }
  };

  const handleItemClick = (id: string, type: 'solution' | 'lesson') => {
    if (type === 'solution') {
      navigate(`/solution/${id}`);
    } else {
      navigate(`/learning/lesson/${id}`);
    }
  };

  const handleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedDifficulty("all");
    setSelectedType("all");
    setShowFavoritesOnly(false);
  };

  // Loading states
  if (isLoading || regenerating) {
    return <TrailLoadingState isRegenerating={regenerating} />;
  }

  // Error state
  if (error) {
    return (
      <TrailErrorFallback 
        error={error}
        onRetry={() => refreshTrail(true)}
        onRegenerate={handleGenerateTrail}
      />
    );
  }

  // No trail generated yet
  if (!hasContent) {
    return (
      <div className="container py-8 space-y-8">
        <TrailHeroSection 
          hasTrail={false}
          onGenerateTrail={handleGenerateTrail}
        />
        <TrailWelcomePrompt 
          onGenerateTrail={handleGenerateTrail}
        />
        <TrailStatsOverview stats={stats} />
      </div>
    );
  }

  // Main trail display
  return (
    <div className="container py-8 space-y-8">
      {/* Hero Section */}
      <TrailHeroSection 
        hasTrail={hasContent}
        onGenerateTrail={handleGenerateTrail}
      />

      {/* Progress Dashboard */}
      <TrailProgressDashboard 
        totalSolutions={stats.totalSolutions}
        completedSolutions={stats.completedSolutions}
        totalLessons={stats.totalLessons}
        completedLessons={stats.completedLessons}
        estimatedTime={stats.estimatedTime}
        currentStreak={stats.currentStreak}
      />

      {/* Stats Overview */}
      <TrailStatsOverview stats={stats} />

      {/* Filters */}
      <TrailFiltersBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Trail Items */}
      <div className="space-y-4">
        {solutionsEnrichmentLoading || lessonsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-viverblue mr-3" />
            <span className="text-gray-300">Carregando itens da trilha...</span>
          </div>
        ) : filteredItems.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={`${item.type}-${item.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <InteractiveTrailCard 
                  item={item}
                  onClick={(id) => handleItemClick(id, item.type)}
                  onFavorite={handleFavorite}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-400"
          >
            <p>Nenhum item encontrado com os filtros aplicados.</p>
            {activeFiltersCount > 0 && (
              <button 
                onClick={handleClearFilters}
                className="text-viverblue hover:underline mt-2"
              >
                Limpar filtros
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
