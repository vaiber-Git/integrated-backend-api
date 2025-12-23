import express from 'express';
import bcrypt from 'bcrypt-nodejs';
import cors from 'cors';
import knex from 'knex';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import jwt from 'jsonwebtoken';

import handleApiCall from './utils/clarifai.js';
import registerHandler from './handlers/register.handler.js';
import signInHandler from './handlers/signin.handler.js';
import profileHandler from './handlers/profile.handler.js';
import imageHandler from './handlers/image.handler.js';
import inputQuestionHandler from './handlers/inputQuestionHandler.js';

const timestamp = new Date().toISOString();
//ReferenceError: __dirname is not defined in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//creating a connection to database
const db = knex({
  client: 'pg',
  connection: {
    host : process.env.DB_URL,
    user : process.env.USER,
    password : process.env.PASSWORD,
    database : process.env.DATABASE,
    port : process.env.PORT,
    ssl: { 
      rejectUnauthorized: true,
      ca: Buffer.from(process.env.CA, "base64").toString("ascii"),
    },
  }
});


//creating the express app
const app = express();

const SECRET_KEY = process.env.JWT_KEY; // Secret for signing JWTs

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err) => {
    if (err) return res.sendStatus(403); // invalid token
    next();
  });
}
//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


// Define the log file path
const logFilePath = path.join(__dirname, 'app.log');

// Create a write stream to the log file
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' }); // 'a' for append mode

// Redirect console.log to the log stream
console.log = function (message) {
  logStream.write(message + '\n'); // Write the message to the file with a newline
  process.stdout.write(message + '\n'); // Also output to the console for real-time viewing
};

//custom logger middleware
app.use((req, res, next) => {
  console.log(`${timestamp} - ${req.method} ${req.originalUrl}`);
  next();
});

//API endpoints

app.get("/health", (req, res) => {
  res.status(200).json({status:'OK', uptime: process.uptime()});
});

app.post('/signin', (req, res) => signInHandler(req, res, bcrypt, db));

app.post('/register', (req, res) => registerHandler(req, res, bcrypt, db));

app.get('/profile/:id', (req, res) => profileHandler(req, res, db));

app.put("/image", authenticateToken, (req, res) => imageHandler(req, res, db));

app.post('/imageurl', (req, res) => { handleApiCall(req, res);});

app.post('/chat', (req, res) => { inputQuestionHandler(req, res);});

app.listen(3009, () => { console.log("app is running on port 3009");});