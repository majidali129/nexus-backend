import { config } from "@/config/env";
import { httpServer } from "@/server";
import { socketAuth, SocketData } from "@/sockets/middlewares/socket-auth";
import { DefaultEventsMap, Server } from "socket.io";

const io: Server<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    SocketData
> = new Server(httpServer, {
    cors: {
        origin: config.ALLOWED_ORIGINS,
        credentials: true
    },
    allowEIO3: true // allow cookies
});


io.use(socketAuth);

io.on('connection', (socket) => {
    console.log(`[Socket.io] User connected: ${socket.data.username} (ID: ${socket.id})`)

    socket.join(`user:${socket.data.userId}`); // Join a room specific to the user for targeted broadcasts

    socket.on('disconnect', () => {
        console.log(`[Socket.io] User disconnected: ${socket.data.username} (ID: ${socket.id})`)
    })
})

export { io }