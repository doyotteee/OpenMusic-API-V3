-- Hapus tabel jika sudah ada (untuk memastikan clean state)
DROP TABLE IF EXISTS playlist_song_activities CASCADE;
DROP TABLE IF EXISTS collaborations CASCADE;
DROP TABLE IF EXISTS playlist_songs CASCADE;
DROP TABLE IF EXISTS playlists CASCADE;
DROP TABLE IF EXISTS authentications CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS albums CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Membuat tabel users
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    fullname TEXT NOT NULL
);

-- Membuat tabel authentications
CREATE TABLE authentications (
    token TEXT NOT NULL
);

-- Membuat tabel albums
CREATE TABLE albums (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    year INTEGER NOT NULL
);

-- Membuat tabel songs
CREATE TABLE songs (
    id VARCHAR(50) PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    performer TEXT NOT NULL,
    genre TEXT,
    duration INTEGER,
    album_id VARCHAR(50),
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL
);

-- Membuat tabel playlists
CREATE TABLE playlists (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    owner VARCHAR(50) NOT NULL,
    FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE
);

-- Membuat tabel playlist_songs
CREATE TABLE playlist_songs (
    id VARCHAR(50) PRIMARY KEY,
    playlist_id VARCHAR(50) NOT NULL,
    song_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- Membuat tabel collaborations
CREATE TABLE collaborations (
    id VARCHAR(50) PRIMARY KEY,
    playlist_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Membuat tabel playlist_song_activities
CREATE TABLE playlist_song_activities (
    id VARCHAR(50) PRIMARY KEY,
    playlist_id VARCHAR(50) NOT NULL,
    song_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create migration tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Record this migration
INSERT INTO schema_migrations (version) VALUES ('001_create_tables') ON CONFLICT (version) DO NOTHING;
