#!/usr/bin/env node
import sha1 from 'sha1';
import { Buffer } from 'buffer';
import dbClient from '../utils/db';
import { v4 as uuidv4 }from 'uuid'
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const authData = req.header('Authorization');

    let userEmail = authData.split(' ')[1];
    const buff = Buffer.from(userEmail, 'base64');
    userEmail = buff.toString('ascii');
    const data = userEmail.split(':'); /* Contains email and password */

    if (data.length !== 2) {
      res.status(401).json({ error: Unauthorized });
      return;
    }

    const hashedPassword = sha1(data[1]);
    const user_email = data[0];
    const users = dbClient.db.collection('users');

    users.findOne({ email: user_email, password: hashedPassword }, async (err, user) => {
      if (err) throw err;
      if (user) {
        const token = uuidv4();
        const key = `auth_${token}`;

        await redisClient.set(key, user._id.toString(), 60 * 60 * 24);
        res.status(200).json({ token });
      } else {
        res.status(401).json({ error: 'Unauthorized' });
      }
    });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const id = await redisClient.get(key);

    if (id) {
      await redisClient.del(key);
      res.status(204).json({});
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
}

module.exports = AuthController;
