"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitWork(taskId: string, data: { content: string }) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };
    if (!data.content?.trim()) return { error: "Work description is required" };
    try {
        const task = await prisma.task.findUnique({ where: { id: taskId }, include: { team: { include: { users: true } } } });
        if (!task) return { error: "Task not found" };
        const isAssigned = task.assignedToId === session.user.id || task.team?.users.some(u => u.id === session.user.id);
        if (!isAssigned) return { error: "You are not assigned to this task" };
        await prisma.comment.create({ data: { content: `[SUBMISSION:${session.user.id}] ${data.content}`, taskId, authorId: session.user.id } });
        if (["ASSIGNED","ACCEPTED"].includes(task.status)) {
            await prisma.task.update({ where: { id: taskId }, data: { status: "IN_PROGRESS" } });
        }
        revalidatePath(`/tasks/${taskId}`); revalidatePath("/dashboard");
        return { success: true };
    } catch (e) { console.error(e); return { error: "Submission failed" }; }
}

export async function acceptTask(taskId: string) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.isTeamLeader) return { error: "Only the team leader can accept missions" };
    try {
        const task = await prisma.task.findUnique({ where: { id: taskId }, include: { team: { include: { users: true } } } });
        if (!task) return { error: "Not found" };
        const isAssigned = task.assignedToId === session.user.id || task.team?.users.some(u => u.id === session.user.id);
        if (!isAssigned) return { error: "Unauthorized" };
        if (task.status !== "ASSIGNED") return { error: "Task cannot be accepted at this stage" };
        await prisma.task.update({ where: { id: taskId }, data: { status: "ACCEPTED" } });
        revalidatePath(`/tasks/${taskId}`); revalidatePath("/dashboard");
        return { success: true };
    } catch { return { error: "Failed to accept" }; }
}

export async function declineTask(taskId: string) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.isTeamLeader) return { error: "Only the team leader can decline missions" };
    try {
        await prisma.task.update({ where: { id: taskId }, data: { status: "ASSIGNED" } });
        revalidatePath(`/tasks/${taskId}`);
        return { success: true };
    } catch { return { error: "Failed to decline" }; }
}

export async function markMemberComplete(taskId: string) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };
    try {
        const task = await prisma.task.findUnique({ where: { id: taskId }, include: { team: { include: { users: true } } } });
        if (!task) return { error: "Not found" };
        const isAssigned = task.assignedToId === session.user.id || task.team?.users.some(u => u.id === session.user.id);
        if (!isAssigned) return { error: "Unauthorized" };
        await prisma.comment.create({ data: { content: `[MEMBER_DONE:${session.user.id}]`, taskId, authorId: session.user.id } });
        if (task.team && task.team.users.length > 0) {
            const allComments = await prisma.comment.findMany({ where: { taskId } });
            const memberIds = task.team.users.map(u => u.id);
            const doneIds = new Set(allComments
                .filter(c => c.content.startsWith("[MEMBER_DONE:"))
                .map(c => { const m = c.content.match(/\[MEMBER_DONE:([^\]]+)\]/); return m ? m[1] : null; })
                .filter(Boolean)
            );
            const allDone = memberIds.every(id => doneIds.has(id));
            if (allDone) await prisma.task.update({ where: { id: taskId }, data: { status: "COMPLETED" } });
        } else {
            await prisma.task.update({ where: { id: taskId }, data: { status: "COMPLETED" } });
        }
        revalidatePath(`/tasks/${taskId}`); revalidatePath("/dashboard");
        return { success: true };
    } catch (e) { console.error(e); return { error: "Failed" }; }
}
