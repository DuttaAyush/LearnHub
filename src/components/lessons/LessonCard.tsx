import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface LessonCardProps {
  id: string;
  title: string;
  progress: number;
  difficulty: string;
  tags?: string[];
}

export function LessonCard({ id, title, progress, difficulty, tags }: LessonCardProps) {
  const difficultyColors = {
    beginner: "bg-success/10 text-success",
    intermediate: "bg-warning/10 text-warning",
    advanced: "bg-destructive/10 text-destructive",
  };

  return (
    <Link to={`/lesson/${id}`} className="block">
      <div className="card-lesson group">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">{progress}%</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        <div className="progress-bar mb-4">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              difficultyColors[difficulty as keyof typeof difficultyColors] || difficultyColors.beginner
            }`}
          >
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
          {tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
