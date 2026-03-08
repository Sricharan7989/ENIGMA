"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function NotificationBell() {
    const { data: session } = useSession();
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!session) return;
        const fetchCount = async () => {
            try {
                const res = await fetch("/api/notifications/count");
                if (res.ok) { const d = await res.json(); setCount(d.count || 0); }
            } catch {}
        };
        fetchCount();
        const interval = setInterval(fetchCount, 5000);
        return () => clearInterval(interval);
    }, [session]);

    return (
        <div className="relative cursor-pointer">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                </span>
            )}
        </div>
    );
}
