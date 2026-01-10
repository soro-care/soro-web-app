// server/index.js

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import './jobs/bookingJobs.js';
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from './config/connectDB.js'
import userRouter from './routes/user.route.js'
import uploadRouter from './routes/upload.router.js'
import surveyRouter from './routes/survey.route.js'
import availabilityRouter from './routes/availability.route.js';
import bookingRouter from './routes/booking.route.js';
import notificationRouter from './routes/notification.route.js';
import blogRouter from './routes/blog.route.js';
import chatRouter from './routes/chat.route.js';
import adminRouter from './routes/admin.route.js'
import echoRouter from './routes/echo.route.js'

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: [
    'https://mindly-co.vercel.app',
    'https://soro.care',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-anon-user-id']
}));

app.use(express.json());
app.use(cookieParser());

const customMorganFormat = ':remote-addr - :method :url :status :res[content-length] - :response-time ms';
app.use(morgan(customMorganFormat));

app.use(helmet({
  crossOriginResourcePolicy: false
}));

const PORT = process.env.PORT || 5001;

app.get("/", (request, response) => {
  response.json({
    message: "Server is running on " + PORT
  });
});

app.use('/api/user', userRouter);
app.use("/api/file", uploadRouter);
app.use("/api/survey", surveyRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/blog', blogRouter);
app.use('/api/notification', notificationRouter);
app.use('/api/chat', chatRouter);
app.use('/api/admin', adminRouter);
app.use('/api/echo', echoRouter);

// Serve static files from React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'dist')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
  });
}

connectDB()
  .then(() => {
    console.log("🔗 MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
  })
  .catch(err => {
    console.error("❌ Failed to connect to MongoDB:", err);
    setTimeout(() => process.exit(1), 5000);
  });