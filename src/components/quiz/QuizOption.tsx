interface QuizOptionProps {
  label: string;
  text: string;
  selected: boolean;
  correct?: boolean;
  showResult?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function QuizOption({
  label,
  text,
  selected,
  correct,
  showResult,
  onClick,
  disabled,
}: QuizOptionProps) {
  let className = "quiz-option";
  
  if (showResult) {
    if (correct) {
      className += " correct";
    } else if (selected && !correct) {
      className += " incorrect";
    }
  } else if (selected) {
    className += " selected";
  }

  return (
    <button
      type="button"
      className={`${className} w-full text-left`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex items-center gap-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-secondary-foreground">
          {label}
        </span>
        <span className="text-foreground font-medium">{text}</span>
      </div>
    </button>
  );
}
