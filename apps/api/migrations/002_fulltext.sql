-- Existing Tiger databases retain their vector data and optional index.
create index if not exists listings_search_idx on listings using gin (
  (setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
   setweight(to_tsvector('english', coalesce(description, '')), 'B'))
);
