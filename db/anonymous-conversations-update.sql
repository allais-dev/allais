-- First, add is_anonymous column to chat_conversations table if it doesn't exist
ALTER TABLE IF EXISTS chat_conversations 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- Update the user_id constraint to allow null for anonymous users
ALTER TABLE IF EXISTS chat_conversations 
ALTER COLUMN user_id DROP NOT NULL;

-- Add is_anonymous column to chat_messages table if it doesn't exist
ALTER TABLE IF EXISTS chat_messages 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- Add files_metadata column to chat_messages table if it doesn't exist
ALTER TABLE IF EXISTS chat_messages 
ADD COLUMN IF NOT EXISTS files_metadata JSONB DEFAULT NULL;

-- Create an index on is_anonymous for both tables to improve query performance
CREATE INDEX IF NOT EXISTS idx_conversations_is_anonymous ON chat_conversations(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_messages_is_anonymous ON chat_messages(is_anonymous);

-- Create an index on the conversation_id in chat_messages if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON chat_messages(conversation_id);
