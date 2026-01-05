import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { BookOpen, BarChart3, MessageSquare, Trophy, ArrowRight, Bot, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const features = [
  {
    icon: GraduationCap,
    title: "Multiple Subjects",
    description: "Learn DSA, Mathematics, Physics, Chemistry, Programming, and more.",
  },
  {
    icon: Bot,
    title: "AI Tutor",
    description: "Get personalized help from our AI tutor anytime you need it.",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description: "Monitor your learning journey with detailed analytics and insights.",
  },
  {
    icon: Trophy,
    title: "Interactive Quizzes",
    description: "Test your knowledge with topic-specific quizzes and instant feedback.",
  },
];

const subjects = [
  { name: "Data Structures & Algorithms", color: "bg-primary/10 text-primary" },
  { name: "Mathematics", color: "bg-success/10 text-success" },
  { name: "Physics", color: "bg-purple-500/10 text-purple-600" },
  { name: "Chemistry", color: "bg-warning/10 text-warning" },
  { name: "Programming", color: "bg-accent/10 text-accent" },
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
              Learn Any Subject, Your Way
            </p>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Master multiple subjects with personalized learning paths, AI tutoring, interactive quizzes, and real-time progress tracking. 
              Start your journey to success today.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {user ? (
                <Link to="/subjects">
                  <Button className="btn-primary flex items-center gap-2 text-lg px-8 py-6">
                    Explore Subjects
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
                  <Link to="/subjects">
                    <Button className="btn-secondary text-lg px-8 py-6">
                      Browse Subjects
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Preview */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Available Subjects
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {subjects.map((subject) => (
              <Link key={subject.name} to="/subjects">
                <span className={`px-4 py-2 rounded-full font-medium transition-transform hover:scale-105 ${subject.color}`}>
                  {subject.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose LearnHub?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform is designed to help you learn effectively with cutting-edge features
            </p>
          </div>
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

      {/* AI Tutor CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground mb-4">
                <Bot className="h-5 w-5" />
                <span className="font-medium">AI-Powered</span>
              </div>
              <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                Meet Your AI Tutor
              </h2>
              <p className="text-primary-foreground/80 max-w-xl">
                Get instant help with any concept. Our AI tutor is available 24/7 to answer your questions, 
                explain complex topics, and guide you through problems step by step.
              </p>
            </div>
            <Link to="/ai-tutor">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 flex items-center gap-2">
                Try AI Tutor
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are achieving their goals with personalized adaptive learning.
          </p>
          <Link to={user ? "/subjects" : "/auth"}>
            <Button className="btn-primary text-lg px-8 py-6">
              {user ? "Explore Subjects" : "Get Started Free"}
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
