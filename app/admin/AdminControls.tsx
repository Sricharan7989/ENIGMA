"use client";
import { useState } from "react";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskCard from "@/components/TaskCard";
import { promoteToAdmin, demoteFromAdmin } from "@/app/actions/users";

const SUPERADMIN_EMAIL = "test1@iiits.in";

type Task = any;
type User = { id: string; name: string; email: string; role: string; teamId: string | null };
type Team = any;

export default function AdminControls({ users, teams, initialTasks, currentUserEmail }: {
    users: User[]; teams: Team[]; initialTasks: any[]; currentUserEmail: string;
}) {
    const [tab, setTab] = useState<"tasks"|"members"|"teams">("tasks");
    const [filter, setFilter] = useState("ALL");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionMsg, setActionMsg] = useState("");
    const [loadingId, setLoadingId] = useState<string|null>(null);

    const filteredTasks = initialTasks.filter(t => {
        if (filter === "ALL") return true;
        if (filter === "PENDING") return !["COMPLETED","CLOSED"].includes(t.status);
        if (filter === "COMPLETED") return t.status === "COMPLETED";
        if (filter === "CLOSED") return t.status === "CLOSED";
        return true;
    });

    const handlePromote = async (userId: string) => {
        if (!confirm("Promote this user to Admin? They will be removed from their team.")) return;
        setLoadingId(userId);
        const res = await promoteToAdmin(userId);
        setActionMsg(res.error || "User promoted to Admin and removed from team.");
        setLoadingId(null);
    };

    const handleDemote = async (userId: string) => {
        if (!confirm("Demote this admin to Member?")) return;
        setLoadingId(userId);
        const res = await demoteFromAdmin(userId);
        setActionMsg(res.error || "Admin demoted to Member.");
        setLoadingId(null);
    };

    return (
        <div>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
                {(["tasks","members","teams"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold border ${tab === t ? "bg-white text-black border-white" : "border-white/20 text-gray-400 hover:border-white/40"}`}>
                        {t}
                    </button>
                ))}
            </div>

            {actionMsg && (
                <div className="mb-4 font-mono text-xs px-4 py-2 border border-white/20 text-green-400 bg-green-900/10">
                    {actionMsg} <button onClick={() => setActionMsg("")} className="ml-2 text-gray-500">x</button>
                </div>
            )}

            {/* Tasks Tab */}
            {tab === "tasks" && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-2">
                            {["ALL","PENDING","COMPLETED","CLOSED"].map(f => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className={`px-3 py-1 text-xs font-bold border font-mono ${filter === f ? "bg-white text-black" : "border-white/20 text-gray-400"}`}>
                                    {f}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-gray-200">
                            + NEW TASK
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTasks.length === 0 ? (
                            <p className="text-gray-500 col-span-full text-center py-12 font-mono text-sm">No tasks found.</p>
                        ) : filteredTasks.map(task => <TaskCard key={task.id} task={task} isAdmin={true} />)}
                    </div>
                </div>
            )}

            {/* Members Tab */}
            {tab === "members" && (
                <div className="space-y-2">
                    {users.map(u => {
                        const isSuperAdmin = u.email === SUPERADMIN_EMAIL;
                        const isCurrentUser = u.email === currentUserEmail;
                        return (
                            <div key={u.id} className="flex items-center justify-between p-4 border border-white/10 bg-zinc-900/30">
                                <div>
                                    <p className="font-mono text-sm font-bold text-white">{u.name}</p>
                                    <p className="font-mono text-xs text-gray-500">{u.email}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`font-mono text-xs px-2 py-0.5 border ${u.role === "ADMIN" ? "border-yellow-700 text-yellow-400" : "border-gray-700 text-gray-400"}`}>
                                            {u.role}{isSuperAdmin ? " [SUPERADMIN]" : ""}
                                        </span>
                                        {u.teamId && <span className="font-mono text-xs text-blue-400 border border-blue-900 px-2 py-0.5">IN TEAM</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {u.role !== "ADMIN" && !isCurrentUser && (
                                        <button onClick={() => handlePromote(u.id)} disabled={loadingId === u.id}
                                            className="font-mono text-xs px-3 py-1 border border-yellow-700 text-yellow-500 hover:bg-yellow-900/20 disabled:opacity-50">
                                            MAKE ADMIN
                                        </button>
                                    )}
                                    {u.role === "ADMIN" && !isSuperAdmin && !isCurrentUser && (
                                        <button onClick={() => handleDemote(u.id)} disabled={loadingId === u.id}
                                            className="font-mono text-xs px-3 py-1 border border-red-900 text-red-500 hover:bg-red-900/20 disabled:opacity-50">
                                            DEMOTE
                                        </button>
                                    )}
                                    {isSuperAdmin && (
                                        <span className="font-mono text-xs text-gray-600 px-3 py-1">PROTECTED</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Teams Tab */}
            {tab === "teams" && (
                <div className="space-y-2">
                    {teams.length === 0 ? (
                        <p className="font-mono text-sm text-gray-500 text-center py-12">No teams yet.</p>
                    ) : teams.map((team: any) => (
                        <div key={team.id} className="flex items-center justify-between p-4 border border-white/10 bg-zinc-900/30">
                            <div>
                                <p className="font-mono text-sm font-bold text-white">{team.name}</p>
                                <p className="font-mono text-xs text-gray-500">Code: {team.teamCode}</p>
                            </div>
                            <span className="font-mono text-xs text-gray-400 border border-white/10 px-3 py-1">
                                {team._count.users} members
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <CreateTaskModal users={users} teams={teams} onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
}
