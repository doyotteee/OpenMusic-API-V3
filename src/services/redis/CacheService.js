const redis = require('redis');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER || 'localhost',
        port: 6379,
      },
    });

    this._client.on('error', (error) => {
      console.error('Redis Client Error:', error.message);
    });

    this._client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
  }

  async _ensureConnection() {
    if (!this._client.isOpen) {
      await this._client.connect();
    }
  }

  async set(key, value, expirationInSecond = 1800) { // 30 minutes default
    try {
      await this._ensureConnection();
      await this._client.setEx(key, expirationInSecond, value);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async get(key) {
    try {
      await this._ensureConnection();
      const result = await this._client.get(key);
      if (result === null) throw new Error('Cache tidak ditemukan');
      return result;
    } catch {
      throw new Error('Cache tidak ditemukan');
    }
  }

  async delete(key) {
    try {
      await this._ensureConnection();
      return await this._client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
}

module.exports = CacheService;
