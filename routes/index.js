#!/usr/bin/env node
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const express = require('express');

const router = express.Router();

// GET
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// POST
router.post('/users', UsersController.postNew);

module.exports = router;
