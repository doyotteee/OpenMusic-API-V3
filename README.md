# OpenMusic API V2

OpenMusic API V2 adalah backend service untuk aplikasi musik yang dibangun menggunakan Hapi.js dan PostgreSQL. API ini menyediakan fitur lengkap untuk manajemen lagu, album, playlist, dan kolaborasi antar pengguna.

## Fitur Utama

### ✅ Fitur Wajib
- **Album Management**: CRUD operasi untuk album
- **Song Management**: CRUD operasi untuk lagu dengan relasi ke album
- **User Authentication**: Registrasi dan login dengan JWT
- **Private Playlists**: Playlist pribadi dengan autentikasi
- **Data Validation**: Validasi input menggunakan Joi schema
- **Error Handling**: Global error handling dengan response format standar
- **Foreign Key Relations**: Relasi antar tabel dengan constraint

### ✅ Fitur Opsional
- **Playlist Collaboration**: Kolaborasi playlist antar pengguna
- **Playlist Activities**: Log aktivitas playlist (add/delete songs)
- **Song Search**: Pencarian lagu berdasarkan title dan performer
- **Album Detail**: Detail album dengan daftar lagu

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Hapi.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Token)
- **Validation**: Joi
- **Migration**: node-pg-migrate
- **Environment**: dotenv

## Setup & Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/doyotteee/OpenMusic-API-V2.git
   cd OpenMusic-API-V2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   
   **WAJIB: Jalankan migration manual sebelum start server**
   ```bash
   npm run migrate
   ```

4. **Environment variables**
   Buat file `.env` dengan konfigurasi berikut:
   ```env
   # Server
   HOST=localhost
   PORT=5000

   # Database
   PGUSER=your_db_user
   PGHOST=localhost
   PGPASSWORD=your_db_password
   PGDATABASE=openmusic
   PGPORT=5432

   # JWT
   ACCESS_TOKEN_KEY=your_access_token_secret
   REFRESH_TOKEN_KEY=your_refresh_token_secret
   ACCESS_TOKEN_AGE=1800
   ```

5. **Run the server**
   ```bash
   # SETELAH migration (step 3)
   npm start
   ```
   
   Server akan start di port yang ditentukan (default: 5000)

## Database Migration

Project ini menggunakan **node-pg-migrate** untuk database migration:

### **Setup Database (WAJIB)**
```bash
# Jalankan migration untuk membuat semua table
npm run migrate up

# Setelah itu baru start server
npm start
```

### **Migration Commands**
```bash
# Jalankan migration (create tables)
npm run migrate up

# Rollback migration (drop tables)
npm run migrate down

# Check migration status
npm run migrate list
```

### **Migration Details**
- 📁 **Migration File**: `migrations/1671234567890_create-tables.js` berisi semua tabel wajib
- 🏷️ **Version Tracking**: Migration yang sudah dijalankan dicatat di tabel `pgmigrations`  
- 🛡️ **Safe Re-run**: Migration yang sama tidak akan dijalankan ulang
- 🔄 **Rollback**: Gunakan `npm run migrate:down` untuk rollback

**PENTING: Selalu jalankan `npm run migrate up` sebelum `npm start`**

## API Documentation

### Authentication
- `POST /users` - Register user baru
- `POST /authentications` - Login user
- `PUT /authentications` - Refresh access token
- `DELETE /authentications` - Logout user

### Albums
- `POST /albums` - Tambah album baru
- `GET /albums/{id}` - Detail album dengan daftar lagu
- `PUT /albums/{id}` - Update album
- `DELETE /albums/{id}` - Hapus album

### Songs
- `POST /songs` - Tambah lagu baru
- `GET /songs` - Daftar lagu (support query search)
- `GET /songs/{id}` - Detail lagu
- `PUT /songs/{id}` - Update lagu
- `DELETE /songs/{id}` - Hapus lagu

### Playlists
- `POST /playlists` - Buat playlist baru
- `GET /playlists` - Daftar playlist user
- `DELETE /playlists/{id}` - Hapus playlist
- `POST /playlists/{id}/songs` - Tambah lagu ke playlist
- `GET /playlists/{id}/songs` - Daftar lagu dalam playlist
- `DELETE /playlists/{id}/songs` - Hapus lagu dari playlist
- `GET /playlists/{id}/activities` - Log aktivitas playlist

### Collaborations
- `POST /collaborations` - Tambah kolaborator playlist
- `DELETE /collaborations` - Hapus kolaborator playlist

## Project Structure

```
src/
├── api/                    # API endpoints
│   ├── albums/            # Album endpoints
│   ├── authentications/   # Auth endpoints
│   ├── collaborations/    # Collaboration endpoints
│   ├── playlists/         # Playlist endpoints
│   ├── songs/             # Song endpoints
│   └── users/             # User endpoints
├── exceptions/            # Custom error classes
├── services/              # Business logic
│   └── postgres/          # PostgreSQL services
├── utils/                 # Utilities (TokenManager, etc)
└── validator/             # Joi validation schemas
```

## Testing

Project ini dilengkapi dengan Postman collection untuk testing:
- `Open Music API V2 Test.postman_collection.json`
- `OpenMusic API Test.postman_environment.json`

Import kedua file tersebut ke Postman untuk testing lengkap semua endpoint.

## Database Schema

### Tables
- `users` - Data pengguna
- `authentications` - Refresh tokens
- `albums` - Data album
- `songs` - Data lagu dengan relasi ke albums
- `playlists` - Data playlist milik user
- `playlist_songs` - Relasi many-to-many playlist dan songs
- `collaborations` - Kolaborasi playlist antar user
- `playlist_song_activities` - Log aktivitas playlist

## Code Quality

- ESLint configuration untuk code style consistency
- Global error handling dengan standardized response
- Auto-binding untuk cleaner handler code
- Proper separation of concerns (handler, service, validator)

## License

This project is created for educational purposes as part of Dicoding Backend Expert learning path.
