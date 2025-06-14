const mapDBToModel = (song) => ({
  id: song.id,
  title: song.title,
  year: song.year,
  performer: song.performer,
  genre: song.genre,
  duration: song.duration,
});

module.exports = { mapDBToModel };
