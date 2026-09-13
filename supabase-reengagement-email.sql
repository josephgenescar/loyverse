-- Prepare one-time re-engagement emails without sending duplicates.
-- Run this in the Supabase SQL Editor before calling the Netlify function.

CREATE TABLE IF NOT EXISTS public.email_campaign_sends (
  id BIGSERIAL PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  provider_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (campaign_id, email)
);

CREATE INDEX IF NOT EXISTS idx_email_campaign_sends_campaign
  ON public.email_campaign_sends (campaign_id);

ALTER TABLE public.email_campaign_sends ENABLE ROW LEVEL SECURITY;

-- The table is written only by the server-side function with the service key.
-- No browser client should be able to read or write campaign history.
