#!/usr/bin/env node
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

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

module.exports = router;
