// PLACE AT: app/actions/comments.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { emitToTask, emitToAdmins } from "@/lib/socket";

export async function addComment(taskId: string, content: string) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    if (!content.trim()) return { error: "Comment cannot be empty" };
    if (content.length > 1000) return { error: "Comment too long" };

    try {
        // RBAC: verify user has access to this task
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { team: { include: { users: { select: { id: true } } } } },
        });

        if (!task) return { error: "Task not found" };

        const isAdmin = session.user.role === "ADMIN";
        const isAssigned = task.assignedToId === session.user.id;
        const isTeamMember = task.team?.users.some(u => u.id === session.user.id) ?? false;

        if (!isAdmin && !isAssigned && !isTeamMember) {
            return { error: "Access denied" };
        }

        const comment = await prisma.comment.create({
            data: {
                taskId,
                authorId: session.user.id,
                content: content.trim(),
            },
            include: {
                author: { select: { name: true, email: true, role: true } }
            }
        });

        const commentPayload = {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            author: comment.author,
        };

        // Real-time: broadcast new comment to everyone watching this task
        emitToTask(taskId, "comment:new", commentPayload);

        // Also notify admins if it's a member comment
        if (!isAdmin) {
            emitToAdmins("comment:new", { taskId, ...commentPayload });
        }

        revalidatePath(`/tasks/${taskId}`);
        return { success: true, comment: commentPayload };
    } catch (error) {
        console.error("addComment error:", error);
        return { error: "Failed to post comment" };
    }
}
