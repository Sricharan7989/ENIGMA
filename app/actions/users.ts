"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const SUPERADMIN_EMAIL = "test1@iiits.in";

export async function getUsers() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return [];
    try {
        return await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, teamId: true },
            orderBy: { name: "asc" }
        });
    } catch (e) { console.error(e); return []; }
}

export async function getTeams() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return [];
    try {
        return await prisma.team.findMany({
            select: { id: true, name: true, teamCode: true, _count: { select: { users: true } } },
            orderBy: { name: "asc" }
        });
    } catch (e) { console.error(e); return []; }
}

export async function promoteToAdmin(targetUserId: string) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };
    try {
        const target = await prisma.user.findUnique({ where: { id: targetUserId } });
        if (!target) return { error: "User not found" };
        await prisma.user.update({ where: { id: targetUserId }, data: { role: "ADMIN", updated_at: new Date() } });
        if (target.teamId) {
            const wasLeader = target.isTeamLeader;
            await prisma.user.update({ where: { id: targetUserId }, data: { teamId: null, isTeamLeader: false } });
            if (wasLeader) {
                const nextMember = await prisma.user.findFirst({ where: { teamId: target.teamId } });
                if (nextMember) await prisma.user.update({ where: { id: nextMember.id }, data: { isTeamLeader: true } });
            }
        }
        revalidatePath("/admin");
        return { success: true };
    } catch (e) { console.error(e); return { error: "Failed to promote" }; }
}

export async function demoteFromAdmin(targetUserId: string) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };
    const target = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) return { error: "User not found" };
    if (target.email === SUPERADMIN_EMAIL) return { error: "This admin cannot be demoted" };
    try {
        await prisma.user.update({ where: { id: targetUserId }, data: { role: "USER", updated_at: new Date() } });
        revalidatePath("/admin");
        return { success: true, message: "User demoted. They must log out and back in for changes to take effect." };
    } catch (e) { console.error(e); return { error: "Failed to demote" }; }
}

export async function updateProfile(name: string) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };
    if (!name?.trim() || name.trim().length < 2) return { error: "Name too short" };
    try {
        await prisma.user.update({ where: { id: session.user.id }, data: { name: name.trim() } });
        revalidatePath("/profile"); revalidatePath("/dashboard"); revalidatePath("/admin");
        return { success: true };
    } catch (e) { return { error: "Failed to update name" }; }
}

export async function changePassword(currentPassword: string, newPassword: string) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };
    if (!newPassword || newPassword.length < 6 || newPassword.length > 20) return { error: "Password must be 6-20 characters" };
    try {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user) return { error: "User not found" };
        const { compare, hash } = await import("bcryptjs");
        const isValid = await compare(currentPassword, user.password);
        if (!isValid) return { error: "Current password is incorrect" };
        const hashed = await hash(newPassword, 10);
        await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } });
        return { success: true };
    } catch (e) { console.error(e); return { error: "Failed to change password" }; }
}
