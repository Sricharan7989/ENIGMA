"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getUsers() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return [];

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                teamId: true
            },
            orderBy: { name: 'asc' }
        });
        return users;
    } catch (e) {
        console.error("Failed to fetch users", e);
        return [];
    }
}

export async function getTeams() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return [];

    try {
        const teams = await prisma.team.findMany({
            select: {
                id: true,
                name: true,
                teamCode: true,
                _count: {
                    select: { users: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        return teams;
    } catch (e) {
        console.error("Failed to fetch teams", e);
        return [];
    }
}
