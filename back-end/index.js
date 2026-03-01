// index.js - FIXED
import express from 'express';
import cors from 'cors';
import auth from './Routes/auth.js';  // your routes/auth.js
import cookieParser from 'cookie-parser';
import reviews from './Routes/reviews.js';
import profile from './Routes/profile.js';


const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'], // ← add PATCH
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));


app.get('/', (req, res) => res.send('Hello world'));

// FIXED: mount with /api/auth prefix
app.use('/api/auth', auth);
app.use('/api/reviews', reviews);
app.use('/api/profile', profile);

app.listen(4000, () => console.log('Server is running on port 4000'));
