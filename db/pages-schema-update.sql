-- Update pages table to support structured content
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS blocks JSONB DEFAULT '[]'::jsonb;

-- Add index for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_pages_blocks ON pages USING GIN (blocks);
