CREATE TABLE public.suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Övrigt',
  status TEXT NOT NULL DEFAULT 'Ny',
  author_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.suggestions TO anon;
GRANT SELECT, INSERT ON public.suggestions TO authenticated;
GRANT ALL ON public.suggestions TO service_role;

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read suggestions"
  ON public.suggestions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can submit suggestions"
  ON public.suggestions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

INSERT INTO public.suggestions (title, description, category, status, author_name, created_at) VALUES
  ('Tydligare ledning på akuten', 'Flerriktade skyltar vid entrén så att besökare snabbt hittar rätt mottagning.', 'Patientvård', 'Pågår', 'Maria L.', now() - interval '9 days'),
  ('Fler mötesrum i B-plan', 'Teamet behöver utrymme för dagliga avstämningar utan att störa patientvården.', 'Arbetsmiljö', 'Ny', NULL, now() - interval '6 days'),
  ('Förenklad journalföring', 'Standardmallar i systemet sparar tid per besök och minskar administrativa fel.', 'IT & system', 'Klar', 'Jonas K.', now() - interval '12 days'),
  ('Digital bokning av rehabtider', 'Självservice för ombokning skulle minska antalet telefonsamtal markant.', 'Patientvård', 'Ny', 'A. Lindqvist', now() - interval '3 days');