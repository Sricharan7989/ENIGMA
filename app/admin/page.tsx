// PLACE AT: app/admin/page.tsx (REPLACE existing)
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminControls from "./AdminControls";
import Navigation from "@/components/Navigation";

export default async function AdminPage() {
    const session = await auth();
    if (!session) redirect("/dashboard");
    // Always verify role from DB, not session token
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    if (!dbUser || dbUser.role !== "ADMIN") redirect("/dashboard");

    const [tasks, users, teams] = await Promise.all([
        prisma.task.findMany({
            include: {
                assignedTo: { select: { id: true, name: true, email: true } },
                assignedBy: { select: { name: true } },
                team: { select: { id: true, name: true } },
                _count: { select: { comments: true } },
            },
            orderBy: { created_at: "desc" },
        }),
        prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, teamId: true },
            orderBy: { name: "asc" },
        }),
        prisma.team.findMany({
            select: {
                id: true, name: true, teamCode: true,
                _count: { select: { users: true } },
            },
            orderBy: { name: "asc" },
        }),
    ]);

    const stats = {
        totalTasks: tasks.length,
        pending: tasks.filter(t => !["COMPLETED", "CLOSED"].includes(t.status)).length,
        completed: tasks.filter(t => t.status === "COMPLETED").length,
        totalMembers: users.length,
        totalTeams: teams.length,
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8 border-b border-white/20 pb-6">
                    <h1 className="text-3xl font-mono font-bold uppercase tracking-widest text-white">
                        [ COMMAND CENTER ]
                    </h1>
                    <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-widest">
                        Admin Control Panel â€” {session.user.name || session.user.email}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: "Total Tasks", value: stats.totalTasks },
                        { label: "Pending", value: stats.pending },
                        { label: "Completed", value: stats.completed },
                        { label: "Users", value: stats.totalMembers },
                        { label: "Teams", value: stats.totalTeams },
                    ].map(s => (
                        <div key={s.label} className="border border-white/20 bg-black p-4 text-center">
                            <div className="text-2xl font-mono font-bold text-white">{s.value}</div>
                            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>

                <AdminControls
                    users={users}
                    teams={teams}
                    initialTasks={JSON.parse(JSON.stringify(tasks))}
                    currentUserEmail={session.user.email}
                />
            </div>
        </div>
    );
}
