import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Target, Award, ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProgressData {
  lesson_id: string;
  completion_percentage: number;
  quiz_score: number | null;
  updated_at: string;
  lessons: {
    title: string;
    difficulty_level: string;
  } | null;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    const { data, error } = await supabase
      .from("progress")
      .select(`
        lesson_id,
        completion_percentage,
        quiz_score,
        updated_at,
        lessons (
          title,
          difficulty_level
        )
      `)
      .eq("user_id", user?.id)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setProgress(data as ProgressData[]);
    }
    setIsLoading(false);
  };

  const completedLessons = progress.filter((p) => p.completion_percentage === 100).length;
  const averageScore = progress.length > 0
    ? Math.round(
        progress
          .filter((p) => p.quiz_score !== null)
          .reduce((sum, p) => sum + (p.quiz_score || 0), 0) /
          Math.max(progress.filter((p) => p.quiz_score !== null).length, 1)
      )
    : 0;

  const nextLesson = progress.find((p) => p.completion_percentage < 100);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Track your learning progress</p>
          </header>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-3 mb-10">
            <StatCard
              title="Total Lessons Completed"
              value={completedLessons}
              variant="blue"
              icon={<BookOpen className="h-5 w-5 text-primary" />}
            />
            <StatCard
              title="Average Score"
              value={`${averageScore}%`}
              variant="teal"
              icon={<Target className="h-5 w-5 text-accent" />}
            />
            <StatCard
              title="Next Lesson Recommendation"
              value={nextLesson?.lessons?.title || "Binary Search"}
              variant="green"
              icon={<Award className="h-5 w-5 text-success" />}
            />
          </div>

          {/* Continue Learning Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-6">Continue Learning</h2>
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50">
              <p className="text-sm text-muted-foreground mb-2">Next Lesson</p>
              <h3 className="text-3xl font-bold text-foreground mb-6">
                {nextLesson?.lessons?.title || "Graph Algorithms"}
              </h3>
              <Link to="/lessons">
                <Button className="btn-primary flex items-center gap-2">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>

          {/* Recent Progress */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Recent Progress</h2>
            {progress.length > 0 ? (
              <div className="space-y-4">
                {progress.slice(0, 5).map((item) => (
                  <div
                    key={item.lesson_id}
                    className="flex items-center justify-between p-4 bg-card rounded-xl border border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <TrendingUp className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {item.lessons?.title || "Unknown Lesson"}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {item.lessons?.difficulty_level || "beginner"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">
                        {item.completion_percentage}%
                      </p>
                      <div className="w-24 h-2 rounded-full bg-secondary mt-1">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{ width: `${item.completion_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No progress yet</h3>
                <p className="text-muted-foreground mb-6">Start your first lesson to track progress</p>
                <Link to="/lessons">
                  <Button className="btn-primary">Browse Lessons</Button>
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
