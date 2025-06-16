exports.shorthands = undefined;

exports.up = pgm => {
  // Create users table
  pgm.createTable('users', {
    id: { type: 'varchar(50)', primaryKey: true },
    username: { type: 'varchar(50)', unique: true, notNull: true },
    password: { type: 'text', notNull: true },
    fullname: { type: 'text', notNull: true },
  });

  // Create authentications table
  pgm.createTable('authentications', {
    token: { type: 'text', notNull: true },
  });

  // Create albums table
  pgm.createTable('albums', {
    id: { type: 'varchar(50)', primaryKey: true },
    name: { type: 'text', notNull: true },
    year: { type: 'integer', notNull: true },
  });

  // Create songs table
  pgm.createTable('songs', {
    id: { type: 'varchar(50)', primaryKey: true },
    title: { type: 'text', notNull: true },
    year: { type: 'integer', notNull: true },
    performer: { type: 'text', notNull: true },
    genre: { type: 'text' },
    duration: { type: 'integer' },
    album_id: { type: 'varchar(50)', references: 'albums(id)', onDelete: 'SET NULL' },
  });

  // Create playlists table
  pgm.createTable('playlists', {
    id: { type: 'varchar(50)', primaryKey: true },
    name: { type: 'text', notNull: true },
    owner: { type: 'varchar(50)', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
  });

  // Create playlist_songs table
  pgm.createTable('playlist_songs', {
    id: { type: 'varchar(50)', primaryKey: true },
    playlist_id: { type: 'varchar(50)', notNull: true, references: 'playlists(id)', onDelete: 'CASCADE' },
    song_id: { type: 'varchar(50)', notNull: true, references: 'songs(id)', onDelete: 'CASCADE' },
  });

  // Create collaborations table
  pgm.createTable('collaborations', {
    id: { type: 'varchar(50)', primaryKey: true },
    playlist_id: { type: 'varchar(50)', notNull: true, references: 'playlists(id)', onDelete: 'CASCADE' },
    user_id: { type: 'varchar(50)', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
  });

  // Create playlist_song_activities table
  pgm.createTable('playlist_song_activities', {
    id: { type: 'varchar(50)', primaryKey: true },
    playlist_id: { type: 'varchar(50)', notNull: true, references: 'playlists(id)', onDelete: 'CASCADE' },
    song_id: { type: 'varchar(50)', notNull: true, references: 'songs(id)', onDelete: 'CASCADE' },
    user_id: { type: 'varchar(50)', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    action: { type: 'varchar(50)', notNull: true },
    time: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = pgm => {
  pgm.dropTable('playlist_song_activities');
  pgm.dropTable('collaborations');
  pgm.dropTable('playlist_songs');
  pgm.dropTable('playlists');
  pgm.dropTable('songs');
  pgm.dropTable('albums');
  pgm.dropTable('authentications');
  pgm.dropTable('users');
};
