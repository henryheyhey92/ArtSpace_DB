const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil = require('./MongoUtil');

//const COLLECTION_NAME=

//setup
const app = express();

//enable JSON data processing
app.use(express.json());

//enable CORS
app.use(cors());



