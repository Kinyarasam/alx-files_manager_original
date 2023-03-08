#!/usr/bin/env node
/**
 * @module db
 */
import mongodb from 'mongodb';

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'files_manager';

const url = `mongodb://${HOST}:${PORT}`;

/**
 * Class repressenting a MongoDB client
 */
class DBClient {
  constructor() {
    this.client = new mongodb.MongoClient(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    this.client.connect().then(() => {
      this.db = this.client.db(DATABASE);
    });
  }

  isAlive() {
    if (this.client.isConnected()) return true;
    return false;
  }

  async nbUsers() {
    const users = this.db.collection('users');
    const usersNum = await users.countDocuments();

    return usersNum;
  }

  async nbFiles() {
    const files = this.db.collection('files');
    const filesNum = await files.countDocuments();

    return filesNum;
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
