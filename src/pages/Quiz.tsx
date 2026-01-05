import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { QuizOption } from "@/components/quiz/QuizOption";
import { QuizTimer } from "@/components/quiz/QuizTimer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  options: { label: string; text: string }[];
  correct_answer: string;
}

// Default quiz questions for demo
const defaultQuestions: Question[] = [
  {
    id: "1",
    question_text: "What is the time complexity of binary search?",
    options: [
      { label: "A", text: "O(n)" },
      { label: "B", text: "O(log n)" },
      { label: "C", text: "O(n log n)" },
      { label: "D", text: "O(n²)" },
    ],
    correct_answer: "B",
  },
  {
    id: "2",
    question_text: "Which data structure uses LIFO principle?",
    options: [
      { label: "A", text: "Queue" },
      { label: "B", text: "Stack" },
      { label: "C", text: "Array" },
      { label: "D", text: "Linked List" },
    ],
    correct_answer: "B",
  },
  {
    id: "3",
    question_text: "What is the space complexity of a linked list?",
    options: [
      { label: "A", text: "O(1)" },
      { label: "B", text: "O(log n)" },
      { label: "C", text: "O(n)" },
      { label: "D", text: "O(n²)" },
    ],
    correct_answer: "C",
  },
  {
    id: "4",
    question_text: "Which sorting algorithm has the best average case time complexity?",
    options: [
      { label: "A", text: "Bubble Sort - O(n²)" },
      { label: "B", text: "Quick Sort - O(n log n)" },
      { label: "C", text: "Insertion Sort - O(n²)" },
      { label: "D", text: "Selection Sort - O(n²)" },
    ],
    correct_answer: "B",
  },
];

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [id]);

  const fetchQuestions = async () => {
    if (id?.startsWith("demo")) {
      setQuestions(defaultQuestions);
      setIsLoading(false);
      return;
    }

    // Try to fetch quiz for this lesson
    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .select("id")
      .eq("lesson_id", id)
      .maybeSingle();

    if (!quizError && quizData) {
      const { data: questionsData, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizData.id)
        .order("order_index");

      if (!questionsError && questionsData && questionsData.length > 0) {
        const formattedQuestions = questionsData.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          options: q.options as { label: string; text: string }[],
          correct_answer: q.correct_answer,
        }));
        setQuestions(formattedQuestions);
        setIsLoading(false);
        return;
      }
    }

    // Use default questions if no quiz found
    setQuestions(defaultQuestions);
    setIsLoading(false);
  };

  const handleTimeUp = useCallback(() => {
    setQuizCompleted(true);
    setShowResult(true);
    toast({
      title: "Time's up!",
      description: "The quiz has ended. View your results below.",
    });
  }, [toast]);

  const handleSelectAnswer = (questionId: string, answer: string) => {
    if (quizCompleted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    setQuizCompleted(true);
    setShowResult(true);

    const correctCount = questions.filter(
      (q) => selectedAnswers[q.id] === q.correct_answer
    ).length;
    const score = Math.round((correctCount / questions.length) * 100);

    if (user && !id?.startsWith("demo")) {
      // Save progress
      await supabase.from("progress").upsert({
        user_id: user.id,
        lesson_id: id,
        completion_percentage: 100,
        quiz_score: score,
        completed_at: new Date().toISOString(),
      });
    }

    toast({
      title: "Quiz Completed!",
      description: `You scored ${score}% (${correctCount}/${questions.length} correct)`,
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Data Structures and Algorithms
            </h1>

            {/* Progress and Timer */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex-1 mr-8">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              {!quizCompleted && (
                <QuizTimer
                  initialMinutes={10}
                  onTimeUp={handleTimeUp}
                  isPaused={quizCompleted}
                />
              )}
            </div>
          </header>

          {/* Question Card */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50 mb-8">
            <p className="text-sm text-muted-foreground mb-2">
              Question {currentIndex + 1} of {questions.length}
            </p>
            <h2 className="text-xl font-semibold text-foreground mb-8">
              {currentQuestion.question_text}
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {currentQuestion.options.map((option) => (
                <QuizOption
                  key={option.label}
                  label={option.label}
                  text={option.text}
                  selected={selectedAnswers[currentQuestion.id] === option.label}
                  correct={option.label === currentQuestion.correct_answer}
                  showResult={showResult}
                  onClick={() => handleSelectAnswer(currentQuestion.id, option.label)}
                  disabled={quizCompleted}
                />
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-4">
              {!quizCompleted ? (
                <>
                  {currentIndex < questions.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      className="btn-primary flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      className="btn-primary"
                    >
                      Submit Answer
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
                    }}
                    disabled={currentIndex >= questions.length - 1}
                  >
                    Skip Question
                  </Button>
                </>
              ) : (
                <Link to="/lessons">
                  <Button className="btn-primary">
                    Back to Lessons
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Results Summary */}
          {quizCompleted && (
            <div className="mt-8 p-6 bg-accent/10 rounded-2xl border border-accent/20">
              <h3 className="text-xl font-bold text-foreground mb-4">Quiz Results</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                  <p className="text-3xl font-bold text-success">
                    {questions.filter((q) => selectedAnswers[q.id] === q.correct_answer).length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                  <p className="text-3xl font-bold text-foreground">{questions.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-3xl font-bold text-accent">
                    {Math.round(
                      (questions.filter((q) => selectedAnswers[q.id] === q.correct_answer).length /
                        questions.length) *
                        100
                    )}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
