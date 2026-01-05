import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { LessonCard } from "@/components/lessons/LessonCard";
import { BookOpen, BarChart3, MessageSquare, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

// Sample lessons data for initial display
const sampleLessons = [
  { id: "1", title: "Introduction to DSA", progress: 50, difficulty: "beginner", tags: ["basics", "intro"] },
  { id: "2", title: "Arrays", progress: 75, difficulty: "beginner", tags: ["linear", "basics"] },
  { id: "3", title: "Linked Lists", progress: 25, difficulty: "intermediate", tags: ["linear", "pointers"] },
  { id: "4", title: "Stacks", progress: 0, difficulty: "beginner", tags: ["linear", "LIFO"] },
];

const features = [
  {
    icon: BookOpen,
    title: "Adaptive Learning",
    description: "Personalized lesson recommendations based on your progress and performance.",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description: "Monitor your learning journey with detailed analytics and insights.",
  },
  {
    icon: MessageSquare,
    title: "Discussion Forums",
    description: "Engage with peers and instructors in real-time discussions.",
  },
  {
    icon: Trophy,
    title: "Interactive Quizzes",
    description: "Test your knowledge with timed quizzes and instant feedback.",
  },
];

export default function Index() {
  const { user } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-background" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center animate-slide-up">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Adaptive Learning{" "}
              <span className="gradient-text">Platform</span>
            </h1>
            <p className="mt-6 text-xl text-accent font-medium">
              Data Structures and Algorithms
            </p>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Master DSA with personalized learning paths, interactive quizzes, and real-time progress tracking. 
              Start your journey to becoming a better programmer today.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {user ? (
                <Link to="/lessons">
                  <Button className="btn-primary flex items-center gap-2 text-lg px-8 py-6">
                    Continue Learning
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button className="btn-primary flex items-center gap-2 text-lg px-8 py-6">
                      Get Started
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/lessons">
                    <Button className="btn-secondary text-lg px-8 py-6">
                      Explore Lessons
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-card rounded-2xl p-6 shadow-md border border-border/50 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mb-4">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lessons Preview Section */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Available Lessons</h2>
              <p className="mt-2 text-muted-foreground">
                Start learning with our comprehensive DSA curriculum
              </p>
            </div>
            <Link to="/lessons">
              <Button variant="outline" className="flex items-center gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {sampleLessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <LessonCard {...lesson} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Master DSA?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are improving their algorithmic thinking and problem-solving skills.
          </p>
          <Link to={user ? "/dashboard" : "/auth"}>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6">
              {user ? "Go to Dashboard" : "Start Learning Now"}
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
