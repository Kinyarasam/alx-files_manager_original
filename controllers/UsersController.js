#!/usr/bin/env node
import dbClient from '../utils/db';
import sha1 from 'sha1';
import Queue from 'bull';
import redisClient from '../utils/redis';
import { ObjectID } from 'mongodb';

const userQueue = new Queue('userQueue', 'redis://127.0.0.1:6379');

class UsersController {
	static postNew(req, res) {

		console.log(req.body);
		const { email } = req.body;
		const { password } = req.body;

		if (!email) {
			res.status(400).json({ error: 'Missing email' });
			return;
		}
		if (!password) {
			res.status(400).json({ error: 'Missing password' });
			return;
		}

		const users = dbClient.db.collection('users');

		users.findOne({ email }, (err, user) => {
			if (err) throw err;
			if (user) {
				res.status(400).json({ error: 'Already exist' })
			} else {
				const hashedPassword = sha1(password);

				users.insertOne({
					email,
					password: hashedPassword,
				}).then((result) => {
					res.status(201).json({ id: result.insertedId, email });
					userQueue.add({ userId: result.insertedId });
				}).catch((err) => console.log(err))
			}
		});
	}

  static async getMe(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (userId) {
      const users = dbClient.db.collection('users');
      const idObject = new ObjectID(userId);

      users.findOne({ _id: idObject }, (err, user) => {
        if (err) throw err;
        if (user) {
          res.status(201).json({ id: userId, email: user.email });
        } else {
          res.status(401).json({ error: 'Unauthorized' });
        }
      });
    } else {
      console.log(`token ${token} Does not exist`);
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
}

module.exports = UsersController;
