const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const PostgresService = require('./PostgresService');

class AlbumsService extends PostgresService {
  constructor(cacheService) {
    super();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this.query('SELECT * FROM albums');
    return result.rows;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    // Get songs in this album
    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const songsResult = await this.query(songsQuery.text, songsQuery.values);

    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      year: result.rows[0].year,
      coverUrl: result.rows[0].cover_url,
      songs: songsResult.rows,
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async updateAlbumCoverById(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui cover album. Id tidak ditemukan');
    }
  }

  async likeAlbum(userId, albumId) {
    const id = `like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new InvariantError('Gagal menyukai album');
    }

    // Delete cache when likes change (if cache service is available)
    if (this._cacheService) {
      try {
        await this._cacheService.delete(`album:${albumId}:likes`);
      } catch {
        // Ignore cache errors
      }
    }
  }

  async unlikeAlbum(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this.query(query.text, query.values);

    if (!result.rows.length) {
      throw new InvariantError('Gagal batal menyukai album');
    }

    // Delete cache when likes change (if cache service is available)
    if (this._cacheService) {
      try {
        await this._cacheService.delete(`album:${albumId}:likes`);
      } catch {
        // Ignore cache errors
      }
    }
  }

  async getAlbumLikes(albumId) {
    const query = {
      text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    };

    const result = await this.query(query.text, query.values);
    return parseInt(result.rows[0].count, 10);
  }

  async getAlbumLikesWithCache(albumId) {
    // Get from database directly (skip cache for now to avoid hanging)
    const likes = await this.getAlbumLikes(albumId);
    
    return {
      likes,
      source: 'database',
    };
  }

  async verifyAlbumLike(userId, albumId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this.query(query.text, query.values);

    if (result.rows.length > 0) {
      throw new InvariantError('Album sudah disukai');
    }
  }
}

module.exports = AlbumsService;
