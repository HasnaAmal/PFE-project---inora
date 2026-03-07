import express          from 'express';
import cors             from 'cors';
import cookieParser     from 'cookie-parser';
import { createServer } from 'http';
import { Server }       from 'socket.io';
import cron             from 'node-cron';
import { prisma }       from './lib/prisma.js';
import auth    from './Routes/auth.js';
import reviews from './Routes/reviews.js';
import profile from './Routes/profile.js';
/*import chat    from './Routes/chat.js';*/ // ✅ uncommented

const app        = express();
const httpServer = createServer(app);
const io         = new Server(httpServer, {
  cors: { origin: 'http://localhost:3000', credentials: true }
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join',       (userId) => socket.join(`user_${userId}`));
  socket.on('join_admin', ()       => socket.join('admins'));

  socket.on('typing', ({ convoId, userId }) => {
    socket.to('admins').to(`user_${userId}`).emit('typing', { convoId });
  });
  socket.on('stop_typing', ({ convoId, userId }) => {
    socket.to('admins').to(`user_${userId}`).emit('stop_typing', { convoId });
  });
});

// auto-close conversations inactive for 48h
cron.schedule('0 * * * *', async () => {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  await prisma.conversation.updateMany({
    where: { status: 'OPEN', updatedAt: { lt: cutoff } },
    data:  { status: 'CLOSED' }
  });
});

app.use(cors({
  origin:         'http://localhost:3000',
  credentials:    true,
  methods:        ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => res.send('Hello world'));

app.use('/api/auth',    auth);
app.use('/api/reviews', reviews);
app.use('/api/profile', profile);
/*app.use('/api/chat',    chat);*/ // ✅ uncommented

httpServer.listen(4000, () => console.log('Server is running on port 4000'));
