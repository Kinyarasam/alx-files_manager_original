#!/usr/bin/env node
/**
 * @module redis
 */
import redis from 'redis';
import util from 'util';

/**
 * A class representing a redis client
 */
class RedisClient {
  constructor() {
    this.client = redis.createClient();

    // Display any errors on the console.
    this.client.on('error', (err) => {
      console.log(err.message);
      this.connected = false;
      return false;
    });

    this.client.on('connect', () => {
      this.connected = true;
      return true;
    });
  }

  // Check the connection status and report
  isAlive() {
    if (this.client) {
      return true;
    }
    return false;
  }

  // get value for given key from redis server
  async get(key) {
    const redisGet = util.promisify(this.client.get).bind(this.client);
    const value = await redisGet(key);
    return value;
  }

  // set key value pair for redis server
  async set(key, value, time) {
    const redisSet = util.promisify(this.client.setex).bind(this.client);
    return redisSet(key, time, value);
  }

  // del key value pair from redis server.
  async del(key) {
    const redisDel = util.promisify(this.client.del).bind(this.client);
    await redisDel(key);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
