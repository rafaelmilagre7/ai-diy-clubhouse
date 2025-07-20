
export type CommunityFilterType = "recentes" | "populares" | "sem-respostas" | "resolvidos";

export interface CommunityFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: CommunityFilterType;
  onFilterChange: (filter: CommunityFilterType) => void;
}

export interface UseCommunityTopicsParams {
  activeTab: "all" | "my-topics";
  selectedFilter: CommunityFilterType;
  searchQuery: string;
  categorySlug?: string;
}
