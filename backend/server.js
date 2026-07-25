import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import http from 'http';
import connectDB from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';
import taskRouter from './routes/taskRoutes.js';
import teamRouter from './routes/teamRoutes.js';
import reportRouter from './routes/reportRoutes.js';

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

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/teams", teamRouter);
app.use("/api/reports", reportRouter);

app.use("/", (req, res) => res.send("Server is live"));

const startServer = async () => {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server on PORT: http://localhost:${PORT}`));
};
startServer();