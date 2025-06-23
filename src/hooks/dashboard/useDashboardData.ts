
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { getUserRoleName } from "@/lib/supabase/types";

export const useDashboardData = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSolutions: 0,
    activeSolutions: 0,
    completedSolutions: 0
  });

  const isAdmin = getUserRoleName(profile) === 'admin';

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch solutions stats
        let query = supabase.from("solutions").select("id, published");
        
        if (!isAdmin) {
          query = query.eq("published", true);
        }
        
        const { data: solutions, error } = await query;
        
        if (error) throw error;
        
        setStats({
          totalSolutions: solutions?.length || 0,
          activeSolutions: solutions?.filter(s => s.published)?.length || 0,
          completedSolutions: 0 // TODO: Implement completion tracking
        });
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isAdmin]);

  return { stats, loading, isAdmin };
};
