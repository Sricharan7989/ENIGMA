"use client";

import { useState } from "react";
import { createTask } from "@/app/actions/tasks";

type User = { id: string; name: string; email: string };
type Team = { id: string; name: string };

export default function CreateTaskModal({ users, teams, onClose }: { users: User[], teams: Team[], onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError("");

        // Server action
        const result = await createTask(null, formData);

        setLoading(false);
        if (result.error) {
            setError(result.error);
        } else {
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-white/20 p-6 max-w-lg w-full shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <h2 className="text-2xl font-bold mb-4 font-mono">Create New Task</h2>

                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Title</label>
                        <input name="title" required className="w-full bg-black border border-gray-700 p-2 focus:border-white outline-none" placeholder="Task title" />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Description</label>
                        <textarea name="description" required rows={3} className="w-full bg-black border border-gray-700 p-2 focus:border-white outline-none" placeholder="Detailed description..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Priority</label>
                            <select name="priority" className="w-full bg-black border border-gray-700 p-2 focus:border-white outline-none">
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Due Date</label>
                            <input type="date" name="dueDate" className="w-full bg-black border border-gray-700 p-2 focus:border-white outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Assign to Member</label>
                            <select name="assignedToId" className="w-full bg-black border border-gray-700 p-2 focus:border-white outline-none">
                                <option value="">-- Select Member --</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Assign to Team</label>
                            <select name="teamIdString" className="w-full bg-black border border-gray-700 p-2 focus:border-white outline-none">
                                <option value="">-- Select Team --</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-white text-black font-bold hover:bg-gray-200">
                            {loading ? "Creating..." : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
