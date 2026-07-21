import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import http from 'http';
import connectDB from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
    cors: { origin: "*" }
});

export const userSocketMap = {};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("user connected", userId);
    
    if(userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("user disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

app.use(express.json({ limit: "4mb" }));
app.use(cors());

// ✅ Move this AFTER all route definitions
// app.use("/", (req, res) => res.send("Server is live"));

// ✅ Define specific routes BEFORE catch-all
app.use("/auth", userRouter);
app.use("/messages", messageRouter);

// ✅ Root route should be last
app.use("/", (req, res) => res.send("Server is live"));

const startServer = async () => {
    await connectDB();
    const PORT = process.env.PORT || 8000;
    server.listen(PORT, () => console.log(`Server on PORT: ${PORT}`));
};
startServer();