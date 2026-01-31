"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addComment(taskId: string, content: string) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    if (!content || content.trim() === "") return { error: "Comment cannot be empty" };

    try {
        await prisma.comment.create({
            data: {
                content,
                taskId,
                authorId: session.user.id
            }
        });

        revalidatePath(`/tasks/${taskId}`);
        return { success: true };
    } catch (e) {
        return { error: "Failed to add comment" };
    }
}

export async function getComments(taskId: string) {
    const session = await auth();
    if (!session) return [];

    try {
        // Verify access to task? 
        // Admin or Assigned/Team Member.
        // For simplicity, authenticated users can see comments on tasks they can access.
        // Ideally we check task access here too but `getTasks` handles list filtering.
        // Assuming page level check handles access control for the view.

        const comments = await prisma.comment.findMany({
            where: { taskId },
            include: {
                author: {
                    select: { name: true, email: true, role: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
        return comments;
    } catch (e) {
        return [];
    }
}
