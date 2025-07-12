exports.up = (pgm) => {
  // Create user_album_likes table
  pgm.createTable('user_album_likes', {
    id: { type: 'varchar(50)', primaryKey: true },
    user_id: { type: 'varchar(50)', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    album_id: { type: 'varchar(50)', notNull: true, references: 'albums(id)', onDelete: 'CASCADE' },
  });

  // Add unique constraint for user_album_likes
  pgm.addConstraint('user_album_likes', 'unique_user_album_like', 'UNIQUE(user_id, album_id)');
};

exports.down = (pgm) => {
  pgm.dropTable('user_album_likes');
};
