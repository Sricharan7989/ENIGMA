
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTasks } from "@/app/actions/tasks";
import TaskCard from "@/components/TaskCard";
import AnimatedLogo from "@/components/AnimatedLogo";

export default async function MemberDashboard() {
    const session = await auth();
    if (!session) redirect("/");

    const tasks = await getTasks('ASSIGNED'); // Fetch assigned/team tasks

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                    <AnimatedLogo />
                    <h1 className="text-3xl font-bold tracking-tighter">MY <span className="text-gray-500">TASKS</span></h1>
                </div>
                <div className="text-right">
                    <p className="font-bold">{session.user.name}</p>
                    <p className="text-xs text-gray-500">MEMBER</p>
                </div>
            </header>

            <main>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <p className="text-gray-500 text-xl font-mono">NO MISSIONS ASSIGNED</p>
                            <p className="text-gray-700 text-sm mt-2">Wait for the admin to assign you tasks.</p>
                        </div>
                    ) : (
                        tasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
