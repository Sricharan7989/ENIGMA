// PLACE AT: app/components/AdminTaskActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { closeTask, reopenTask, deleteTask } from "@/app/actions/tasks";

export default function AdminTaskActions({ taskId, status }: { taskId: string; status: string }) {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const router = useRouter();

    async function handle(action: "close" | "reopen" | "delete") {
        const confirmMsg =
            action === "delete"
                ? "DELETE this task permanently? This cannot be undone."
                : action === "close"
                ? "Close this task?"
                : "Reopen this task?";

        if (!confirm(confirmMsg)) return;

        setLoading(true);
        setMsg("");

        let res;
        if (action === "close") res = await closeTask(taskId);
        else if (action === "reopen") res = await reopenTask(taskId);
        else res = await deleteTask(taskId);

        setLoading(false);

        if (res.error) {
            setMsg(res.error);
        } else {
            if (action === "delete") router.push("/admin");
            else router.refresh();
        }
    }

    return (
        <div className="border border-white/20 p-6 mb-6">
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest mb-4 text-white">
                Admin Controls
            </h3>

            {msg && (
                <p className="mb-4 text-xs font-mono text-red-400 border border-red-900 bg-red-900/10 p-2">
                    [ERROR] {msg}
                </p>
            )}

            <div className="flex flex-wrap gap-3">
                {status !== "CLOSED" && (
                    <button
                        onClick={() => handle("close")}
                        disabled={loading}
                        className="px-4 py-2 border border-yellow-600 text-yellow-500 font-mono font-bold text-xs uppercase tracking-widest hover:bg-yellow-900/20 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "..." : "Close Task"}
                    </button>
                )}

                {status === "CLOSED" && (
                    <button
                        onClick={() => handle("reopen")}
                        disabled={loading}
                        className="px-4 py-2 border border-blue-600 text-blue-400 font-mono font-bold text-xs uppercase tracking-widest hover:bg-blue-900/20 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "..." : "Reopen Task"}
                    </button>
                )}

                <button
                    onClick={() => handle("delete")}
                    disabled={loading}
                    className="px-4 py-2 border border-red-600 text-red-500 font-mono font-bold text-xs uppercase tracking-widest hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                >
                    {loading ? "..." : "Delete Task"}
                </button>
            </div>
        </div>
    );
}
