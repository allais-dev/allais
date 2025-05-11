-- Create the pages table
create table public.pages (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  title text not null,
  content text null,
  icon text null,
  parent_id uuid null,
  is_archived boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  blocks jsonb null default '[]'::jsonb,
  constraint pages_pkey primary key (id),
  constraint fk_user foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint pages_parent_id_fkey foreign KEY (parent_id) references pages (id) on delete set null,
  constraint pages_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- Create indexes for better performance
create index IF not exists idx_pages_user_id on public.pages using btree (user_id) TABLESPACE pg_default;
create index IF not exists idx_pages_parent_id on public.pages using btree (parent_id) TABLESPACE pg_default;
create index IF not exists idx_pages_blocks on public.pages using gin (blocks) TABLESPACE pg_default;

-- Create RLS policies for the pages table
-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own pages
CREATE POLICY select_own_pages ON public.pages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own pages
CREATE POLICY insert_own_pages ON public.pages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own pages
CREATE POLICY update_own_pages ON public.pages
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own pages
CREATE POLICY delete_own_pages ON public.pages
  FOR DELETE
  USING (auth.uid() = user_id);
