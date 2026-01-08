import { supabase } from "@/integrations/supabase/client";

export interface ProgressData {
  lesson_id: string;
  completion_percentage: number;
  quiz_score: number | null;
  updated_at: string;
  lessons: {
    id: string;
    title: string;
    difficulty_level: string;
    subject_id: string | null;
  } | null;
}

export interface DashboardStats {
  completedLessons: number;
  averageScore: number;
  nextLesson: ProgressData | null;
  inProgressLessons: ProgressData[];
  recentProgress: ProgressData[];
}

export async function fetchUserProgress(userId: string): Promise<ProgressData[]> {
  const { data, error } = await supabase
    .from("progress")
    .select(`
      lesson_id,
      completion_percentage,
      quiz_score,
      updated_at,
      lessons (
        id,
        title,
        difficulty_level,
        subject_id
      )
    `)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching progress:", error);
    return [];
  }

  return (data as ProgressData[]) || [];
}

export async function fetchNextAvailableLesson(userId: string): Promise<{ id: string; title: string } | null> {
  // Get all lessons the user has started but not completed
  const { data: inProgressData } = await supabase
    .from("progress")
    .select("lesson_id, completion_percentage")
    .eq("user_id", userId)
    .lt("completion_percentage", 100)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (inProgressData && inProgressData.length > 0) {
    // Fetch the lesson details
    const { data: lessonData } = await supabase
      .from("lessons")
      .select("id, title")
      .eq("id", inProgressData[0].lesson_id)
      .single();

    if (lessonData) {
      return lessonData;
    }
  }

  // If no in-progress lesson, get the first lesson user hasn't started
  const { data: progressData } = await supabase
    .from("progress")
    .select("lesson_id")
    .eq("user_id", userId);

  const completedLessonIds = progressData?.map(p => p.lesson_id) || [];

  const { data: nextLesson } = await supabase
    .from("lessons")
    .select("id, title")
    .order("order_index", { ascending: true })
    .limit(1);

  if (nextLesson && nextLesson.length > 0) {
    // Find first lesson not in progress
    const { data: allLessons } = await supabase
      .from("lessons")
      .select("id, title")
      .order("order_index", { ascending: true });

    const unstarted = allLessons?.find(l => !completedLessonIds.includes(l.id));
    return unstarted || null;
  }

  return null;
}

export function calculateDashboardStats(progress: ProgressData[]): Omit<DashboardStats, 'nextLesson'> {
  const completedLessons = progress.filter(p => p.completion_percentage === 100).length;
  
  const scoresWithValues = progress.filter(p => p.quiz_score !== null);
  const averageScore = scoresWithValues.length > 0
    ? Math.round(scoresWithValues.reduce((sum, p) => sum + (p.quiz_score || 0), 0) / scoresWithValues.length)
    : 0;

  const inProgressLessons = progress.filter(p => p.completion_percentage < 100);
  const recentProgress = progress.slice(0, 5);

  return {
    completedLessons,
    averageScore,
    inProgressLessons,
    recentProgress,
  };
}
