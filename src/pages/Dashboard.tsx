import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { BookOpen, Target, Award, ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { stats, isLoading: dataLoading, error } = useDashboardData();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Show loading state
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
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

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              {error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-3 mb-10">
            <StatCard
              title="Total Lessons Completed"
              value={stats?.completedLessons ?? 0}
              variant="blue"
              icon={<BookOpen className="h-5 w-5 text-primary" />}
            />
            <StatCard
              title="Average Quiz Score"
              value={stats?.averageScore ? `${stats.averageScore}%` : "—"}
              variant="teal"
              icon={<Target className="h-5 w-5 text-accent" />}
            />
            <StatCard
              title="Next Lesson"
              value={stats?.nextLesson?.lessons?.title ?? "No lessons available"}
              variant="green"
              icon={<Award className="h-5 w-5 text-success" />}
            />
          </div>

          {/* Continue Learning Section */}
          {stats?.nextLesson && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-6">Continue Learning</h2>
              <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Next Lesson</p>
                <h3 className="text-3xl font-bold text-foreground mb-6">
                  {stats.nextLesson.lessons?.title}
                </h3>
                <Link to={`/lessons/${stats.nextLesson.lesson_id}`}>
                  <Button className="btn-primary flex items-center gap-2">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </section>
          )}

          {/* No Next Lesson - Prompt to Browse */}
          {!stats?.nextLesson && stats?.completedLessons === 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-6">Get Started</h2>
              <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Start Your Learning Journey
                </h3>
                <p className="text-muted-foreground mb-6">
                  Browse available lessons and begin learning today
                </p>
                <Link to="/lessons">
                  <Button className="btn-primary flex items-center gap-2 mx-auto">
                    Browse Lessons
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </section>
          )}

          {/* Recent Progress */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Recent Progress</h2>
            {stats?.recentProgress && stats.recentProgress.length > 0 ? (
              <div className="space-y-4">
                {stats.recentProgress.map((item) => (
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
                          {item.lessons?.title ?? "Unknown Lesson"}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {item.lessons?.difficulty_level ?? "—"}
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
                <p className="text-muted-foreground mb-6">
                  Start your first lesson to track progress
                </p>
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
