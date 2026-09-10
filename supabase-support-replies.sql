-- Add customer-visible replies to support tickets.
ALTER TABLE public.konektem_support
  ADD COLUMN IF NOT EXISTS admin_reply TEXT,
  ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS customer_name TEXT;