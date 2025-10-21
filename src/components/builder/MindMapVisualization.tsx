import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Branch {
  name: string;
  children?: string[];
}

interface MindMapData {
  central_idea: string;
  branches: Branch[];
}

interface MindMapVisualizationProps {
  mindMap: MindMapData;
}

export const MindMapVisualization: React.FC<MindMapVisualizationProps> = ({ mindMap }) => {
  const [expandedBranches, setExpandedBranches] = useState<Set<number>>(
    new Set(mindMap?.branches?.map((_, i) => i) || [])
  );

  const toggleBranch = (index: number) => {
    setExpandedBranches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (!mindMap || !mindMap.branches) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Mapa mental não disponível
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Central Idea */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 text-center"
      >
        <Circle className="h-6 w-6 mx-auto mb-2 text-primary fill-primary" />
        <h3 className="text-lg font-bold">{mindMap.central_idea}</h3>
      </motion.div>

      {/* Branches */}
      <div className="space-y-2 pl-4 border-l-2 border-border/30">
        {mindMap.branches.map((branch, index) => {
          const isExpanded = expandedBranches.has(index);
          const hasChildren = branch.children && branch.children.length > 0;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              {/* Branch Header */}
              <button
                onClick={() => hasChildren && toggleBranch(index)}
                className={`
                  w-full text-left p-3 rounded-lg border transition-all
                  ${hasChildren ? 'cursor-pointer hover:border-primary/30' : 'cursor-default'}
                  ${isExpanded && hasChildren ? 'bg-muted/50 border-primary/20' : 'bg-muted/30 border-border/50'}
                `}
              >
                <div className="flex items-center gap-2">
                  {hasChildren && (
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  )}
                  <span className="font-medium text-sm">{branch.name}</span>
                  {hasChildren && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {branch.children.length} {branch.children.length === 1 ? 'item' : 'itens'}
                    </span>
                  )}
                </div>
              </button>

              {/* Children */}
              <AnimatePresence>
                {isExpanded && hasChildren && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="pl-6 space-y-2 border-l-2 border-border/20"
                  >
                    {branch.children.map((child, childIndex) => (
                      <motion.div
                        key={childIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: childIndex * 0.05 }}
                        className="p-2 rounded text-sm text-foreground/80 bg-background/50 border border-border/30"
                      >
                        <div className="flex items-start gap-2">
                          <Circle className="h-2 w-2 mt-1.5 text-primary fill-primary flex-shrink-0" />
                          <span>{child}</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
