-- Migration: create simple newsfeed view
-- Creates `public.v_newsfeed_feed` based on `publications` table (only published items)

CREATE OR REPLACE VIEW public.v_newsfeed_feed AS
SELECT p.id,
       substring(coalesce(p.title, '') || ' ' || coalesce(p.content, '') from 1 for 120) AS title,
       p.content,
       p.image_url,
       p.created_at,
       p.updated_at,
       p.author_id,
       p.category,
       p.is_active,
       p.moderation_status
FROM public.publications p
WHERE coalesce(p.published, false) = true
ORDER BY p.created_at DESC;

-- Optional: index on publications.created_at is recommended for performance
-- CREATE INDEX IF NOT EXISTS idx_publications_created_at ON public.publications (created_at DESC);
