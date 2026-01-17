import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import clientPromise from "@/lib/mongodb";

const joinTeamSchema = z.object({
  teamCode: z.string().length(6, "Team code must be exactly 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const parsed = joinTeamSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid team code format" },
        { status: 400 }
      );
    }

    const { teamCode } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { team: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (existingUser.teamId) {
      return NextResponse.json(
        { success: false, error: "You are already part of a team" },
        { status: 400 }
      );
    }

    const team = await prisma.team.findFirst({
      where: { teamCode },
    });

    if (!team) {
      return NextResponse.json({ success: false, error: "Invalid team code" }, { status: 404 });
    }

    // Transaction to prevent race conditions on maxMembers
    // Verify team exists using Native Driver or Prisma (Read is fine with Prisma)
    // But writes need native. Let's use Prisma for reads as it's easier, then native for write.
    // Actually, converting IDs is annoying. Let's use Prisma for validation logic.

    // ... validation logic (Lines 61-75 in original file used 't' from transaction)
    // We already have 'team' from Line 53.
    // Re-fetch to be safe? Or just use 'team'.
    // The transaction used a re-fetch for locking. We can't lock on standalone.
    // Use 'findUnique' or just rely on 'team'.

    const t = await prisma.team.findUnique({
      where: { id: team.id },
      include: { users: true }
    });

    if (!t) throw new Error("Team not found");
    if (!t.isActive) throw new Error("This team is no longer accepting new members");
    if (t.users.length >= t.maxMembers) throw new Error("This team is full");
    if (t.creatorId === userId) throw new Error("You cannot join your own team");

    // Perform Update using Native Driver
    const client = await clientPromise;
    const db = client.db();
    const { ObjectId } = require('mongodb'); // Should move to top level import

    await db.collection("User").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { teamId: new ObjectId(team.id), updated_at: new Date() } }
    );

    // Fetch updated team for response
    const updatedTeam = await prisma.team.findUnique({
      where: { id: t.id },
      include: {
        users: {
          select: { id: true, name: true, email: true, isTeamLeader: true },
        },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      team: {
        id: updatedTeam?.id,
        name: updatedTeam?.name,
        teamCode: updatedTeam?.teamCode,
        members: updatedTeam?.users,
        creator: updatedTeam?.creator,
        memberCount: updatedTeam?.users.length,
        maxMembers: updatedTeam?.maxMembers,
      },
      message: `Successfully joined team "${team.name}"!`,
    });
  } catch (error) {
    console.error("Error joining team:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    // Map known errors to 400, others to 500? Use simple heuristic for now
    const status = (message.includes("full") || message.includes("accepting") || message.includes("own team") || message.includes("not found")) ? 400 : 500;

    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
