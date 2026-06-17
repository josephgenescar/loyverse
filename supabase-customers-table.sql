-- ═══════════════════════════════════════════════════════════════════════════════
-- SUPABASE SQL: CREATE CUSTOMERS TABLE WITH PHONE NUMBERS
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run this SQL in your Supabase SQL Editor to create the customers table
-- This will allow you to store customer phone numbers and call them directly
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop table if exists (uncomment if you want to recreate)
-- DROP TABLE IF EXISTS customers CASCADE;

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES konektem_users(id) ON DELETE CASCADE, -- Link to user account
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL, -- Phone number (required for direct calls)
  phone_normalized TEXT, -- Normalized phone (digits only) for easy lookup
  company TEXT, -- Optional company name
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Haïti',
  notes TEXT, -- Notes about customer
  total_purchases DECIMAL(10,2) DEFAULT 0, -- Total amount spent
  purchase_count INTEGER DEFAULT 0, -- Number of purchases
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  is_vip BOOLEAN DEFAULT false, -- VIP customer flag
  tags TEXT[], -- Tags for categorization (e.g., 'regular', 'wholesale', etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_phone_normalized ON customers(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers USING gin(to_tsvector('french', name));
CREATE INDEX IF NOT EXISTS idx_customers_last_purchase ON customers(last_purchase_date DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own customers
CREATE POLICY "Users can view their own customers"
ON customers FOR SELECT
USING (auth.uid()::text = user_id::text OR user_id IN (
  SELECT id FROM konektem_users WHERE email = auth.jwt()->>'email'
));

-- Policy: Users can insert their own customers
CREATE POLICY "Users can insert their own customers"
ON customers FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text OR user_id IN (
  SELECT id FROM konektem_users WHERE email = auth.jwt()->>'email'
));

-- Policy: Users can update their own customers
CREATE POLICY "Users can update their own customers"
ON customers FOR UPDATE
USING (auth.uid()::text = user_id::text OR user_id IN (
  SELECT id FROM konektem_users WHERE email = auth.jwt()->>'email'
));

-- Policy: Users can delete their own customers
CREATE POLICY "Users can delete their own customers"
ON customers FOR DELETE
USING (auth.uid()::text = user_id::text OR user_id IN (
  SELECT id FROM konektem_users WHERE email = auth.jwt()->>'email'
));

-- Create a function to normalize phone numbers (remove spaces, dashes, etc.)
CREATE OR REPLACE FUNCTION normalize_phone(phone TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove all non-digit characters
  RETURN regexp_replace(phone, '[^0-9]', '', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a trigger to automatically normalize phone numbers
CREATE OR REPLACE FUNCTION trigger_normalize_phone()
RETURNS TRIGGER AS $$
BEGIN
  NEW.phone_normalized = normalize_phone(NEW.phone);
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger
DROP TRIGGER IF EXISTS trg_normalize_phone ON customers;
CREATE TRIGGER trg_normalize_phone
BEFORE INSERT OR UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION trigger_normalize_phone();

-- Create a function to update customer stats (total purchases, count, etc.)
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- This would be called when sales are added
  -- For now, it's a placeholder for future implementation
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comments
COMMENT ON TABLE customers IS 'Customer information with phone numbers for direct contact';
COMMENT ON COLUMN customers.phone IS 'Customer phone number (required for direct calls)';
COMMENT ON COLUMN customers.phone_normalized IS 'Normalized phone number (digits only) for easy lookup';
COMMENT ON COLUMN customers.total_purchases IS 'Total amount spent by this customer';
COMMENT ON COLUMN customers.purchase_count IS 'Number of purchases made by this customer';
COMMENT ON COLUMN customers.is_vip IS 'VIP customer flag for special treatment';

-- Create a view for easy customer lookup with phone numbers
CREATE OR REPLACE VIEW customer_phone_directory AS
SELECT 
  id,
  user_id,
  name,
  email,
  phone,
  phone_normalized,
  company,
  total_purchases,
  purchase_count,
  last_purchase_date,
  is_vip,
  tags,
  created_at
FROM customers
WHERE is_active = true
ORDER BY last_purchase_date DESC NULLS LAST;

COMMENT ON VIEW customer_phone_directory IS 'Quick view of active customers with phone numbers for direct calls';

-- Sample query to find a customer by phone number
-- SELECT * FROM customers WHERE phone_normalized = '50948868964';

-- Sample query to search customers by name
-- SELECT * FROM customers WHERE to_tsvector('french', name) @@ to_tsquery('french', 'jean');

-- Sample query to get VIP customers
-- SELECT * FROM customers WHERE is_vip = true ORDER BY total_purchases DESC;

-- Sample query to get top customers by purchase amount
-- SELECT * FROM customers ORDER BY total_purchases DESC LIMIT 10;
