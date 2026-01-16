
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTasks } from "@/app/actions/tasks";
import { getUsers, getTeams } from "@/app/actions/users";
// import TaskCard from "@/components/TaskCard"; // Moved to AdminControls
import AnimatedLogo from "@/components/AnimatedLogo";
import AdminControls from "./AdminControls"; // Client component wrapper for interactions

export default async function AdminDashboard() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const tasks = await getTasks('ALL');
    const users = await getUsers();
    const teams = await getTeams();

    const pending = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CLOSED').length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                    <AnimatedLogo />
                    <h1 className="text-3xl font-bold tracking-tighter">ADMIN <span className="text-gray-500">CONTROL</span></h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="font-bold">{session.user.name}</p>
                        <p className="text-xs text-gray-500">ADMINISTRATOR</p>
                    </div>
                    {/* Logout button can be added here or in navigation */}
                </div>
            </header>

            <main>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-zinc-900/50 border border-white/10 p-6">
                        <h3 className="text-gray-500 text-sm uppercase tracking-wider">Total Tasks</h3>
                        <p className="text-4xl font-bold mt-2">{tasks.length}</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/10 p-6">
                        <h3 className="text-yellow-500/80 text-sm uppercase tracking-wider">Pending</h3>
                        <p className="text-4xl font-bold mt-2">{pending}</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/10 p-6">
                        <h3 className="text-green-500/80 text-sm uppercase tracking-wider">Completed</h3>
                        <p className="text-4xl font-bold mt-2">{completed}</p>
                    </div>
                </div>

                {/* Controls & Task List */}
                <AdminControls users={users} teams={teams} initialTasks={tasks} />
            </main>
        </div>
    );
}
