import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { QuizOption } from "@/components/quiz/QuizOption";
import { QuizTimer } from "@/components/quiz/QuizTimer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  options: { label: string; text: string }[];
  correct_answer: string;
}

// Quiz questions organized by lesson title (case-insensitive match)
const quizQuestionsByTitle: Record<string, Question[]> = {
  "introduction to dsa": [
    {
      id: "1",
      question_text: "What is a data structure?",
      options: [
        { label: "A", text: "A programming language" },
        { label: "B", text: "A way to organize and store data" },
        { label: "C", text: "A type of database" },
        { label: "D", text: "A sorting algorithm" },
      ],
      correct_answer: "B",
    },
    {
      id: "2",
      question_text: "Which of the following is a linear data structure?",
      options: [
        { label: "A", text: "Tree" },
        { label: "B", text: "Graph" },
        { label: "C", text: "Array" },
        { label: "D", text: "Heap" },
      ],
      correct_answer: "C",
    },
    {
      id: "3",
      question_text: "What does O(n) represent in time complexity?",
      options: [
        { label: "A", text: "Constant time" },
        { label: "B", text: "Linear time" },
        { label: "C", text: "Quadratic time" },
        { label: "D", text: "Logarithmic time" },
      ],
      correct_answer: "B",
    },
  ],
  "arrays": [
    {
      id: "1",
      question_text: "What is the time complexity of accessing an element in an array?",
      options: [
        { label: "A", text: "O(n)" },
        { label: "B", text: "O(1)" },
        { label: "C", text: "O(log n)" },
        { label: "D", text: "O(n²)" },
      ],
      correct_answer: "B",
    },
    {
      id: "2",
      question_text: "What is the main advantage of arrays?",
      options: [
        { label: "A", text: "Dynamic size" },
        { label: "B", text: "Random access in O(1)" },
        { label: "C", text: "Easy insertion anywhere" },
        { label: "D", text: "No memory wastage" },
      ],
      correct_answer: "B",
    },
    {
      id: "3",
      question_text: "What is the time complexity of binary search on a sorted array?",
      options: [
        { label: "A", text: "O(n)" },
        { label: "B", text: "O(log n)" },
        { label: "C", text: "O(n log n)" },
        { label: "D", text: "O(1)" },
      ],
      correct_answer: "B",
    },
  ],
  "linked lists": [
    {
      id: "1",
      question_text: "What is the main advantage of a linked list over an array?",
      options: [
        { label: "A", text: "Random access" },
        { label: "B", text: "Less memory usage" },
        { label: "C", text: "Dynamic size and efficient insertion" },
        { label: "D", text: "Faster search" },
      ],
      correct_answer: "C",
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
      question_text: "What is the space complexity of a linked list with n elements?",
      options: [
        { label: "A", text: "O(1)" },
        { label: "B", text: "O(log n)" },
        { label: "C", text: "O(n)" },
        { label: "D", text: "O(n²)" },
      ],
      correct_answer: "C",
    },
  ],
  "algebra fundamentals": [
    {
      id: "1",
      question_text: "What is the value of x in the equation 2x + 4 = 10?",
      options: [
        { label: "A", text: "2" },
        { label: "B", text: "3" },
        { label: "C", text: "4" },
        { label: "D", text: "5" },
      ],
      correct_answer: "B",
    },
    {
      id: "2",
      question_text: "Simplify: 3(x + 2) - 2x",
      options: [
        { label: "A", text: "x + 6" },
        { label: "B", text: "5x + 6" },
        { label: "C", text: "x + 2" },
        { label: "D", text: "3x + 6" },
      ],
      correct_answer: "A",
    },
    {
      id: "3",
      question_text: "What is the order of operations?",
      options: [
        { label: "A", text: "SADMEP" },
        { label: "B", text: "PEMDAS" },
        { label: "C", text: "ASMDEP" },
        { label: "D", text: "DEPMSA" },
      ],
      correct_answer: "B",
    },
  ],
  "motion and kinematics": [
    {
      id: "1",
      question_text: "What is the formula for velocity?",
      options: [
        { label: "A", text: "v = d × t" },
        { label: "B", text: "v = d / t" },
        { label: "C", text: "v = d + t" },
        { label: "D", text: "v = t / d" },
      ],
      correct_answer: "B",
    },
    {
      id: "2",
      question_text: "Which of the following is a vector quantity?",
      options: [
        { label: "A", text: "Speed" },
        { label: "B", text: "Distance" },
        { label: "C", text: "Velocity" },
        { label: "D", text: "Time" },
      ],
      correct_answer: "C",
    },
    {
      id: "3",
      question_text: "What is the SI unit of acceleration?",
      options: [
        { label: "A", text: "m/s" },
        { label: "B", text: "m/s²" },
        { label: "C", text: "km/h" },
        { label: "D", text: "m" },
      ],
      correct_answer: "B",
    },
  ],
  "atomic structure": [
    {
      id: "1",
      question_text: "What are the subatomic particles in an atom?",
      options: [
        { label: "A", text: "Atoms, molecules, ions" },
        { label: "B", text: "Protons, neutrons, electrons" },
        { label: "C", text: "Nucleus, shell, orbital" },
        { label: "D", text: "Cations, anions, isotopes" },
      ],
      correct_answer: "B",
    },
    {
      id: "2",
      question_text: "What determines the atomic number of an element?",
      options: [
        { label: "A", text: "Number of neutrons" },
        { label: "B", text: "Number of electrons" },
        { label: "C", text: "Number of protons" },
        { label: "D", text: "Mass number" },
      ],
      correct_answer: "C",
    },
    {
      id: "3",
      question_text: "What is the maximum number of electrons in the second shell (L shell)?",
      options: [
        { label: "A", text: "2" },
        { label: "B", text: "8" },
        { label: "C", text: "18" },
        { label: "D", text: "32" },
      ],
      correct_answer: "B",
    },
  ],
  "introduction to programming": [
    {
      id: "1",
      question_text: "What is a programming language?",
      options: [
        { label: "A", text: "A spoken language" },
        { label: "B", text: "A formal language for instructing computers" },
        { label: "C", text: "A type of database" },
        { label: "D", text: "An operating system" },
      ],
      correct_answer: "B",
    },
    {
      id: "2",
      question_text: "Which language is known for being beginner-friendly?",
      options: [
        { label: "A", text: "Assembly" },
        { label: "B", text: "C++" },
        { label: "C", text: "Python" },
        { label: "D", text: "Rust" },
      ],
      correct_answer: "C",
    },
    {
      id: "3",
      question_text: "What is the difference between compiled and interpreted languages?",
      options: [
        { label: "A", text: "Compiled runs faster, interpreted is more portable" },
        { label: "B", text: "No difference" },
        { label: "C", text: "Interpreted is always faster" },
        { label: "D", text: "Compiled languages don't exist" },
      ],
      correct_answer: "A",
    },
  ],
};

// Default fallback questions
const defaultQuestions: Question[] = [
  {
    id: "1",
    question_text: "What is the primary purpose of this lesson?",
    options: [
      { label: "A", text: "Entertainment" },
      { label: "B", text: "Learning and understanding concepts" },
      { label: "C", text: "Exercise" },
      { label: "D", text: "Cooking" },
    ],
    correct_answer: "B",
  },
  {
    id: "2",
    question_text: "How can you best remember what you learned?",
    options: [
      { label: "A", text: "By practicing regularly" },
      { label: "B", text: "By forgetting it" },
      { label: "C", text: "By ignoring it" },
      { label: "D", text: "By sleeping" },
    ],
    correct_answer: "A",
  },
];

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [lessonTitle, setLessonTitle] = useState("Quiz");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [id]);

  const fetchQuestions = async () => {
    // First, try to fetch the lesson from database to get the title
    const { data: lessonData } = await supabase
      .from("lessons")
      .select("id, title")
      .eq("id", id)
      .maybeSingle();

    if (lessonData) {
      const titleKey = lessonData.title.toLowerCase();
      setLessonTitle(`${lessonData.title} Quiz`);
      
      // Check for title-based questions
      if (quizQuestionsByTitle[titleKey]) {
        setQuestions(quizQuestionsByTitle[titleKey]);
        setIsLoading(false);
        return;
      }
    }

    // Try to fetch quiz from database
    const { data: quizData } = await supabase
      .from("quizzes")
      .select("id, title")
      .eq("lesson_id", id)
      .maybeSingle();

    if (quizData) {
      setLessonTitle(quizData.title);
      const { data: questionsData } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizData.id)
        .order("order_index");

      if (questionsData && questionsData.length > 0) {
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

    // Use default questions
    setQuestions(defaultQuestions);
    setLessonTitle(id ? `Quiz` : "Practice Quiz");
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

    if (user && id) {
      // Check if progress exists
      const { data: existingProgress } = await supabase
        .from("progress")
        .select("id, completion_percentage")
        .eq("user_id", user.id)
        .eq("lesson_id", id)
        .maybeSingle();

      if (existingProgress) {
        // Quiz adds 40% to progress (capped at 100%)
        // If already at 60% (content + all videos), this makes it 100%
        const currentWithoutQuiz = Math.min(existingProgress.completion_percentage, 60);
        const newPercentage = Math.min(currentWithoutQuiz + 40, 100);
        
        await supabase
          .from("progress")
          .update({
            completion_percentage: newPercentage,
            quiz_score: score,
            completed_at: newPercentage === 100 ? new Date().toISOString() : null,
          })
          .eq("id", existingProgress.id);
      } else {
        // Insert new progress (quiz only = 40%)
        await supabase.from("progress").insert({
          user_id: user.id,
          lesson_id: id,
          completion_percentage: 40,
          quiz_score: score,
        });
      }
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
            <Link 
              to={`/lesson/${id}`} 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Lesson
            </Link>
            <h1 className="text-3xl font-bold text-foreground">
              {lessonTitle}
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
                      Submit Quiz
                    </Button>
                  )}
                </>
              ) : (
                <Link to={`/lesson/${id}`}>
                  <Button className="btn-primary">
                    Back to Lesson
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