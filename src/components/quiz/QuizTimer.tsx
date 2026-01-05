import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface QuizTimerProps {
  initialMinutes: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

export function QuizTimer({ initialMinutes, onTimeUp, isPaused = false }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isLow = timeLeft < 60;

  return (
    <div
      className={`flex items-center gap-2 text-lg font-mono font-bold ${
        isLow ? "text-destructive animate-pulse" : "text-foreground"
      }`}
    >
      <Clock className="h-5 w-5" />
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
