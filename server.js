#!/usr/bin/env node
/**
 * @module server
 */
import routes from './routes/index';

const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

app.use('/', routes);

const start = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

module.exports = app;
