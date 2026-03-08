// PLACE AT: app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import TaskCard from "@/components/TaskCard";
import Link from "next/link";

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect("/auth/login");

    // Admins go to their own panel
    if (session.user.role === "ADMIN") redirect("/admin");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            team: { select: { id: true, name: true, teamCode: true } },
        },
    });

    // Fetch tasks assigned to this user directly OR to their team
    const tasks = await prisma.task.findMany({
        where: {
            OR: [
                { assignedToId: session.user.id },
                ...(user?.teamId ? [{ teamIdString: user.teamId }] : []),
            ],
        },
        include: {
            assignedBy: { select: { name: true } },
            team: { select: { name: true } },
            _count: { select: { comments: true } },
        },
        orderBy: { created_at: "desc" },
    });

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => ["ASSIGNED", "ACCEPTED"].includes(t.status)).length,
        inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
        completed: tasks.filter(t => t.status === "COMPLETED").length,
    };

    const activeTasks = tasks.filter(t => !["COMPLETED", "CLOSED"].includes(t.status));
    const completedTasks = tasks.filter(t => ["COMPLETED", "CLOSED"].includes(t.status));

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />
            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="mb-8 border-b border-white/20 pb-6">
                    <h1 className="text-3xl font-mono font-bold uppercase tracking-widest text-white">
                        [ OPERATIVE TERMINAL ]
                    </h1>
                    <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-widest">
                        Welcome back, {session.user.name || session.user.email}
                    </p>
                </div>

                {/* Team Status */}
                {user?.team ? (
                    <div className="mb-6 p-4 border border-white/20 bg-white/5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Unit</span>
                            <p className="font-mono font-bold text-white uppercase">{user.team.name}</p>
                        </div>
                        <Link
                            href="/teams"
                            className="px-4 py-2 border border-white/30 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                        >
                            View Team →
                        </Link>
                    </div>
                ) : (
                    <div className="mb-6 p-4 border border-yellow-500/30 bg-yellow-900/10 flex items-center justify-between">
                        <p className="font-mono text-xs text-yellow-500 uppercase tracking-widest">
                            You are not part of any team yet.
                        </p>
                        <Link
                            href="/teams"
                            className="px-4 py-2 border border-yellow-500 text-yellow-500 text-xs font-mono uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-colors"
                        >
                            Join / Create Team →
                        </Link>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Assigned", value: stats.total, color: "text-white" },
                        { label: "Pending", value: stats.pending, color: "text-yellow-400" },
                        { label: "In Progress", value: stats.inProgress, color: "text-blue-400" },
                        { label: "Completed", value: stats.completed, color: "text-green-400" },
                    ].map(s => (
                        <div key={s.label} className="border border-white/20 bg-black p-4 text-center">
                            <div className={`text-2xl font-mono font-bold ${s.color}`}>{s.value}</div>
                            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Active Tasks */}
                <div className="mb-8">
                    <h2 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-4 border-b border-white/10 pb-2">
                        Active Missions ({activeTasks.length})
                    </h2>
                    {activeTasks.length === 0 ? (
                        <div className="text-center py-12 border border-white/10">
                            <p className="font-mono text-gray-500 text-sm uppercase tracking-widest">
                                No active missions. Stand by.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeTasks.map(task => (
                                <TaskCard key={task.id} task={task} isAdmin={false} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                    <div>
                        <h2 className="text-sm font-mono font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">
                            Completed Missions ({completedTasks.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                            {completedTasks.map(task => (
                                <TaskCard key={task.id} task={task} isAdmin={false} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
