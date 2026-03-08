// PLACE AT: lib/hooks/useSocket.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export function useSocket(userId?: string, isAdmin?: boolean) {
    const [connected, setConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!userId) return;

        // Reuse existing connection
        if (!socketInstance || !socketInstance.connected) {
            socketInstance = io({
                path: "/api/socketio",
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });
        }

        socketRef.current = socketInstance;

        socketInstance.on("connect", () => {
            setConnected(true);
            // Join personal room
            socketInstance?.emit("join:user", userId);
            // Join admin room if admin
            if (isAdmin) socketInstance?.emit("join:admin");
        });

        socketInstance.on("disconnect", () => setConnected(false));

        if (socketInstance.connected) {
            setConnected(true);
            socketInstance.emit("join:user", userId);
            if (isAdmin) socketInstance.emit("join:admin");
        }

        return () => {
            // Don't disconnect on unmount - keep alive for the session
        };
    }, [userId, isAdmin]);

    return { socket: socketRef.current, connected };
}

export function useTaskSocket(taskId: string) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!taskId) return;

        if (!socketInstance || !socketInstance.connected) {
            socketInstance = io({
                path: "/api/socketio",
                reconnection: true,
            });
        }

        socketRef.current = socketInstance;
        socketInstance.emit("join:task", taskId);

        return () => {
            socketInstance?.emit("leave:task", taskId);
        };
    }, [taskId]);

    return socketRef.current;
}