#!/usr/bin/env node
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FileController';

const express = require('express');

const router = express.Router();

// GET
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// POST
router.post('/users', UsersController.postNew);
router.post('/files', FilesController.postUpload);

module.exports = router;
