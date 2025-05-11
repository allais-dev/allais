-- Create a function to update page blocks using raw JSON string
-- This bypasses any potential issues with how the client or Supabase handles JSONB data
CREATE OR REPLACE FUNCTION update_page_blocks_raw(
  p_id UUID,
  p_user_id UUID,
  p_blocks TEXT,
  p_updated_at TIMESTAMPTZ
) RETURNS VOID AS $$
BEGIN
  UPDATE pages
  SET 
    blocks = p_blocks::jsonb,
    updated_at = p_updated_at
  WHERE 
    id = p_id AND 
    user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
