const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this); // mem-bind nilai this untuk seluruh method sekaligus
  }  async addSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { title, year, performer, genre, duration, albumId } = request.payload;
    const songId = await this._service.addSong({ title, year, performer, genre, duration, albumId });
    
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: { songId },
    });
    response.code(201);
    return response;
  }
  async getSongsHandler(request) {
    const { title, performer } = request.query;
    const songs = await this._service.getSongs(title, performer);
    return {
      status: 'success',
      data: { songs },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return {
      status: 'success',
      data: { song },
    };
  }
  async editSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;
    const { title, year, performer, genre, duration, albumId } = request.payload;
    await this._service.editSongById(id, { title, year, performer, genre, duration, albumId });
    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteSongById(id);
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
