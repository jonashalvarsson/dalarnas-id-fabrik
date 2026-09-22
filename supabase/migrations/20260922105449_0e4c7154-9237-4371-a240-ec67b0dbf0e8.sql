CREATE TABLE public.suggestion_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion_id uuid NOT NULL REFERENCES public.suggestions(id) ON DELETE CASCADE,
  voter_key text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (suggestion_id, voter_key)
);

CREATE INDEX idx_suggestion_votes_suggestion ON public.suggestion_votes(suggestion_id);

GRANT SELECT, INSERT, DELETE ON public.suggestion_votes TO anon;
GRANT SELECT, INSERT, DELETE ON public.suggestion_votes TO authenticated;
GRANT ALL ON public.suggestion_votes TO service_role;

ALTER TABLE public.suggestion_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read votes" ON public.suggestion_votes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can vote" ON public.suggestion_votes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can remove a vote" ON public.suggestion_votes FOR DELETE TO anon, authenticated USING (true);