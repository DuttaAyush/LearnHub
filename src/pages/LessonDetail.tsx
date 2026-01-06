import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChevronRight, Play, MessageSquare, Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  title: string;
  content: string;
  difficulty_level: string;
  tags: string[] | null;
}

interface DiscussionPost {
  id: string;
  content: string;
  created_at: string;
  username: string;
}

// Default lesson content for different topics
const lessonContentMap: Record<string, Lesson> = {
  // DSA Lessons
  "dsa-1": {
    id: "dsa-1",
    title: "Introduction to DSA",
    content: `Data structures are fundamental concepts in computer science that enable efficient data organization and manipulation. They provide the foundation for designing algorithms and solving complex problems.

In this lesson, we'll explore:
- What are data structures and why they matter
- Classification of data structures (linear vs non-linear)
- Time and space complexity basics
- Common operations on data structures

Understanding data structures is crucial for:
1. Writing efficient code
2. Optimizing memory usage
3. Solving complex algorithmic problems
4. Acing technical interviews`,
    difficulty_level: "beginner",
    tags: ["basics", "intro"],
  },
  "dsa-2": {
    id: "dsa-2",
    title: "Arrays",
    content: `Arrays are one of the most fundamental data structures. They store elements in contiguous memory locations, allowing for constant-time access to any element.

Key concepts:
- Array declaration and initialization
- Accessing elements by index (O(1) time complexity)
- Insertion and deletion operations
- Multi-dimensional arrays
- Dynamic arrays and resizing

Common array operations:
1. Traversal - O(n)
2. Search - O(n) for unsorted, O(log n) for sorted (binary search)
3. Insert at end - O(1) amortized
4. Insert at position - O(n)
5. Delete - O(n)`,
    difficulty_level: "beginner",
    tags: ["linear", "basics"],
  },
  "dsa-3": {
    id: "dsa-3",
    title: "Linked Lists",
    content: `A linked list is a linear data structure where elements are stored in nodes. Each node contains data and a reference to the next node.

Types of linked lists:
- Singly Linked List
- Doubly Linked List
- Circular Linked List

Advantages over arrays:
1. Dynamic size
2. Efficient insertion/deletion at any position
3. No memory wastage

Disadvantages:
1. No random access (must traverse from head)
2. Extra memory for storing pointers
3. Not cache-friendly`,
    difficulty_level: "intermediate",
    tags: ["linear", "pointers"],
  },
  // Math Lessons
  "math-1": {
    id: "math-1",
    title: "Algebra Fundamentals",
    content: `Algebra is the branch of mathematics dealing with symbols and the rules for manipulating those symbols.

Core concepts:
- Variables and constants
- Expressions and equations
- Order of operations (PEMDAS)
- Properties of equality

Key skills:
1. Simplifying expressions
2. Solving for unknowns
3. Working with inequalities
4. Factoring polynomials`,
    difficulty_level: "beginner",
    tags: ["algebra", "basics"],
  },
  "math-2": {
    id: "math-2",
    title: "Linear Equations",
    content: `Linear equations are equations where the highest power of the variable is 1.

Standard form: ax + b = c

Methods to solve:
1. Isolation method
2. Substitution
3. Graphical method

Applications:
- Distance-rate-time problems
- Mixture problems
- Cost and profit calculations`,
    difficulty_level: "beginner",
    tags: ["algebra", "equations"],
  },
  // Physics Lessons
  "physics-1": {
    id: "physics-1",
    title: "Motion and Kinematics",
    content: `Kinematics is the study of motion without considering the forces causing it.

Key concepts:
- Displacement, velocity, and acceleration
- Scalar vs vector quantities
- Equations of motion
- Graphical analysis

Equations of motion (constant acceleration):
1. v = u + at
2. s = ut + ½at²
3. v² = u² + 2as
4. s = ½(u + v)t`,
    difficulty_level: "beginner",
    tags: ["mechanics", "motion"],
  },
  // Chemistry Lessons
  "chem-1": {
    id: "chem-1",
    title: "Atomic Structure",
    content: `Atoms are the basic building blocks of matter, consisting of protons, neutrons, and electrons.

Key concepts:
- Subatomic particles and their properties
- Atomic number and mass number
- Isotopes and ions
- Electron configuration

Electron shells:
1. K shell (2 electrons max)
2. L shell (8 electrons max)
3. M shell (18 electrons max)
4. N shell (32 electrons max)`,
    difficulty_level: "beginner",
    tags: ["atoms", "basics"],
  },
  // Programming Lessons
  "prog-1": {
    id: "prog-1",
    title: "Introduction to Programming",
    content: `Programming is the process of creating instructions for computers to execute.

Core concepts:
- What is a programming language?
- Compiled vs interpreted languages
- Writing your first program
- Understanding syntax and semantics

Popular programming languages:
1. Python - beginner-friendly, versatile
2. JavaScript - web development
3. Java - enterprise applications
4. C++ - system programming, games`,
    difficulty_level: "beginner",
    tags: ["basics", "intro"],
  },
};

// Default fallback lesson
const defaultLesson: Lesson = {
  id: "demo",
  title: "Welcome to Learning",
  content: `Welcome to the adaptive learning platform! This lesson will introduce you to the core concepts.

In this course, you'll learn:
- Fundamental concepts and theories
- Practical applications
- Problem-solving techniques
- Best practices and tips

Let's get started on your learning journey!`,
  difficulty_level: "beginner",
  tags: ["intro"],
};

export default function LessonDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLesson();
    fetchDiscussionPosts();
    const unsubscribe = subscribeToDiscussion();
    return () => {
      unsubscribe?.();
    };
  }, [id]);

  // Track lesson progress when user views the lesson
  useEffect(() => {
    if (user && id && lesson) {
      trackLessonProgress();
    }
  }, [user, id, lesson]);

  const trackLessonProgress = async () => {
    if (!user || !id) return;

    // Check if progress exists
    const { data: existingProgress } = await supabase
      .from("progress")
      .select("id, completion_percentage")
      .eq("user_id", user.id)
      .eq("lesson_id", id)
      .maybeSingle();

    if (!existingProgress) {
      // Create new progress entry (50% for viewing lesson, 100% after quiz)
      await supabase.from("progress").insert({
        user_id: user.id,
        lesson_id: id,
        completion_percentage: 50,
      });
    }
  };

  const fetchLesson = async () => {
    // First check if it's a default lesson
    if (id && lessonContentMap[id]) {
      setLesson(lessonContentMap[id]);
      setIsLoading(false);
      return;
    }

    // Try to fetch from database
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      setLesson(data);
    } else {
      // Use fallback
      setLesson({ ...defaultLesson, id: id || "demo", title: `Lesson: ${id}` });
    }
    setIsLoading(false);
  };

  const fetchDiscussionPosts = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("discussion_posts")
      .select("id, content, created_at, user_id")
      .eq("lesson_id", id)
      .is("parent_id", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Fetch usernames
      const userIds = [...new Set(data.map((p) => p.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);

      const profileMap: Record<string, string> = {};
      profilesData?.forEach((p) => {
        profileMap[p.user_id] = p.username;
      });

      const postsWithUsernames = data.map((post) => ({
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        username: profileMap[post.user_id] || "Anonymous",
      }));

      setPosts(postsWithUsernames);
    }
  };

  const subscribeToDiscussion = () => {
    if (!id) return;

    const channel = supabase
      .channel(`discussion-posts-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "discussion_posts",
          filter: `lesson_id=eq.${id}`,
        },
        () => {
          fetchDiscussionPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to post a comment.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("discussion_posts").insert({
      lesson_id: id,
      user_id: user.id,
      content: newComment.trim(),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } else {
      setNewComment("");
      toast({
        title: "Posted!",
        description: "Your comment has been added to the discussion.",
      });
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!lesson) {
    return (
      <Layout>
        <div className="container py-10 text-center">
          <h1 className="text-2xl font-bold text-foreground">Lesson not found</h1>
          <Link to="/lessons" className="text-accent hover:underline mt-4 inline-block">
            Back to lessons
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/subjects" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Subjects
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/lessons" className="hover:text-foreground">Lessons</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{lesson.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              lesson.difficulty_level === "beginner" ? "bg-success/10 text-success" :
              lesson.difficulty_level === "intermediate" ? "bg-warning/10 text-warning" :
              "bg-destructive/10 text-destructive"
            }`}>
              {lesson.difficulty_level.charAt(0).toUpperCase() + lesson.difficulty_level.slice(1)}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-foreground">{lesson.title}</h1>
        </header>

        {/* Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2 mb-10">
          {/* Lesson Content */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">Lesson Content</h2>
            <div className="prose prose-slate max-w-none">
              {lesson.content.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-muted-foreground mb-4 leading-relaxed whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Practice Section */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">Practice Questions</h2>
            <p className="text-muted-foreground mb-6">
              Test your understanding with questions related to {lesson.title}.
            </p>
            <Link to={`/quiz/${id}`}>
              <Button className="btn-primary w-full flex items-center justify-center gap-2">
                <Play className="h-4 w-4" />
                Start Practice Quiz
              </Button>
            </Link>
            
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="font-medium text-foreground mb-3">Need more help?</h3>
              <Link to="/ai-tutor">
                <Button variant="outline" className="w-full">
                  Ask AI Tutor
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Discussion Forum */}
        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-accent" />
            Discussion Forum
          </h2>

          {/* New Comment Input */}
          <div className="mb-8">
            <Textarea
              placeholder="Share your thoughts or ask a question..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="input-field mb-4 min-h-[100px]"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={isSubmitting || !newComment.trim()}
              className="btn-primary flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>

          {/* Posts List */}
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 bg-secondary/50 rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-foreground">
                      {post.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{post.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to start the discussion!
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
