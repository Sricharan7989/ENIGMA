// PLACE AT: lib/socket.ts
// Server-side utility to emit Socket.IO events from server actions / API routes

import { Server as SocketIOServer } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var io: SocketIOServer | undefined;
}

export function getIO(): SocketIOServer | null {
  return global.io ?? null;
}

// Emit to a specific user
export function emitToUser(userId: string, event: string, data: unknown) {
  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

// Emit to all admins
export function emitToAdmins(event: string, data: unknown) {
  const io = getIO();
  if (io) {
    io.to("admin").emit(event, data);
  }
}

// Emit to everyone watching a task
export function emitToTask(taskId: string, event: string, data: unknown) {
  const io = getIO();
  if (io) {
    io.to(`task:${taskId}`).emit(event, data);
  }
}

// Emit to everyone (broadcast)
export function emitToAll(event: string, data: unknown) {
  const io = getIO();
  if (io) {
    io.emit(event, data);
  }
}