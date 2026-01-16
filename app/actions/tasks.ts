"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for Task Creation
const createTaskSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    dueDate: z.string().optional(), // ISO string
    assignedToId: z.string().optional(),
    teamIdString: z.string().optional(), // For team assignment
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createTask(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return { error: "Unauthorized: Admins only" };
    }

    const rawData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        priority: formData.get("priority") as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        dueDate: formData.get("dueDate") as string,
        assignedToId: (formData.get("assignedToId") as string) || undefined,
        teamIdString: (formData.get("teamIdString") as string) || undefined,
    };

    const parsed = createTaskSchema.safeParse(rawData);
    if (!parsed.success) {
        return { error: parsed.error.message };
    }

    try {
        const task = await prisma.task.create({
            data: {
                title: parsed.data.title,
                description: parsed.data.description,
                priority: parsed.data.priority,
                dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
                status: "ASSIGNED", // Default to assigned
                assignedById: session.user.id,
                assignedToId: parsed.data.assignedToId,
                teamIdString: parsed.data.teamIdString,
            },
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: "TASK_CREATED",
                taskId: task.id,
                userId: session.user.id,
            },
        });

        revalidatePath("/admin");
        revalidatePath("/dashboard");
        return { success: true, task };
    } catch (error) {
        console.error("Failed to create task:", error);
        return { error: "Failed to create task" };
    }
}

export async function getTasks(filter: 'ALL' | 'ASSIGNED' | 'TEAM' = 'ALL') {
    const session = await auth();
    if (!session) return [];

    const { user } = session;

    if (user.role === 'ADMIN') {
        return await prisma.task.findMany({
            include: {
                assignedTo: { select: { name: true, email: true } },
                team: { select: { name: true } },
            },
            orderBy: { created_at: 'desc' }
        });
    }

    // Convert filter to query
    // Member sees: Tasks assigned to them OR tasks assigned to their team
    return await prisma.task.findMany({
        where: {
            OR: [
                { assignedToId: user.id },
                { team: { users: { some: { id: user.id } } } } // If user is in the team
            ]
        },
        include: {
            assignedBy: { select: { name: true } },
            team: { select: { name: true } }
        },
        orderBy: { dueDate: 'asc' }
    });
}
