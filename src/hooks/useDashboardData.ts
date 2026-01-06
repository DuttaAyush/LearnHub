import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchUserProgress,
  fetchNextAvailableLesson,
  calculateDashboardStats,
  ProgressData,
  DashboardStats,
} from "@/services/dashboardService";

interface UseDashboardDataReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataReturn {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      const [progress, nextLesson] = await Promise.all([
        fetchUserProgress(user.id),
        fetchNextAvailableLesson(user.id),
      ]);

      const calculatedStats = calculateDashboardStats(progress);
      
      setStats({
        ...calculatedStats,
        nextLesson: nextLesson 
          ? {
              lesson_id: nextLesson.id,
              completion_percentage: 0,
              quiz_score: null,
              updated_at: new Date().toISOString(),
              lessons: {
                id: nextLesson.id,
                title: nextLesson.title,
                difficulty_level: "beginner",
                subject_id: null,
              },
            }
          : null,
      });
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscription for progress updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`dashboard-progress-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "progress",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch all data when progress changes
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchData]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchData,
  };
}
