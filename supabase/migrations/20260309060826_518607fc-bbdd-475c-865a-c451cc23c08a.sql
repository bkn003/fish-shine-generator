CREATE TABLE IF NOT EXISTS public.ai_backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL DEFAULT 1,
  day_label TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL,
  image_data TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_backgrounds ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own AI backgrounds"
  ON public.ai_backgrounds
  FOR SELECT
  USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create their own AI backgrounds"
  ON public.ai_backgrounds
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own AI backgrounds"
  ON public.ai_backgrounds
  FOR DELETE
  USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_backgrounds_user_created_at
  ON public.ai_backgrounds (user_id, created_at DESC);