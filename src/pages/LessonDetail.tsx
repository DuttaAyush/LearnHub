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

interface VideoResource {
  title: string;
  url: string;
  duration: string;
}

// Video resources mapped by lesson title (lowercase)
const videoResourcesByTitle: Record<string, VideoResource[]> = {
  "introduction to dsa": [
    { title: "What are Data Structures?", url: "https://www.youtube.com/watch?v=bum_19loj9A", duration: "12:34" },
    { title: "Why DSA Matters for Interviews", url: "https://www.youtube.com/watch?v=B31LgI4Y4DQ", duration: "15:20" },
  ],
  "arrays": [
    { title: "Arrays Explained - CS Dojo", url: "https://www.youtube.com/watch?v=pmN9ExDf3yQ", duration: "10:42" },
    { title: "Array Operations & Time Complexity", url: "https://www.youtube.com/watch?v=n60Dn0UsbEk", duration: "18:15" },
  ],
  "linked lists": [
    { title: "Linked Lists for Beginners", url: "https://www.youtube.com/watch?v=F8AbOfQwl1c", duration: "14:30" },
    { title: "Implementing Linked List in Code", url: "https://www.youtube.com/watch?v=njTh_OwMljA", duration: "22:10" },
  ],
  "algebra fundamentals": [
    { title: "Algebra Basics - Khan Academy", url: "https://www.youtube.com/watch?v=NybHckSEQBI", duration: "16:45" },
    { title: "Solving Equations Step by Step", url: "https://www.youtube.com/watch?v=LDIiYKYvvdA", duration: "11:30" },
  ],
  "motion and kinematics": [
    { title: "Introduction to Motion", url: "https://www.youtube.com/watch?v=ZM8ECpBuQYE", duration: "13:22" },
    { title: "Equations of Motion Explained", url: "https://www.youtube.com/watch?v=f8xtHFLjvoo", duration: "17:40" },
  ],
  "atomic structure": [
    { title: "Atomic Structure Basics", url: "https://www.youtube.com/watch?v=1xSQlwWGT8M", duration: "14:15" },
    { title: "Electron Configuration Made Easy", url: "https://www.youtube.com/watch?v=Aoi4j8es4gQ", duration: "19:30" },
  ],
  "introduction to programming": [
    { title: "Programming Fundamentals", url: "https://www.youtube.com/watch?v=zOjov-2OZ0E", duration: "20:00" },
    { title: "Your First Program", url: "https://www.youtube.com/watch?v=rfscVS0vtbw", duration: "25:30" },
  ],
};

// Default lesson content mapped by title (lowercase)
const lessonContentByTitle: Record<string, string> = {
  "introduction to dsa": `Data structures are fundamental concepts in computer science that enable efficient data organization and manipulation. They provide the foundation for designing algorithms and solving complex problems.

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
  "arrays": `Arrays are one of the most fundamental data structures. They store elements in contiguous memory locations, allowing for constant-time access to any element.

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
  "linked lists": `A linked list is a linear data structure where elements are stored in nodes. Each node contains data and a reference to the next node.

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
  "algebra fundamentals": `Algebra is the branch of mathematics dealing with symbols and the rules for manipulating those symbols.

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
  "motion and kinematics": `Kinematics is the study of motion without considering the forces causing it.

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
  "atomic structure": `Atoms are the basic building blocks of matter, consisting of protons, neutrons, and electrons.

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
  "introduction to programming": `Programming is the process of creating instructions for computers to execute.

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
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [currentProgress, setCurrentProgress] = useState(0);

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
      // Create new progress entry (30% for viewing lesson content)
      await supabase.from("progress").insert({
        user_id: user.id,
        lesson_id: id,
        completion_percentage: 30,
      });
      setCurrentProgress(30);
    } else {
      setCurrentProgress(existingProgress.completion_percentage);
    }
  };

  const handleWatchVideo = async (videoUrl: string) => {
    if (!user || !id || !lesson) return;
    
    // Mark video as watched locally
    const newWatched = new Set(watchedVideos);
    newWatched.add(videoUrl);
    setWatchedVideos(newWatched);
    
    // Open video in new tab
    window.open(videoUrl, '_blank');
    
    // Get total videos for this lesson
    const titleKey = lesson.title.toLowerCase();
    const videos = videoResourcesByTitle[titleKey] || [];
    const totalVideos = videos.length;
    
    if (totalVideos === 0) return;
    
    // Calculate progress: 30% content + (watched/total * 30%) videos + 40% quiz
    const videosWatchedCount = newWatched.size;
    const videoProgress = Math.round((videosWatchedCount / totalVideos) * 30);
    
    // Get current progress and update if videos add more
    const { data: existingProgress } = await supabase
      .from("progress")
      .select("id, completion_percentage, quiz_score")
      .eq("user_id", user.id)
      .eq("lesson_id", id)
      .maybeSingle();
    
    if (existingProgress) {
      // Quiz gives 40%, so if quiz_score exists, add 40%
      const quizProgress = existingProgress.quiz_score !== null ? 40 : 0;
      const newPercentage = Math.min(30 + videoProgress + quizProgress, 100);
      
      if (newPercentage > existingProgress.completion_percentage) {
        await supabase
          .from("progress")
          .update({ completion_percentage: newPercentage })
          .eq("id", existingProgress.id);
        setCurrentProgress(newPercentage);
        
        toast({
          title: "Progress Updated!",
          description: `You've completed ${newPercentage}% of this lesson.`,
        });
      }
    }
  };

  const fetchLesson = async () => {
    // Try to fetch from database first
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      // Check if we have supplemental content by title
      const titleKey = data.title.toLowerCase();
      if (lessonContentByTitle[titleKey]) {
        // Use database metadata but with our richer content
        setLesson({
          ...data,
          content: lessonContentByTitle[titleKey],
        });
      } else {
        setLesson(data);
      }
    } else {
      // Use fallback
      setLesson({ ...defaultLesson, id: id || "demo", title: `Lesson` });
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

          {/* Right Column */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50">
              <h3 className="font-semibold text-foreground mb-3">Your Progress</h3>
              <div className="w-full bg-secondary rounded-full h-3 mb-2">
                <div 
                  className="bg-accent h-3 rounded-full transition-all duration-500"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{currentProgress}% Complete</p>
              <div className="mt-3 text-xs text-muted-foreground space-y-1">
                <p>• Reading content: 30%</p>
                <p>• Watching videos: 30%</p>
                <p>• Completing quiz: 40%</p>
              </div>
            </div>

            {/* Video Resources */}
            {(() => {
              const titleKey = lesson.title.toLowerCase();
              const videos = videoResourcesByTitle[titleKey] || [];
              return videos.length > 0 ? (
                <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Play className="h-5 w-5 text-accent" />
                    Video Resources
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    Watch these videos to deepen your understanding ({watchedVideos.size}/{videos.length} watched)
                  </p>
                  <div className="space-y-3">
                    {videos.map((video, index) => (
                      <button
                        key={index}
                        onClick={() => handleWatchVideo(video.url)}
                        className={`w-full p-3 rounded-lg border text-left transition-all hover:border-accent/50 ${
                          watchedVideos.has(video.url) 
                            ? 'bg-accent/10 border-accent/30' 
                            : 'bg-secondary/50 border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              watchedVideos.has(video.url) ? 'bg-accent text-accent-foreground' : 'bg-muted'
                            }`}>
                              <Play className="h-3 w-3" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{video.title}</p>
                              <p className="text-xs text-muted-foreground">{video.duration}</p>
                            </div>
                          </div>
                          {watchedVideos.has(video.url) && (
                            <span className="text-xs text-accent font-medium">✓ Watched</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Practice Section */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50">
              <h2 className="text-xl font-bold text-foreground mb-4">Practice Quiz</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Test your understanding with questions related to {lesson.title}.
              </p>
              <Link to={`/quiz/${id}`}>
                <Button className="btn-primary w-full flex items-center justify-center gap-2">
                  <Play className="h-4 w-4" />
                  Start Practice Quiz
                </Button>
              </Link>
              
              <div className="mt-4 pt-4 border-t border-border">
                <h3 className="font-medium text-foreground text-sm mb-2">Need more help?</h3>
                <Link to="/ai-tutor">
                  <Button variant="outline" className="w-full" size="sm">
                    Ask AI Tutor
                  </Button>
                </Link>
              </div>
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