-- Bảng lưu lượt xem theo ngày, upsert để gộp view cùng ngày
CREATE TABLE IF NOT EXISTS story_views (
  story_slug TEXT NOT NULL,
  story_name TEXT NOT NULL,
  thumb_url TEXT DEFAULT '',
  view_date TEXT NOT NULL,
  view_count INTEGER DEFAULT 1,
  PRIMARY KEY (story_slug, view_date)
);

CREATE INDEX IF NOT EXISTS idx_story_views_date ON story_views(view_date);
CREATE INDEX IF NOT EXISTS idx_story_views_count ON story_views(view_date, view_count DESC);
