#!/usr/bin/env node
import redis from 'redis';
/**
 * @module
 */

class RedisClient {
  constructor () {
    this.client = redis.createClient();

    // Display any errors on the console.
    this.client.on('error', (err) => {
      console.log(err);
    });
  }

  async isAlive() {
    const promise = (resolve) => {
      this.client.ping((err, reply) => {
        if (err) {
          resolve(false);
        } else {
          resolve(reply === 'PONG');
        }
      });
    }

    return new Promise(promise);
  }

  get() {}

  set () {}

  del () {}
}

const redisClient = new RedisClient;

module.exports = redisClient;