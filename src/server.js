require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['PGUSER', 'PGHOST', 'PGDATABASE', 'ACCESS_TOKEN_KEY', 'REFRESH_TOKEN_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.log('💡 Please check your .env file');
  // Set default values for missing vars to prevent crash
  if (!process.env.PGUSER) process.env.PGUSER = 'postgres';
  if (!process.env.PGHOST) process.env.PGHOST = 'localhost';
  if (!process.env.PGDATABASE) process.env.PGDATABASE = 'openmusic';
  if (!process.env.ACCESS_TOKEN_KEY) process.env.ACCESS_TOKEN_KEY = 'fallback-access-token-key';
  if (!process.env.REFRESH_TOKEN_KEY) process.env.REFRESH_TOKEN_KEY = 'fallback-refresh-token-key';
}

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

// songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./utils/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

// albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

// cache
const CacheService = require('./services/redis/CacheService');

const ClientError = require('./exceptions/ClientError');

const init = async () => {
  console.log('🚀 Starting OpenMusic API V2...');
  
  // Initialize services
  let cacheService = null;
  try {
    cacheService = new CacheService();
    console.log('✅ Cache service initialized');
  } catch {
    console.log('⚠️ Cache service not available, running without cache');
  }
  
  const albumsService = new AlbumsService(cacheService);
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService();
  const collaborationsService = new CollaborationsService();
  const storageService = new StorageService(path.resolve(__dirname, '../upload/images'));

  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Register JWT plugin
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // JWT authentication strategy
  server.auth.strategy('openmusicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });
  // Register plugins (hanya sekali!)
  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },    {
      plugin: playlists,
      options: {
        service: playlistsService,
        songsService,
        validator: PlaylistsValidator,
      },
    },    {
      plugin: collaborations,
      options: {
        service: collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        storageService,
        albumsService,
        validator: UploadsValidator,
      },
    },
  ]);

  // Static file serving for images
  server.route({
    method: 'GET',
    path: '/upload/images/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, '../upload/images'),
      },
    },
  });

  // Error handling
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      console.error('❌ Error occurred:', {
        message: response.message,
        stack: response.stack,
        statusCode: response.statusCode,
      });

      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });  // Test route
  server.route({
    method: 'GET',
    path: '/',
    handler: () => ({
      message: 'OpenMusic API V2 is running!',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    }),
  });

  // Routes listing endpoint for debugging
  server.route({
    method: 'GET',
    path: '/routes',
    handler: (request) => {
      const routes = request.server.table().map(route => ({
        method: route.method.toUpperCase(),
        path: route.path,
        description: route.settings.description || 'No description',
      }));
      
      return {
        status: 'success',
        totalRoutes: routes.length,
        routes: routes.sort((a, b) => a.path.localeCompare(b.path)),
      };
    },
  });

  // Health check route for debugging
  server.route({
    method: 'GET',
    path: '/health',
    handler: async () => {
      try {
        // Test database connection with a simple query
        const testQuery = await albumsService.query('SELECT NOW()');
        return {
          status: 'healthy',
          database: 'connected',
          timestamp: new Date().toISOString(),
          dbTime: testQuery.rows[0].now,
        };
      } catch (error) {
        return {
          status: 'unhealthy', 
          database: 'disconnected',
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }
    },
  });

  await server.start();
  console.log(`✅ Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection:', err);
  process.exit(1);
});

init();