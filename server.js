const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/api/socketio",
  });

  global.io = io;

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);
    socket.on("join:user", (userId) => { if (userId) socket.join(`user:${userId}`); });
    socket.on("join:admin", () => { socket.join("admin"); });
    socket.on("join:task", (taskId) => { if (taskId) socket.join(`task:${taskId}`); });
    socket.on("leave:task", (taskId) => { if (taskId) socket.leave(`task:${taskId}`); });
    socket.on("disconnect", () => { console.log(`[Socket.IO] Client disconnected: ${socket.id}`); });
  });

  httpServer.listen(PORT, () => {
    console.log(`> ENIGMA server running at http://localhost:${PORT}`);
  });
});
