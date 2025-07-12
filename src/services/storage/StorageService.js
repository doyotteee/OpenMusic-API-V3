const fs = require('fs');
const path = require('path');

class StorageService {
  constructor(folder = path.resolve(__dirname, '../../upload/images')) {
    this._folder = folder;
    console.log('📁 Storage folder:', this._folder);

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log('✅ Created upload directory:', folder);
    } else {
      console.log('✅ Upload directory exists:', folder);
    }
  }

  writeFile(file, meta) {
    const filename = +new Date() + meta.filename;
    const filePath = `${this._folder}/${filename}`;
    
    console.log('💾 Writing file:', filePath);

    const fileStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => {
        console.error('❌ File write error:', error);
        reject(error);
      });
      
      fileStream.on('finish', () => {
        console.log('✅ File saved successfully:', filename);
        resolve(filename);
      });
      
      file.pipe(fileStream);
    });
  }
}

module.exports = StorageService;
