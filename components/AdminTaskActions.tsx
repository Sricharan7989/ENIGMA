"use client";

import { useState } from "react";
import { deleteTask, closeTask, reopenTask } from "@/app/actions/tasks";
import { useRouter } from "next/navigation";

export default function AdminTaskActions({ taskId, status }: { taskId: string, status: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this task? This cannot be undone.")) return;
        setLoading(true);
        const res = await deleteTask(taskId);
        if (res.success) {
            router.push("/admin"); // Redirect to admin dashboard
        } else {
            alert("Failed to delete task");
            setLoading(false);
        }
    }

    async function handleClose() {
        if (!confirm("Close this task?")) return;
        setLoading(true);
        const res = await closeTask(taskId);
        setLoading(false);
        if (!res.success) alert("Failed to close task");
    }

    async function handleReopen() {
        if (!confirm("Reopen this task?")) return;
        setLoading(true);
        const res = await reopenTask(taskId);
        setLoading(false);
        if (!res.success) alert("Failed to reopen task");
    }

    return (
        <div className="bg-zinc-900 border border-red-900/50 p-6 mt-6">
            <h3 className="text-sm text-red-500 uppercase tracking-widest mb-4">Admin Controls</h3>
            <div className="flex flex-col gap-2">
                {status !== "CLOSED" && (
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="w-full border border-yellow-600 text-yellow-500 py-2 hover:bg-yellow-900/20 text-xs font-bold uppercase transition-colors"
                    >
                        Close Task
                    </button>
                )}

                {(status === "CLOSED" || status === "COMPLETED") && (
                    <button
                        onClick={handleReopen}
                        disabled={loading}
                        className="w-full border border-green-600 text-green-500 py-2 hover:bg-green-900/20 text-xs font-bold uppercase transition-colors"
                    >
                        Reopen Task
                    </button>
                )}

                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="w-full bg-red-900/20 text-red-500 border border-red-900 py-2 hover:bg-red-900/40 text-xs font-bold uppercase transition-colors"
                >
                    Delete Task
                </button>
            </div>
        </div>
    );
}
