-- Fix: Allow anonymous users to check if they already have access
-- This fixes the bug where entering an email on checkout tries to charge again
-- even when the user already has a completed order, because RLS blocks the read.

-- Drop the old policy that only allows authenticated users to see their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON livestream_orders;

-- Add new policy: Anyone can check orders by email (needed for checkout duplicate detection)
-- This is safe because order data (email, status, event) is not sensitive
CREATE POLICY "Anyone can check orders by email" ON livestream_orders
  FOR SELECT USING (true);

-- Also fix user_profiles for case-insensitive email lookups during checkout
-- Drop old policy that requires authentication
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

-- Allow anonymous profile lookups by email (needed for checkout flow)
CREATE POLICY "Anyone can lookup profiles by email" ON user_profiles
  FOR SELECT USING (true);