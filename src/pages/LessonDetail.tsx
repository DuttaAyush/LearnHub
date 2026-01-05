import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChevronRight, Play, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  title: string;
  content: string;
  difficulty_level: string;
  tags: string[];
}

interface DiscussionPost {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
  } | null;
}

// Default lesson data for demo
const defaultLesson: Lesson = {
  id: "demo",
  title: "Introduction to Data Structures",
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
    subscribeToDiscussion();
  }, [id]);

  const fetchLesson = async () => {
    if (id?.startsWith("demo")) {
      setLesson(defaultLesson);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      setLesson(data);
    } else {
      setLesson(defaultLesson);
    }
    setIsLoading(false);
  };

  const fetchDiscussionPosts = async () => {
    if (id?.startsWith("demo")) return;

    const { data, error } = await supabase
      .from("discussion_posts")
      .select(`
        id,
        content,
        created_at,
        user_id
      `)
      .eq("lesson_id", id)
      .is("parent_id", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Fetch usernames for each post
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);

      const profileMap: Record<string, string> = {};
      profilesData?.forEach(p => {
        profileMap[p.user_id] = p.username;
      });

      const postsWithProfiles = data.map(post => ({
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        profiles: {
          username: profileMap[post.user_id] || "Anonymous"
        }
      }));

      setPosts(postsWithProfiles);
    }
  };

  const subscribeToDiscussion = () => {
    if (id?.startsWith("demo")) return;

    const channel = supabase
      .channel("discussion-posts")
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

    if (id?.startsWith("demo")) {
      toast({
        title: "Demo mode",
        description: "Discussion is disabled in demo mode.",
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
          <Link to="/lessons" className="hover:text-foreground">DSA</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{lesson.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-foreground">Lesson Detail</h1>
          <p className="text-xl text-accent font-medium mt-2">{lesson.title}</p>
        </header>

        {/* Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2 mb-10">
          {/* Lesson Content */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">Lesson Content</h2>
            <div className="prose prose-slate max-w-none">
              {lesson.content.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-muted-foreground mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Practice Questions */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">Practice Questions</h2>
            <p className="text-muted-foreground mb-6">
              Question 1: What is the time complexity of accessing an element in an array?
            </p>
            <Link to={`/quiz/${id}`}>
              <Button className="btn-primary w-full flex items-center justify-center gap-2">
                <Play className="h-4 w-4" />
                Start Practice
              </Button>
            </Link>
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
              placeholder="Enter your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="input-field mb-4 min-h-[100px]"
            />
            <div className="flex gap-4">
              <Button
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment.trim()}
                className="btn-secondary flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Submit
              </Button>
              <Button
                variant="outline"
                onClick={() => fetchDiscussionPosts()}
                className="flex items-center gap-2"
              >
                View Discussion
              </Button>
            </div>
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
                      {post.profiles?.username || "Anonymous"}
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
