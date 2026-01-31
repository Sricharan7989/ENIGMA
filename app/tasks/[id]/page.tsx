import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AnimatedLogo from "@/components/AnimatedLogo";
import SubmissionForm from "@/components/SubmissionForm";
import Link from "next/link";
import { acceptTask } from "@/app/actions/submissions";
import AdminTaskActions from "@/components/AdminTaskActions";
import CommentSection from "@/components/CommentSection";

// Server action wrapper for button
async function acceptAction(taskId: string) {
    "use server";
    await acceptTask(taskId);
}

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session) redirect("/");

    const task = await prisma.task.findUnique({
        where: { id },
        include: {
            assignedTo: true,
            team: { include: { users: true } },
            comments: { include: { author: true }, orderBy: { createdAt: 'desc' } },
            attachments: true,
            activityLogs: { include: { user: true }, orderBy: { timestamp: 'desc' } }
        }
    });

    if (!task) return <div className="p-8">Task not found</div>;

    const isAssigned = task.assignedToId === session.user.id || task.team?.users.some(u => u.id === session.user.id);
    const isAdmin = session.user.role === "ADMIN";

    if (!isAssigned && !isAdmin) {
        return <div className="p-8">Unauthorized</div>;
    }

    // Prepare comments for client component
    const initialComments = task.comments.map(c => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        author: {
            name: c.author.name,
            email: c.author.email,
            role: c.author.role
        }
    }));

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans max-w-5xl mx-auto">
            <header className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
                <Link href={isAdmin ? "/admin" : "/dashboard"} className="text-gray-400 hover:text-white">&larr; Back</Link>
                <AnimatedLogo />
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <div className="flex justify-between items-start">
                            <h1 className="text-4xl font-bold mb-4">{task.title}</h1>
                            <span className="px-3 py-1 border border-white text-xs">{task.status}</span>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap">{task.description}</p>
                    </div>

                    {/* Comments Section */}
                    <CommentSection
                        taskId={task.id}
                        initialComments={initialComments}
                        currentUserEmail={session.user.email}
                    />

                    {/* Attachments Display */}
                    {task.attachments.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">Investigative Files</h3>
                            <ul className="space-y-2">
                                {task.attachments.map(a => (
                                    <li key={a.id}>
                                        <a href={a.url} target="_blank" className="text-blue-400 hover:underline flex items-center gap-2">
                                            <span>📄</span> {a.filename}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Submission Form (Only for assigned members if not completed) */}
                    {isAssigned && task.status !== "COMPLETED" && task.status !== "CLOSED" && (
                        <SubmissionForm taskId={task.id} />
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-white/10 p-6">
                        <h3 className="text-sm text-gray-500 uppercase tracking-widest mb-4">Metadata</h3>
                        <div className="space-y-2 text-sm">
                            <p><strong>Priority:</strong> <span className={task.priority === 'CRITICAL' ? 'text-red-500' : 'text-white'}>{task.priority}</span></p>
                            <p><strong>Due Date:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "None"}</p>
                            <p><strong>Assigned To:</strong> {task.assignedTo?.name || task.team?.name || "Unassigned"}</p>
                        </div>

                        {isAssigned && task.status === "ASSIGNED" && (
                            <form action={acceptAction.bind(null, task.id)} className="mt-6">
                                <button className="w-full bg-white text-black font-bold py-2 hover:bg-gray-200">
                                    ACCEPT MISSION
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                        <AdminTaskActions taskId={task.id} status={task.status} />
                    )}

                    <div className="bg-zinc-900 border border-white/10 p-6 max-h-[400px] overflow-auto">
                        <h3 className="text-sm text-gray-500 uppercase tracking-widest mb-4">Audit Log</h3>
                        <ul className="space-y-3 text-xs text-gray-400">
                            {task.activityLogs.map(log => (
                                <li key={log.id} className="flex gap-2">
                                    <span className="text-white">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    <span>{log.user.name} {log.action}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
