import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import AdminTaskActions from "@/components/AdminTaskActions";
import SubmissionForm from "@/components/SubmissionForm";
import CommentSection from "@/components/CommentSection";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
    DRAFT: "text-gray-400 border-gray-600",
    ASSIGNED: "text-yellow-400 border-yellow-600",
    ACCEPTED: "text-blue-400 border-blue-600",
    IN_PROGRESS: "text-blue-400 border-blue-600",
    COMPLETED: "text-green-400 border-green-600",
    CLOSED: "text-gray-500 border-gray-700",
};

const PRIORITY_COLORS: Record<string, string> = {
    LOW: "text-gray-400",
    MEDIUM: "text-white",
    HIGH: "text-yellow-400",
    CRITICAL: "text-red-500",
};

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session) redirect("/auth/login");

    const task = await prisma.task.findUnique({
        where: { id },
        include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            assignedBy: { select: { id: true, name: true, email: true } },
            team: {
                include: {
                    users: { select: { id: true, name: true, isTeamLeader: true } },
                },
            },
            comments: {
                include: {
                    author: { select: { id: true, name: true, email: true, role: true } },
                },
                orderBy: { createdAt: "asc" },
            },
            attachments: {
                include: {
                    uploader: { select: { id: true, name: true } },
                },
            },
        },
    });

    if (!task) notFound();

    const isAdmin = session.user.role === "ADMIN";
    const isAssignedUser = task.assignedToId === session.user.id;
    const isTeamMember = task.team?.users.some(u => u.id === session.user.id) ?? false;
    const canInteract = isAdmin || isAssignedUser || isTeamMember;
    if (!canInteract) redirect("/dashboard");

    const isLeader = task.team?.users.find(u => u.id === session.user.id)?.isTeamLeader ?? false;

    const submissionComments = task.comments.filter(c => c.content.startsWith("[SUBMISSION:"));
    const memberDoneComments = task.comments.filter(c => c.content.startsWith("[MEMBER_DONE:"));
    const teamMembers = task.team?.users ?? [];

    const doneIds = new Set(memberDoneComments.map(c => c.content.match(/\[MEMBER_DONE:([^\]]+)\]/)?.[1]).filter(Boolean) as string[]);
    const completedCount = teamMembers.length > 0 ? teamMembers.filter(u => doneIds.has(u.id)).length : (task.status === "COMPLETED" ? 1 : 0);
    const totalCount = teamMembers.length || 1;

    const chatComments = task.comments.filter(c => !c.content.startsWith("[SUBMISSION:") && !c.content.startsWith("[MEMBER_DONE:"));

    const statusColor = STATUS_COLORS[task.status] || "text-white border-white";
    const priorityColor = PRIORITY_COLORS[task.priority] || "text-white";

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />
            <div className="max-w-4xl mx-auto px-4 py-8">

                <Link href={isAdmin ? "/admin" : "/dashboard"}
                    className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white uppercase tracking-widest mb-6 transition-colors">
                    Back to {isAdmin ? "Command Center" : "Terminal"}
                </Link>

                {/* Task Header */}
                <div className="border border-white/20 p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                        <h1 className="text-2xl font-mono font-bold text-white uppercase tracking-tight">{task.title}</h1>
                        <div className="flex gap-2 flex-wrap">
                            <span className={`px-3 py-1 border text-xs font-mono font-bold uppercase ${statusColor}`}>{task.status.replace("_", " ")}</span>
                            <span className={`px-3 py-1 border border-current text-xs font-mono font-bold uppercase ${priorityColor}`}>{task.priority}</span>
                        </div>
                    </div>
                    <p className="font-mono text-sm text-gray-300 leading-relaxed mb-6">{task.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                        <div>
                            <span className="text-gray-500 uppercase tracking-widest block mb-1">Assigned To</span>
                            <span className="text-white">{task.assignedTo?.name || task.team?.name || "Unassigned"}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 uppercase tracking-widest block mb-1">Assigned By</span>
                            <span className="text-white">{task.assignedBy?.name || "-"}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 uppercase tracking-widest block mb-1">Due Date</span>
                            <span className="text-white">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No deadline"}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 uppercase tracking-widest block mb-1">Created</span>
                            <span className="text-white">{new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Team Completion Progress */}
                {teamMembers.length > 0 && (
                    <div className="border border-white/10 p-4 mb-6">
                        <p className="font-mono text-xs text-gray-400 uppercase tracking-widest mb-3">Mission Completion Progress</p>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex-1 bg-zinc-800 h-2">
                                <div className="bg-green-500 h-2 transition-all" style={{ width: `${(completedCount / totalCount) * 100}%` }} />
                            </div>
                            <span className="font-mono text-xs text-green-400">{completedCount}/{totalCount}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {teamMembers.map(u => (
                                <span key={u.id} className={`font-mono text-xs px-2 py-1 border ${doneIds.has(u.id) ? "border-green-700 text-green-400 bg-green-900/20" : "border-zinc-700 text-gray-500"}`}>
                                    {doneIds.has(u.id) ? "DONE " : "PENDING "}{u.name}{u.isTeamLeader ? " [L]" : ""}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Admin: Submissions + Attachments View */}
                {isAdmin && submissionComments.length > 0 && (
                    <div className="border border-blue-900/50 p-6 mb-6 bg-blue-900/5">
                        <h3 className="font-mono text-sm text-blue-400 uppercase tracking-widest mb-4">
                            Submitted Work ({submissionComments.length})
                        </h3>
                        <div className="space-y-4">
                            {submissionComments.map(c => {
                                const workText = c.content.replace(/^\[SUBMISSION:[^\]]+\]\s*/, "");
                                const isDone = doneIds.has(c.author.id);
                                const memberAttachments = task.attachments.filter(a => a.uploader?.id === c.author.id);
                                return (
                                    <div key={c.id} className="border border-white/10 p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-mono text-xs text-white font-bold">{c.author.name}</span>
                                            <div className="flex items-center gap-2">
                                                {isDone && <span className="font-mono text-xs text-green-400 border border-green-700 px-2 py-0.5">DONE</span>}
                                                <span className="font-mono text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <p className="font-mono text-sm text-gray-300 mb-3">{workText}</p>
                                        {memberAttachments.length > 0 && (
                                            <div className="space-y-1 pt-2 border-t border-white/10">
                                                <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2">Attachments</p>
                                                {memberAttachments.map(att => (
                                                    <a key={att.id} href={att.url} download={att.filename}
                                                        className="flex items-center gap-2 font-mono text-xs text-blue-400 hover:text-blue-300 underline">
                                                        {att.filename}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Member Actions */}
                {!isAdmin && canInteract && (
                    <SubmissionForm
                        taskId={task.id}
                        isLeader={isLeader}
                        status={task.status}
                        userId={session.user.id}
                        comments={JSON.parse(JSON.stringify(task.comments))}
                    />
                )}

                {/* Admin Controls */}
                {isAdmin && <AdminTaskActions taskId={task.id} status={task.status} />}

                {/* Transmission Log */}
                <CommentSection
                    taskId={task.id}
                    initialComments={JSON.parse(JSON.stringify(chatComments))}
                    currentUserEmail={session.user.email}
                />
            </div>
        </div>
    );
}