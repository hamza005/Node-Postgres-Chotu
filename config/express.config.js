const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();

module.exports = app => {
  app.use(cors(), bodyParser.json());
 
};