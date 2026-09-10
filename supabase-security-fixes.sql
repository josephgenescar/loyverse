-- Supabase Advisor security fixes
-- Run this in Supabase SQL Editor as the owner of these views.

-- SECURITY INVOKER makes each view use the querying user's permissions and RLS.
ALTER VIEW public.customer_phone_directory SET (security_invoker = true);
ALTER VIEW public.konektem_multi_biz_stats SET (security_invoker = true);
ALTER VIEW public.konektem_referral_stats SET (security_invoker = true);

-- Confirm that all three views now use SECURITY INVOKER.
SELECT
  n.nspname AS schemaname,
  c.relname AS viewname,
  pg_get_userbyid(c.relowner) AS viewowner,
  COALESCE(c.reloptions @> ARRAY['security_invoker=true'], false) AS security_invoker_enabled
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE c.relkind = 'v'
  AND n.nspname = 'public'
  AND c.relname IN (
    'customer_phone_directory',
    'konektem_multi_biz_stats',
    'konektem_referral_stats'
  )
ORDER BY viewname;