-- Check the current type of the blocks column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pages' AND column_name = 'blocks';

-- If needed, alter the column to ensure it's JSONB
ALTER TABLE pages 
ALTER COLUMN blocks TYPE JSONB USING blocks::jsonb;

-- Create an index for faster JSON queries if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_pages_blocks ON pages USING GIN (blocks);

-- Update any null blocks to empty array
UPDATE pages 
SET blocks = '[]'::jsonb 
WHERE blocks IS NULL;

-- Check a sample of the data to verify
SELECT id, title, blocks 
FROM pages 
LIMIT 5;
