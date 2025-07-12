-- Add cover_url column to albums table
ALTER TABLE albums ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Create user_album_likes table
CREATE TABLE IF NOT EXISTS user_album_likes (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    album_id VARCHAR(50) NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    UNIQUE(user_id, album_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_album_likes_user_id ON user_album_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_album_likes_album_id ON user_album_likes(album_id);
