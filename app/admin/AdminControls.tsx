"use client";

import { useState } from "react";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskCard from "@/components/TaskCard";



type Task = any;
type User = any;
type Team = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AdminControls({ users, teams, initialTasks }: { users: User[], teams: Team[], initialTasks: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState("ALL"); // ALL, PENDING, COMPLETED

    const filteredTasks = initialTasks.filter(t => {
        if (filter === "ALL") return true;
        if (filter === "PENDING") return t.status !== "COMPLETED" && t.status !== "CLOSED";
        if (filter === "COMPLETED") return t.status === "COMPLETED";
        return true;
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                    <button
                        onClick={() => setFilter("ALL")}
                        className={`px-4 py-2 text-sm font-bold border ${filter === "ALL" ? "bg-white text-black" : "border-white/20 text-gray-400"}`}
                    >
                        ALL TASKS
                    </button>
                    <button
                        onClick={() => setFilter("PENDING")}
                        className={`px-4 py-2 text-sm font-bold border ${filter === "PENDING" ? "bg-white text-black" : "border-white/20 text-gray-400"}`}
                    >
                        PENDING
                    </button>
                    <button
                        onClick={() => setFilter("COMPLETED")}
                        className={`px-4 py-2 text-sm font-bold border ${filter === "COMPLETED" ? "bg-white text-black" : "border-white/20 text-gray-400"}`}
                    >
                        COMPLETED
                    </button>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wider"
                >
                    + NEW TASK
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-12">No tasks found.</p>
                ) : (
                    filteredTasks.map(task => (
                        <TaskCard key={task.id} task={task} isAdmin={true} />
                    ))
                )}
            </div>

            {isModalOpen && (
                <CreateTaskModal
                    users={users}
                    teams={teams}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}
