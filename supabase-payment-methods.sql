-- Merchant-owned MonCash and NatCash QR configuration.
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('moncash', 'natcash')),
  qr_image_url text,
  account_name text,
  phone_number text,
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_methods_merchant_provider_key UNIQUE (merchant_id, provider)
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants read own payment methods" ON public.payment_methods;
CREATE POLICY "Merchants read own payment methods"
  ON public.payment_methods FOR SELECT TO authenticated
  USING (auth.uid() = merchant_id);

DROP POLICY IF EXISTS "Merchants insert own payment methods" ON public.payment_methods;
CREATE POLICY "Merchants insert own payment methods"
  ON public.payment_methods FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = merchant_id);

DROP POLICY IF EXISTS "Merchants update own payment methods" ON public.payment_methods;
CREATE POLICY "Merchants update own payment methods"
  ON public.payment_methods FOR UPDATE TO authenticated
  USING (auth.uid() = merchant_id)
  WITH CHECK (auth.uid() = merchant_id);

DROP POLICY IF EXISTS "Merchants delete own payment methods" ON public.payment_methods;
CREATE POLICY "Merchants delete own payment methods"
  ON public.payment_methods FOR DELETE TO authenticated
  USING (auth.uid() = merchant_id);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('merchant-payment-qr', 'merchant-payment-qr', false, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Merchants read own payment QR" ON storage.objects;
CREATE POLICY "Merchants read own payment QR"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'merchant-payment-qr' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Merchants upload own payment QR" ON storage.objects;
CREATE POLICY "Merchants upload own payment QR"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'merchant-payment-qr' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Merchants update own payment QR" ON storage.objects;
CREATE POLICY "Merchants update own payment QR"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'merchant-payment-qr' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'merchant-payment-qr' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Merchants delete own payment QR" ON storage.objects;
CREATE POLICY "Merchants delete own payment QR"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'merchant-payment-qr' AND (storage.foldername(name))[1] = auth.uid()::text);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;

ALTER TABLE IF EXISTS public.konektem_sales
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS confirmed_by text,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;