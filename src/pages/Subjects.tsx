import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Code, 
  Calculator, 
  Atom, 
  FlaskConical, 
  Terminal, 
  Book, 
  ChevronRight,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Subject {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order_index: number;
}

// Default subjects for when DB is empty
const defaultSubjects: Subject[] = [
  { id: "dsa", name: "Data Structures & Algorithms", description: "Learn DSA concepts from basics to advanced", icon: "code", color: "blue", order_index: 1 },
  { id: "math", name: "Mathematics", description: "Master mathematical concepts and problem solving", icon: "calculator", color: "green", order_index: 2 },
  { id: "physics", name: "Physics", description: "Explore the laws of nature and physical phenomena", icon: "atom", color: "purple", order_index: 3 },
  { id: "chemistry", name: "Chemistry", description: "Understand chemical reactions and molecular structures", icon: "flask", color: "orange", order_index: 4 },
  { id: "programming", name: "Programming", description: "Learn various programming languages and paradigms", icon: "terminal", color: "teal", order_index: 5 },
];

const iconMap: Record<string, React.ElementType> = {
  code: Code,
  calculator: Calculator,
  atom: Atom,
  flask: FlaskConical,
  terminal: Terminal,
  book: Book,
};

const colorMap: Record<string, string> = {
  blue: "bg-primary/10 text-primary border-primary/20",
  green: "bg-success/10 text-success border-success/20",
  purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  orange: "bg-warning/10 text-warning border-warning/20",
  teal: "bg-accent/10 text-accent border-accent/20",
};

export default function Subjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("order_index");

    if (!error && data && data.length > 0) {
      setSubjects(data);
    } else {
      setSubjects(defaultSubjects);
    }
    setIsLoading(false);
  };

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Choose a Subject
          </h1>
          <p className="text-xl text-muted-foreground">
            Select a subject to start learning with personalized lessons
          </p>
        </header>

        {/* Search */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 input-field"
          />
        </div>

        {/* Subjects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.map((subject, index) => {
            const IconComponent = iconMap[subject.icon || "book"] || Book;
            const colorClass = colorMap[subject.color || "blue"] || colorMap.blue;

            return (
              <Link
                key={subject.id}
                to={`/lessons?subject=${subject.id}`}
                className="block animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${colorClass}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-background/80">
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <ChevronRight className="h-5 w-5 opacity-50" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {subject.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No subjects found matching your search.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
