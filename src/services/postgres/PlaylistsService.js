const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const PostgresService = require('./PostgresService');

class PlaylistsService extends PostgresService {
  constructor() {
    super();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }
  async getPlaylists(owner) {
    const query = {
      text: `SELECT p.id, p.name, u.username 
             FROM playlists p 
             LEFT JOIN users u ON u.id = p.owner 
             LEFT JOIN collaborations c ON c.playlist_id = p.id
             WHERE p.owner = $1 OR c.user_id = $1
             GROUP BY p.id, p.name, u.username`,
      values: [owner],
    };

    const result = await this.query(query.text, query.values);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongToPlaylist(playlistId, songId, userId) {
    const id = `ps-${nanoid(16)}`;
    
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    await this.addActivity(playlistId, songId, userId, 'add');
  }

  async getPlaylistSongs(playlistId) {
    const playlistQuery = {
      text: `SELECT p.id, p.name, u.username 
             FROM playlists p 
             LEFT JOIN users u ON u.id = p.owner 
             WHERE p.id = $1`,
      values: [playlistId],
    };

    const playlistResult = await this.query(playlistQuery.text, playlistQuery.values);

    if (!playlistResult.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const songsQuery = {
      text: `SELECT s.id, s.title, s.performer 
             FROM songs s 
             LEFT JOIN playlist_songs ps ON ps.song_id = s.id 
             WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };

    const songsResult = await this.query(songsQuery.text, songsQuery.values);

    return {
      playlist: {
        ...playlistResult.rows[0],
        songs: songsResult.rows,
      },
    };
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal dihapus dari playlist');
    }

    await this.addActivity(playlistId, songId, userId, 'delete');
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, songId, userId, action, time],
    };

    try {
      await this.query(query.text, query.values);
    } catch {
      console.log('⚠️ Activities table not found, skipping activity recording');
    }
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT u.username, s.title, psa.action, psa.time 
             FROM playlist_song_activities psa
             LEFT JOIN users u ON u.id = psa.user_id
             LEFT JOIN songs s ON s.id = psa.song_id
             WHERE psa.playlist_id = $1
             ORDER BY psa.time DESC`,
      values: [playlistId],
    };

    try {
      const result = await this.query(query.text, query.values);
      return result.rows;
    } catch {
      return [];
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      // Check if user is collaborator
      try {
        const collaborationQuery = {
          text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
          values: [playlistId, userId],
        };

        const result = await this.query(collaborationQuery.text, collaborationQuery.values);

        if (!result.rows.length) {
          throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
      } catch {
        throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
      }
    }
  }
}

module.exports = PlaylistsService;
