const InvariantError = require('../exceptions/InvariantError');

const UploadsValidator = {
  validateImageHeaders: (headers) => {
    const contentType = headers['content-type'];
    
    // Valid image MIME types
    const validImageTypes = [
      'image/apng',
      'image/avif', 
      'image/gif',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/svg+xml',
      'image/webp',
      'image/bmp',
      'image/tiff',
    ];
    
    if (!contentType || !validImageTypes.includes(contentType)) {
      throw new InvariantError('Tipe file tidak valid. Harus berupa gambar');
    }
  },
};

module.exports = UploadsValidator;
