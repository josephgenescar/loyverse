-- Konektem Finance V1
-- Run once in the Supabase SQL Editor before enabling cloud finance sync.
-- The app stores these collections as JSON text to preserve the existing data model.

ALTER TABLE public.konektem_data
  ADD COLUMN IF NOT EXISTS fournisseurs text NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS achats text NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS depenses text NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS payroll text NOT NULL DEFAULT '[]';

COMMENT ON COLUMN public.konektem_data.depenses IS 'Konektem operating expenses, serialized JSON';
COMMENT ON COLUMN public.konektem_data.payroll IS 'Konektem payroll payments, serialized JSON';
COMMENT ON COLUMN public.konektem_data.achats IS 'Konektem supplier purchases, serialized JSON';
COMMENT ON COLUMN public.konektem_data.fournisseurs IS 'Konektem suppliers, serialized JSON';
