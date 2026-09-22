ALTER TABLE public.suggestions ADD COLUMN problem text NOT NULL DEFAULT '';
ALTER TABLE public.suggestions ADD COLUMN expected_benefit text NOT NULL DEFAULT '';