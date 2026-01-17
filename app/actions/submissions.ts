"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const submitWorkSchema = z.object({
    content: z.string().min(1, "Work description is required"),
    // Attachments are handled via a separate upload step usually, but here we might pass URLs
    attachments: z.array(z.object({
        url: z.string().url(),
        filename: z.string(),
    })).optional(),
});


interface SubmissionState {
    error?: string;
    success?: boolean;
}

export async function submitWork(taskId: string, prevState: SubmissionState | null, formData: FormData) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    const rawData = {
        content: formData.get("content") as string,
        attachments: (formData.getAll("attachmentUrls") as string[]).map((url, i) => ({
            url,
            filename: (formData.getAll("attachmentNames")[i] as string) || 'unknown'
        }))
    };

    const parsed = submitWorkSchema.safeParse(rawData);

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const { content, attachments } = parsed.data;

    try {
        // Verify task assignment
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { team: { include: { users: true } } }
        });

        if (!task) return { error: "Task not found" };

        const isAssignedUser = task.assignedToId === session.user.id;
        const isAssignedTeamMember = task.team?.users.some(u => u.id === session.user.id);

        if (!isAssignedUser && !isAssignedTeamMember) {
            return { error: "You are not assigned to this task" };
        }

        // Post comment as work submission? Or handle status?
        // We probably want to update status to IN_PROGRESS (if not) or COMPLETED?
        // Requirement: "Member ticks Completed. Submission is saved and visible."
        // Let's assume this is the submission action.

        // 1. Save attachments
        if (attachments && attachments.length > 0) {
            await Promise.all(attachments.map(att =>
                prisma.attachment.create({
                    data: {
                        taskId,
                        url: att.url,
                        filename: att.filename,
                        uploadedBy: session.user.id
                    }
                })
            ));
        }

        // 2. Add comment/log about submission
        await prisma.comment.create({
            data: {
                content: `[SUBMISSION] ${content}`,
                taskId,
                authorId: session.user.id
            }
        });

        // 3. Update status to IN_PROGRESS if DRAFT/ASSIGNED/ACCEPTED?
        // Or if user intends to "Finish", maybe separate action.
        // Let's just update activity log.

        await prisma.activityLog.create({
            data: {
                action: "WORK_SUBMITTED",
                taskId,
                userId: session.user.id,
            }
        });

        revalidatePath(`/tasks/${taskId}`);
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Submission failed" };
    }
}

export async function acceptTask(taskId: string) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { team: { include: { users: true } } }
        });

        if (!task) return { error: "Not found" };

        const isAssignedUser = task.assignedToId === session.user.id;
        const isAssignedTeamMember = task.team?.users.some(u => u.id === session.user.id);

        if (!isAssignedUser && !isAssignedTeamMember) return { error: "Unauthorized" };

        if (task.status !== 'ASSIGNED') return { error: "Task cannot be accepted at this stage" };

        try {
            await prisma.task.update({
                where: { id: taskId, status: 'ASSIGNED' }, // Atomic transition
                data: { status: 'ACCEPTED' }
            });
        } catch (err: unknown) {
            // P2025 is Record to update not found
            if (typeof err === 'object' && err && 'code' in err && err.code === 'P2025') {
                return { error: "Task was already accepted or modified" };
            }
            throw err;
        }

        await prisma.activityLog.create({
            data: {
                action: "TASK_ACCEPTED",
                taskId,
                userId: session.user.id
            }
        });

        revalidatePath(`/tasks/${taskId}`);
        revalidatePath('/dashboard');
        return { success: true };

    } catch (e) {
        return { error: "Failed to accept" };
    }
}

export async function markTaskComplete(taskId: string) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { team: { include: { users: true } } }
        });

        if (!task) return { error: "Not found" };

        const isAssignedUser = task.assignedToId === session.user.id;
        const isAssignedTeamMember = task.team?.users.some(u => u.id === session.user.id);

        if (!isAssignedUser && !isAssignedTeamMember) return { error: "Unauthorized" };

        const validStatuses = ['ACCEPTED', 'IN_PROGRESS'];
        if (!validStatuses.includes(task.status)) return { error: "Task must be accepted before completion" };

        const result = await prisma.task.updateMany({
            where: {
                id: taskId,
                status: { in: ['ACCEPTED', 'IN_PROGRESS'] }
            },
            data: { status: 'COMPLETED' }
        });

        if (result.count === 0) {
            return { error: "Task status changed or already completed" };
        }

        await prisma.activityLog.create({
            data: {
                action: "TASK_COMPLETED",
                taskId,
                userId: session.user.id
            }
        });

        revalidatePath(`/tasks/${taskId}`);
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e) {
        return { error: "Failed to complete" };
    }
}
