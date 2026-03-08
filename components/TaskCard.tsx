// PLACE AT: app/components/TaskCard.tsx
"use client";

import Link from "next/link";

interface Task {
    id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    dueDate?: string | null;
    assignedTo?: { id: string; name: string | null; email: string } | null;
    assignedBy?: { name: string | null } | null;
    team?: { id?: string; name: string } | null;
    _count?: { comments: number };
}

const STATUS_STYLES: Record<string, string> = {
    DRAFT: "border-gray-600 text-gray-400",
    ASSIGNED: "border-yellow-600 text-yellow-400",
    ACCEPTED: "border-blue-600 text-blue-400",
    IN_PROGRESS: "border-blue-500 text-blue-300",
    COMPLETED: "border-green-600 text-green-400",
    CLOSED: "border-gray-700 text-gray-500",
};

const PRIORITY_DOT: Record<string, string> = {
    LOW: "bg-gray-500",
    MEDIUM: "bg-white",
    HIGH: "bg-yellow-400",
    CRITICAL: "bg-red-500",
};

export default function TaskCard({ task, isAdmin }: { task: Task; isAdmin: boolean }) {
    const statusStyle = STATUS_STYLES[task.status] || "border-white/20 text-white";
    const priorityDot = PRIORITY_DOT[task.priority] || "bg-white";
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !["COMPLETED", "CLOSED"].includes(task.status);

    return (
        <Link href={`/tasks/${task.id}`}>
            <div className={`border border-white/20 bg-black p-4 hover:border-white/60 transition-all cursor-pointer group h-full flex flex-col ${isOverdue ? "border-l-2 border-l-red-500" : ""}`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot}`} />
                        <h3 className="font-mono font-bold text-sm text-white uppercase truncate group-hover:text-gray-200">
                            {task.title}
                        </h3>
                    </div>
                    <span className={`flex-shrink-0 px-2 py-0.5 border text-[10px] font-mono font-bold uppercase ${statusStyle}`}>
                        {task.status.replace("_", " ")}
                    </span>
                </div>

                {/* Description */}
                <p className="font-mono text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2 flex-grow">
                    {task.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-600 border-t border-white/10 pt-3 mt-auto">
                    <div className="flex flex-col gap-0.5">
                        {task.assignedTo && (
                            <span className="text-gray-500">â†’ {task.assignedTo.name || task.assignedTo.email}</span>
                        )}
                        {task.team && !task.assignedTo && (
                            <span className="text-gray-500">â†’ {task.team.name}</span>
                        )}
                        {isAdmin && task.assignedBy && (
                            <span className="text-gray-600">by {task.assignedBy.name}</span>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                        {task.dueDate && (
                            <span className={isOverdue ? "text-red-500" : "text-gray-600"}>
                                {isOverdue ? "âš  OVERDUE" : `Due ${new Date(task.dueDate).toLocaleDateString("en-GB")}`}
                            </span>
                        )}
                        {(task._count?.comments ?? 0) > 0 && (
                            <span className="text-gray-600">// {task._count!.comments} msgs</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

