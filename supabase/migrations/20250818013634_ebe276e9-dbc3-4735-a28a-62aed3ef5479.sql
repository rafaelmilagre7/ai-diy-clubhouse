-- Ensure RLS allows authenticated users to read published solutions
DO $$
BEGIN
  -- Enable RLS on solutions table if it exists
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'solutions'
  ) THEN
    EXECUTE 'ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY';

    -- Create policy to allow authenticated users to select published solutions
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename = 'solutions' 
        AND policyname = 'Published solutions for authenticated'
    ) THEN
      CREATE POLICY "Published solutions for authenticated"
      ON public.solutions
      FOR SELECT
      TO authenticated
      USING (published = true);
    END IF;
  ELSE
    RAISE NOTICE 'Table public.solutions does not exist. Skipping policies.';
  END IF;
END $$; 
