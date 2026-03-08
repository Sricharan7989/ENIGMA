// PLACE AT: components/NotificationBell.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/lib/hooks/useSocket";
import Link from "next/link";

interface Notification {
    id: string;
    message: string;
    taskId?: string;
    type: "task:assigned" | "task:statusChanged" | "task:completed" | "task:submitted" | "comment:new";
    read: boolean;
    timestamp: Date;
}

export default function NotificationBell({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const { socket, connected } = useSocket(userId, isAdmin);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unread = notifications.filter(n => !n.read).length;

    function addNotification(type: Notification["type"], data: { message?: string; taskId?: string; title?: string }) {
        const n: Notification = {
            id: `${Date.now()}-${Math.random()}`,
            message: data.message || "New update",
            taskId: data.taskId,
            type,
            read: false,
            timestamp: new Date(),
        };
        setNotifications(prev => [n, ...prev].slice(0, 20)); // keep max 20
    }

    useEffect(() => {
        if (!socket) return;

        socket.on("task:assigned", (data) => addNotification("task:assigned", data));
        socket.on("task:statusChanged", (data) => addNotification("task:statusChanged", data));
        socket.on("task:completed", (data) => addNotification("task:completed", data));
        socket.on("task:submitted", (data) => addNotification("task:submitted", data));
        socket.on("task:created", (data) => addNotification("task:assigned", { ...data, message: `New task created: ${data.title}` }));
        socket.on("comment:new", (data) => addNotification("comment:new", { ...data, message: `New comment on a task` }));

        return () => {
            socket.off("task:assigned");
            socket.off("task:statusChanged");
            socket.off("task:completed");
            socket.off("task:submitted");
            socket.off("task:created");
            socket.off("comment:new");
        };
    }, [socket]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    function markAllRead() {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }

    const TYPE_ICONS: Record<Notification["type"], string> = {
        "task:assigned": "📋",
        "task:statusChanged": "🔄",
        "task:completed": "✅",
        "task:submitted": "📤",
        "comment:new": "💬",
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
                title={connected ? "Connected" : "Connecting..."}
            >
                {/* Bell icon */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {/* Unread badge */}
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-white text-black text-[9px] font-mono font-bold rounded-full flex items-center justify-center px-1">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}

                {/* Connection indicator */}
                <span className={`absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-black border border-white/20 shadow-2xl z-50 max-h-96 flex flex-col">
                    <div className="flex items-center justify-between p-3 border-b border-white/20">
                        <span className="font-mono text-xs font-bold text-white uppercase tracking-widest">
                            Transmissions
                        </span>
                        {notifications.length > 0 && (
                            <button
                                onClick={() => setNotifications([])}
                                className="text-[10px] font-mono text-gray-500 hover:text-white uppercase tracking-widest"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-center font-mono text-xs text-gray-600 uppercase tracking-widest">
                                No transmissions
                            </p>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`p-3 border-b border-white/10 hover:bg-white/5 transition-colors ${!n.read ? "bg-white/[0.03]" : ""}`}
                                >
                                    {n.taskId ? (
                                        <Link href={`/tasks/${n.taskId}`} onClick={() => setOpen(false)}>
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm mt-0.5">{TYPE_ICONS[n.type]}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-mono text-xs text-white leading-snug">{n.message}</p>
                                                    <p className="font-mono text-[10px] text-gray-600 mt-1">
                                                        {new Date(n.timestamp).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="flex items-start gap-2">
                                            <span className="text-sm mt-0.5">{TYPE_ICONS[n.type]}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-mono text-xs text-white leading-snug">{n.message}</p>
                                                <p className="font-mono text-[10px] text-gray-600 mt-1">
                                                    {new Date(n.timestamp).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}