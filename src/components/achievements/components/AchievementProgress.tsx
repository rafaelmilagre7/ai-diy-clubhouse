
interface AchievementProgressProps {
  currentCount?: number;
  requiredCount: number;
}

export const AchievementProgress = ({ currentCount = 0, requiredCount }: AchievementProgressProps) => {
  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Progresso</span>
        <span>{currentCount}/{requiredCount}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full w-full">
        <div 
          className="h-full bg-gray-300 rounded-full" 
          style={{
            width: `${Math.min((currentCount / requiredCount) * 100, 100)}%`
          }}
        />
      </div>
    </div>
  );
};
