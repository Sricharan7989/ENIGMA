import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ count: 0 });
        const count = await prisma.task.count({
            where: {
                OR: [
                    { assignedToId: session.user.id, status: "ASSIGNED" },
                    { teamIdString: session.user.teamId ?? undefined, status: "ASSIGNED" }
                ]
            }
        });
        return NextResponse.json({ count });
    } catch { return NextResponse.json({ count: 0 }); }
}
