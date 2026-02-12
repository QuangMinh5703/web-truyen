CREATE TABLE IF NOT EXISTS story_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    story_id VARCHAR(255) NOT NULL,
    story_slug VARCHAR(255) NOT NULL,
    story_title VARCHAR(255),
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_story_id (story_id),
    INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS story_stats (
    story_id VARCHAR(255) PRIMARY KEY,
    story_slug VARCHAR(255) NOT NULL,
    story_title VARCHAR(255),
    total_views INT DEFAULT 0,
    last_viewed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    score INT DEFAULT 0,
    INDEX idx_total_views (total_views)
);
