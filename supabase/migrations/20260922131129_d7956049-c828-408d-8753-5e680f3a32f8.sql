ALTER TABLE public.suggestions
  ADD COLUMN IF NOT EXISTS is_prioritized boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS responsible_person text NOT NULL DEFAULT '';