// PLACE AT: app/components/TaskActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptTask } from "@/app/actions/submissions";

export default function TaskActions({ taskId, status }: { taskId: string; status: string }) {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const router = useRouter();

    async function handleAccept() {
        setLoading(true);
        setMsg("");
        const res = await acceptTask(taskId);
        setLoading(false);
        if (res.error) {
            setMsg(res.error);
        } else {
            router.refresh();
        }
    }

    return (
        <div className="border border-white/20 p-6 mb-6">
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest mb-4 text-white">
                Mission Actions
            </h3>

            {msg && (
                <p className="mb-4 text-xs font-mono text-red-400 border border-red-900 bg-red-900/10 p-2">
                    [ERROR] {msg}
                </p>
            )}

            <div className="flex flex-wrap gap-3">
                {status === "ASSIGNED" && (
                    <button
                        onClick={handleAccept}
                        disabled={loading}
                        className="px-6 py-2 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Processing..." : "Accept Mission"}
                    </button>
                )}

                {status === "ACCEPTED" && (
                    <div className="text-xs font-mono text-blue-400 border border-blue-900 bg-blue-900/10 px-4 py-2 uppercase tracking-widest">
                        ✓ Mission Accepted — Submit your work below
                    </div>
                )}

                {status === "IN_PROGRESS" && (
                    <div className="text-xs font-mono text-blue-400 border border-blue-900 bg-blue-900/10 px-4 py-2 uppercase tracking-widest">
                        ⟳ Mission In Progress — Submit your work below
                    </div>
                )}
            </div>
        </div>
    );
}