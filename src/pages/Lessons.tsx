import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { LessonCard } from "@/components/lessons/LessonCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Search, Filter, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  tags: string[] | null;
  order_index: number;
  subject_id: string | null;
}

interface Subject {
  id: string;
  name: string;
}

// Default lessons grouped by subject name (for when DB lessons are empty)
const defaultLessonsBySubjectName: Record<string, { id: string; title: string; difficulty_level: string; tags: string[]; order_index: number }[]> = {
  "Data Structures & Algorithms": [
    { id: "dsa-1", title: "Introduction to DSA", difficulty_level: "beginner", tags: ["basics", "intro"], order_index: 0 },
    { id: "dsa-2", title: "Arrays", difficulty_level: "beginner", tags: ["linear", "basics"], order_index: 1 },
    { id: "dsa-3", title: "Linked Lists", difficulty_level: "intermediate", tags: ["linear", "pointers"], order_index: 2 },
    { id: "dsa-4", title: "Stacks", difficulty_level: "beginner", tags: ["linear", "LIFO"], order_index: 3 },
    { id: "dsa-5", title: "Queues", difficulty_level: "beginner", tags: ["linear", "FIFO"], order_index: 4 },
    { id: "dsa-6", title: "Trees", difficulty_level: "intermediate", tags: ["hierarchical", "recursion"], order_index: 5 },
    { id: "dsa-7", title: "Binary Search Trees", difficulty_level: "intermediate", tags: ["trees", "search"], order_index: 6 },
    { id: "dsa-8", title: "Graph Algorithms", difficulty_level: "advanced", tags: ["graphs", "traversal"], order_index: 7 },
  ],
  "Mathematics": [
    { id: "math-1", title: "Algebra Fundamentals", difficulty_level: "beginner", tags: ["algebra", "basics"], order_index: 0 },
    { id: "math-2", title: "Linear Equations", difficulty_level: "beginner", tags: ["algebra", "equations"], order_index: 1 },
    { id: "math-3", title: "Quadratic Equations", difficulty_level: "intermediate", tags: ["algebra", "quadratic"], order_index: 2 },
    { id: "math-4", title: "Calculus Basics", difficulty_level: "intermediate", tags: ["calculus", "limits"], order_index: 3 },
    { id: "math-5", title: "Derivatives", difficulty_level: "advanced", tags: ["calculus", "derivatives"], order_index: 4 },
  ],
  "Physics": [
    { id: "physics-1", title: "Motion and Kinematics", difficulty_level: "beginner", tags: ["mechanics", "motion"], order_index: 0 },
    { id: "physics-2", title: "Newton's Laws", difficulty_level: "beginner", tags: ["mechanics", "forces"], order_index: 1 },
    { id: "physics-3", title: "Work and Energy", difficulty_level: "intermediate", tags: ["mechanics", "energy"], order_index: 2 },
    { id: "physics-4", title: "Waves and Optics", difficulty_level: "intermediate", tags: ["waves", "light"], order_index: 3 },
  ],
  "Chemistry": [
    { id: "chem-1", title: "Atomic Structure", difficulty_level: "beginner", tags: ["atoms", "basics"], order_index: 0 },
    { id: "chem-2", title: "Chemical Bonding", difficulty_level: "beginner", tags: ["bonding", "molecules"], order_index: 1 },
    { id: "chem-3", title: "Chemical Reactions", difficulty_level: "intermediate", tags: ["reactions", "stoichiometry"], order_index: 2 },
    { id: "chem-4", title: "Organic Chemistry Intro", difficulty_level: "intermediate", tags: ["organic", "carbon"], order_index: 3 },
  ],
  "Programming": [
    { id: "prog-1", title: "Introduction to Programming", difficulty_level: "beginner", tags: ["basics", "intro"], order_index: 0 },
    { id: "prog-2", title: "Variables and Data Types", difficulty_level: "beginner", tags: ["basics", "variables"], order_index: 1 },
    { id: "prog-3", title: "Control Flow", difficulty_level: "beginner", tags: ["conditions", "loops"], order_index: 2 },
    { id: "prog-4", title: "Functions", difficulty_level: "intermediate", tags: ["functions", "modular"], order_index: 3 },
    { id: "prog-5", title: "Object-Oriented Programming", difficulty_level: "intermediate", tags: ["oop", "classes"], order_index: 4 },
  ],
};

export default function Lessons() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get("subject");

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, [user, subjectId]);

  const fetchData = async () => {
    setIsLoading(true);
    
    // If we have a subjectId, fetch that subject's details
    if (subjectId) {
      const { data: subjectData } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("id", subjectId)
        .maybeSingle();

      if (subjectData) {
        setCurrentSubject(subjectData);
        
        // Fetch lessons for this subject from DB
        const { data: lessonsData } = await supabase
          .from("lessons")
          .select("*")
          .eq("subject_id", subjectId)
          .order("order_index");

        if (lessonsData && lessonsData.length > 0) {
          setLessons(lessonsData);
        } else {
          // Use default lessons for this subject
          const defaultLessons = defaultLessonsBySubjectName[subjectData.name];
          if (defaultLessons) {
            setLessons(defaultLessons.map(l => ({ ...l, subject_id: subjectId })));
          } else {
            setLessons([]);
          }
        }
      } else {
        setCurrentSubject(null);
        setLessons([]);
      }
    } else {
      // No subject filter - show all lessons
      setCurrentSubject(null);
      
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("*")
        .order("order_index");

      if (lessonsData && lessonsData.length > 0) {
        setLessons(lessonsData);
      } else {
        // Show all default lessons
        const allLessons: Lesson[] = [];
        Object.entries(defaultLessonsBySubjectName).forEach(([subjectName, sLessons]) => {
          sLessons.forEach((l) => {
            allLessons.push({ ...l, subject_id: null });
          });
        });
        setLessons(allLessons);
      }
    }

    // Fetch user progress if logged in
    if (user) {
      const { data: progressData } = await supabase
        .from("progress")
        .select("lesson_id, completion_percentage")
        .eq("user_id", user.id);

      if (progressData) {
        const progressMap: Record<string, number> = {};
        progressData.forEach((p) => {
          progressMap[p.lesson_id] = p.completion_percentage;
        });
        setProgress(progressMap);
      }
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
          {subjectId && (
            <Link to="/subjects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Subjects
            </Link>
          )}
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {currentSubject?.name || "All Lessons"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {subjectId 
              ? `Explore ${currentSubject?.name || "lessons"} from beginner to advanced`
              : "Browse lessons across all subjects"}
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
                tags={lesson.tags || []}
              />
            </div>
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No lessons found matching your criteria.</p>
            {subjectId && (
              <Link to="/subjects">
                <Button className="mt-4 btn-secondary">
                  Browse All Subjects
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
