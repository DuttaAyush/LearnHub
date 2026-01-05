import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { LessonCard } from "@/components/lessons/LessonCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Lesson {
  id: string;
  title: string;
  difficulty_level: string;
  tags: string[];
  order_index: number;
}

interface Progress {
  lesson_id: string;
  completion_percentage: number;
}

// Default lessons for demo when DB is empty
const defaultLessons: Lesson[] = [
  { id: "demo-1", title: "Introduction to DSA", difficulty_level: "beginner", tags: ["basics", "intro"], order_index: 0 },
  { id: "demo-2", title: "Arrays", difficulty_level: "beginner", tags: ["linear", "basics"], order_index: 1 },
  { id: "demo-3", title: "Linked Lists", difficulty_level: "intermediate", tags: ["linear", "pointers"], order_index: 2 },
  { id: "demo-4", title: "Stacks", difficulty_level: "beginner", tags: ["linear", "LIFO"], order_index: 3 },
  { id: "demo-5", title: "Queues", difficulty_level: "beginner", tags: ["linear", "FIFO"], order_index: 4 },
  { id: "demo-6", title: "Trees", difficulty_level: "intermediate", tags: ["hierarchical", "recursion"], order_index: 5 },
  { id: "demo-7", title: "Binary Search Trees", difficulty_level: "intermediate", tags: ["trees", "search"], order_index: 6 },
  { id: "demo-8", title: "Graph Algorithms", difficulty_level: "advanced", tags: ["graphs", "traversal"], order_index: 7 },
];

const defaultProgress: Record<string, number> = {
  "demo-1": 50,
  "demo-2": 75,
  "demo-3": 25,
  "demo-4": 0,
  "demo-5": 0,
  "demo-6": 0,
  "demo-7": 0,
  "demo-8": 0,
};

export default function Lessons() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  useEffect(() => {
    fetchLessons();
  }, [user]);

  const fetchLessons = async () => {
    // Fetch lessons from database
    const { data: lessonsData, error: lessonsError } = await supabase
      .from("lessons")
      .select("*")
      .order("order_index");

    if (!lessonsError && lessonsData && lessonsData.length > 0) {
      setLessons(lessonsData);
    } else {
      // Use default lessons for demo
      setLessons(defaultLessons);
    }

    // Fetch user progress if logged in
    if (user) {
      const { data: progressData, error: progressError } = await supabase
        .from("progress")
        .select("lesson_id, completion_percentage")
        .eq("user_id", user.id);

      if (!progressError && progressData) {
        const progressMap: Record<string, number> = {};
        progressData.forEach((p) => {
          progressMap[p.lesson_id] = p.completion_percentage;
        });
        setProgress(progressMap);
      } else {
        setProgress(defaultProgress);
      }
    } else {
      setProgress(defaultProgress);
    }

    setIsLoading(false);
  };

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty = difficultyFilter === "all" || lesson.difficulty_level === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Adaptive Learning Platform
          </h1>
          <p className="text-xl text-accent font-medium">
            Data Structures and Algorithms
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="input-field">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {filteredLessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <LessonCard
                id={lesson.id}
                title={lesson.title}
                progress={progress[lesson.id] || 0}
                difficulty={lesson.difficulty_level}
                tags={lesson.tags}
              />
            </div>
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No lessons found matching your criteria.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
