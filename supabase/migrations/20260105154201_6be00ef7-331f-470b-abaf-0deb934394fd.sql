-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'book',
  color TEXT DEFAULT 'blue',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Anyone can view subjects
CREATE POLICY "Subjects are viewable by everyone"
ON public.subjects
FOR SELECT
USING (true);

-- Only admins/teachers can manage subjects
CREATE POLICY "Admins and teachers can manage subjects"
ON public.subjects
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'teacher')
  )
);

-- Add subject_id to lessons table
ALTER TABLE public.lessons
ADD COLUMN subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL;

-- Create trigger for subjects updated_at
CREATE TRIGGER update_subjects_updated_at
BEFORE UPDATE ON public.subjects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subjects
INSERT INTO public.subjects (name, description, icon, color, order_index) VALUES
('Data Structures & Algorithms', 'Learn DSA concepts from basics to advanced', 'code', 'blue', 1),
('Mathematics', 'Master mathematical concepts and problem solving', 'calculator', 'green', 2),
('Physics', 'Explore the laws of nature and physical phenomena', 'atom', 'purple', 3),
('Chemistry', 'Understand chemical reactions and molecular structures', 'flask', 'orange', 4),
('Programming', 'Learn various programming languages and paradigms', 'terminal', 'teal', 5);