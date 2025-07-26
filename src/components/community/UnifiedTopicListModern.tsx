
import { TopicItemModern } from "./TopicItemModern";
import { TopicListSkeleton } from "./TopicListSkeleton";
import { TopicListError } from "./TopicListError";
import { EmptyTopicsStateModern } from "./EmptyTopicsStateModern";
import { CommunityTopic } from "@/types/communityTypes";
import { Separator } from "@/components/ui/separator";
import { Pin, Star } from "lucide-react";
import { motion } from "framer-motion";

interface UnifiedTopicListModernProps {
  topics: CommunityTopic[];
  isLoading: boolean;
  error: any;
  refetch: () => void;
  searchQuery: string;
  showPinned?: boolean;
}

export const UnifiedTopicListModern = ({ 
  topics, 
  isLoading, 
  error, 
  refetch, 
  searchQuery,
  showPinned = true 
}: UnifiedTopicListModernProps) => {
  if (isLoading) {
    return <TopicListSkeleton />;
  }

  if (error) {
    return <TopicListError onRetry={refetch} />;
  }

  if (!topics || topics.length === 0) {
    return <EmptyTopicsStateModern searchQuery={searchQuery} />;
  }

  const pinnedTopics = showPinned ? topics.filter(topic => topic.is_pinned) : [];
  const regularTopics = showPinned ? topics.filter(topic => !topic.is_pinned) : topics;

  return (
    <div className="space-y-6">
      {pinnedTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Pinned Section Header */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl border border-amber-500/20">
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg">
              <Pin className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-700">Tópicos Fixados</h3>
              <p className="text-sm text-amber-600/80">Importantes para toda a comunidade</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {pinnedTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TopicItemModern topic={topic} isPinned />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {regularTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: pinnedTopics.length > 0 ? 0.3 : 0 }}
        >
          {pinnedTopics.length > 0 && (
            <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm rounded-2xl border border-primary/20">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">Todas as Discussões</h3>
                <p className="text-sm text-muted-foreground">Participe das conversas da comunidade</p>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {regularTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TopicItemModern topic={topic} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
