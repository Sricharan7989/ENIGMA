"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CreateTaskInput {
    title: string;
    description: string;
    priority?: string;
    dueDate?: string;
    assignedToId?: string;
    teamIdString?: string;
}

export async function createTask(data: CreateTaskInput) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };
    if (!data) return { error: "No data received" };
    const { title, description, priority = "MEDIUM", dueDate, assignedToId, teamIdString } = data;
    if (!title || title.length < 3) return { error: "Title must be at least 3 characters" };
    if (!description || description.length < 5) return { error: "Description too short" };
    try {
        const task = await prisma.task.create({ data: {
            title, description,
            priority: priority as any,
            status: "ASSIGNED",
            dueDate: dueDate ? new Date(dueDate) : undefined,
            assignedById: session.user.id,
            assignedToId: assignedToId || undefined,
            teamIdString: teamIdString || undefined,
        }});
        revalidatePath("/admin"); revalidatePath("/dashboard");
        return { success: true, task };
    } catch (e) { console.error(e); return { error: "Failed to create task" }; }
}

export async function getTasks() {
    const session = await auth();
    if (!session) return [];
    if (session.user.role === "ADMIN") {
        return await prisma.task.findMany({
            include: {
                assignedTo: { select: { id: true, name: true, email: true } },
                assignedBy: { select: { name: true } },
                team: { select: { id: true, name: true } },
                _count: { select: { comments: true } }
            },
            orderBy: { created_at: "desc" }
        });
    }
    return await prisma.task.findMany({
        where: { OR: [
            { assignedToId: session.user.id },
            { teamIdString: session.user.teamId ?? undefined }
        ]},
        include: {
            assignedBy: { select: { name: true } },
            team: { select: { name: true } },
            _count: { select: { comments: true } }
        },
        orderBy: { created_at: "desc" }
    });
}

export async function deleteTask(taskId: string) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };
    try {
        await prisma.task.delete({ where: { id: taskId } });
        revalidatePath("/admin"); revalidatePath("/dashboard");
        return { success: true };
    } catch { return { error: "Failed to delete task" }; }
}

export async function closeTask(taskId: string) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };
    try {
        await prisma.task.update({ where: { id: taskId }, data: { status: "CLOSED" } });
        revalidatePath("/admin"); revalidatePath(`/tasks/${taskId}`);
        return { success: true };
    } catch { return { error: "Failed to close task" }; }
}

export async function reopenTask(taskId: string) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };
    try {
        await prisma.task.update({ where: { id: taskId }, data: { status: "ASSIGNED" } });
        revalidatePath("/admin"); revalidatePath(`/tasks/${taskId}`);
        return { success: true };
    } catch { return { error: "Failed to reopen task" }; }
}

export async function updateTaskStatus(taskId: string, status: string) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };
    try {
        await prisma.task.update({ where: { id: taskId }, data: { status: status as any } });
        revalidatePath("/dashboard"); revalidatePath(`/tasks/${taskId}`);
        return { success: true };
    } catch { return { error: "Failed to update status" }; }
}
