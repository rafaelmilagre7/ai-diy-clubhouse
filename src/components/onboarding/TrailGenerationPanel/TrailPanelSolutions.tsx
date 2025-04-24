
import React from "react";
import { TrailCardList } from "@/components/dashboard/TrailCardList";
import { useNavigate } from "react-router-dom";

export function TrailPanelSolutions({
  solutions
}: {
  solutions: any[];
}) {
  const navigate = useNavigate();

  return (
    <TrailCardList
      solutions={solutions}
      onSolutionClick={(id) => navigate(`/solution/${id}`)}
      onSeeAll={() => navigate("/solutions")}
    />
  );
}
