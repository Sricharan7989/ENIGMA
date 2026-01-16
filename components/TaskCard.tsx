"use client";

import Link from "next/link";

type Task = {
    id: string;
    title: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    status: string;
    dueDate: Date | null;
    assignedTo?: { name: string } | null;
    team?: { name: string } | null;
};

export default function TaskCard({ task, isAdmin }: { task: Task; isAdmin?: boolean }) {
    const priorityColors = {
        LOW: "border-gray-500 text-gray-400",
        MEDIUM: "border-white text-white",
        HIGH: "border-yellow-400 text-yellow-400",
        CRITICAL: "border-red-500 text-red-500 animate-pulse",
    };

    return (
        <div className={`p-4 border bg-black hover:bg-zinc-900 transition-all group relative overflow-hidden ${priorityColors[task.priority] || "border-white"}`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{task.title}</h3>
                <span className={`text-xs px-2 py-1 border ${priorityColors[task.priority]}`}>
                    {task.priority}
                </span>
            </div>

            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{task.description}</p>

            <div className="flex justify-between items-end text-xs text-gray-500">
                <div>
                    {task.assignedTo ? (
                        <p>Assigned to: <span className="text-white">{task.assignedTo.name}</span></p>
                    ) : task.team ? (
                        <p>Team: <span className="text-white">{task.team.name}</span></p>
                    ) : (
                        <p>Unassigned</p>
                    )}
                    {task.dueDate && <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                </div>

                <Link
                    href={`/tasks/${task.id}`}
                    className="px-3 py-1 bg-white text-black font-bold hover:bg-gray-200 transition-colors"
                >
                    {isAdmin ? "Manage" : "View"}
                </Link>
            </div>
        </div>
    );
}
