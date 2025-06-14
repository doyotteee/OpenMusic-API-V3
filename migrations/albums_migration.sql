
CREATE TABLE albums (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    year INTEGER NOT NULL
);

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
