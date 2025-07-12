const ClientError = require('../../exceptions/ClientError');

class UploadsHandler {
  constructor(storageService, albumsService, validator) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(request, h) {
    try {
      console.log('📤 Upload request received');
      console.log('Album ID:', request.params.id);
      console.log('Payload keys:', Object.keys(request.payload || {}));
      
      const { cover } = request.payload;
      const { id } = request.params;

      if (!cover) {
        console.error('❌ No cover file in payload');
        throw new ClientError('Cover file is required');
      }

      console.log('📁 File info:', {
        filename: cover.hapi?.filename,
        headers: cover.hapi?.headers,
        contentType: cover.hapi?.headers['content-type'],
      });

      this._validator.validateImageHeaders(cover.hapi.headers);
      console.log('✅ Validation passed');

      const filename = await this._storageService.writeFile(cover, cover.hapi);
      console.log('✅ File saved:', filename);
      
      const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;
      console.log('🔗 Cover URL:', coverUrl);

      await this._albumsService.updateAlbumCoverById(id, coverUrl);
      console.log('✅ Database updated');

      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      });
      response.code(201);
      return response;
    } catch (error) {
      console.error('❌ Upload error:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = UploadsHandler;
