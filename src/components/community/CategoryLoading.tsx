
export const CategoryLoading = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-6 border rounded-lg animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-muted rounded-lg"></div>
            <div className="w-8 h-4 bg-muted rounded"></div>
          </div>
          <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-full mb-1"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
};
