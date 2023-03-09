#!/usr/bin/env node
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { ObjectID } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import Queue from 'bull';
import { promises as fs } from 'fs';

const fileQueue = new Queue('fileQueue', 'redis://127.0.0.1:6379');

class FilesController {
  static async getUser(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get('key');

    if (userId) {
      const users = dbClient.db.collection('users');
      const idObject = new ObjectID(userId);
      const user = await users.findOne({ _id: idObject });

      if (!user) return null;
      return user;
    }
    return null;
  }

  // static async postUpload(req, res) {
  //   const user = await FileController.getUser(req);

  //   if (!user && user === null) {
  //     return res.status(401).json({ error: 'Unauthorized' });
  //   }

  //   const { name } = req.body;
  //   const { type } = req.body;
  //   const { parentId } = req.body;
  //   const isPublic = req.body.isPublic || false;
  //   const { data } = req.body;

  //   if (!name) {
  //     return res.status(400).json({ error: 'Missing name' });
  //   }
  //   if (!type) {
  //     return res.status(400).json({ error: 'Missing type' });
  //   }
  //   if (type !== 'folder' && !data) {
  //     return res.status(400).json({ error: 'Missing data' });
  //   }

  //   const files = dbClient.db.collection('files');
  //   if (parentId) {
  //     const idObject = new ObjectID(parentId);
  //     const files = await files.findOne({ _id: idObject, userId: user._id });

  //     if (!files) {
  //       return res.status(400).json({ error: 'Parent not found' });
  //     }
  //     if (files.type !== 'folder') {
  //       return res.status(400).json({ error: 'Parent is not a folder' });
  //     }
  //   }
  //   if (type === 'folder') {
  //     files.insertOne({
  //       userId: user._id,
  //       name, type,
  //       parentId: parentId || 0,
  //       isPublic,
  //     }).then((result) => res.status(201).json({
  //       id: result.insertedId,
  //       userId: user._id,
  //       name,
  //       type,
  //       isPublic,
  //       parentId: parentId || 0, 
  //     })).catch((err) => {
  //       console.log(err);
  //     });
  //   } else {
  //     const filePath = process.env.FOLDER_PATH || '/tmp/filemanager';
  //     const fileName = `${filePath}/${uuidv4()}`;
  //     const buff = Buffer.from(data, 'base64');

  //     try {
  //       try {
  //         await fs.mkdir(filePath);
  //       } catch (err) {
  //         /* Error raised if file already exists */
  //         throw new Error(`File Already exists...\n${error}`)
  //       }
  //       await fs.writeFile(fileName, buff, 'utf-8');
  //     } catch (err) {
  //       console.log(err);
  //     }
  //     files.insertOne({
  //       userId: user._id,
  //       name,
  //       type,
  //       isPublic,
  //       parentId: parentId || 0,
  //       localPath: fileName
  //     }).then((result) => {
  //       res.status(201).json({
  //         id: result.insertedId,
  //         userId: user._id,
  //         name,
  //         type,
  //         isPublic,
  //         parentId: parentId || 0,
  //       }).catch((err) => {
  //         console.log(err);
  //       });
  //       if (type == 'image') {
  //         fileQueue.add({
  //           userId: user._id,
  //           fileId: result.insertedId
  //         });
  //       }
  //     }).catch((err) => {
  //       console.log(err);
  //     });
  //   }
  //   return null;
  // }

  static async postUpload(request, response) {
    const user = await FilesController.getUser(request);
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const { name } = request.body;
    const { type } = request.body;
    const { parentId } = request.body;
    const isPublic = request.body.isPublic || false;
    const { data } = request.body;
    if (!name) {
      return response.status(400).json({ error: 'Missing name' });
    }
    if (!type) {
      return response.status(400).json({ error: 'Missing type' });
    }
    if (type !== 'folder' && !data) {
      return response.status(400).json({ error: 'Missing data' });
    }

    const files = dbClient.db.collection('files');
    if (parentId) {
      const idObject = new ObjectID(parentId);
      const file = await files.findOne({ _id: idObject, userId: user._id });
      if (!file) {
        return response.status(400).json({ error: 'Parent not found' });
      }
      if (file.type !== 'folder') {
        return response.status(400).json({ error: 'Parent is not a folder' });
      }
    }
    if (type === 'folder') {
      files.insertOne(
        {
          userId: user._id,
          name,
          type,
          parentId: parentId || 0,
          isPublic,
        },
      ).then((result) => response.status(201).json({
        id: result.insertedId,
        userId: user._id,
        name,
        type,
        isPublic,
        parentId: parentId || 0,
      })).catch((error) => {
        console.log(error);
      });
    } else {
      const filePath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const fileName = `${filePath}/${uuidv4()}`;
      const buff = Buffer.from(data, 'base64');
      // const storeThis = buff.toString('utf-8');
      try {
        try {
          await fs.mkdir(filePath);
        } catch (error) {
        // pass. Error raised when file already exists
        }
        await fs.writeFile(fileName, buff, 'utf-8');
      } catch (error) {
        console.log(error);
      }
      files.insertOne(
        {
          userId: user._id,
          name,
          type,
          isPublic,
          parentId: parentId || 0,
          localPath: fileName,
        },
      ).then((result) => {
        response.status(201).json(
          {
            id: result.insertedId,
            userId: user._id,
            name,
            type,
            isPublic,
            parentId: parentId || 0,
          },
        );
        if (type === 'image') {
          fileQueue.add(
            {
              userId: user._id,
              fileId: result.insertedId,
            },
          );
        }
      }).catch((error) => console.log(error));
    }
    return null;
  }
}

module.exports = FilesController;
