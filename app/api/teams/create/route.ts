import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function generateTeamCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const createTeamSchema = z.object({
  teamName: z
    .string()
    .min(2, "Team name must be at least 2 characters")
    .max(50, "Team name must be less than 50 characters"),
  clubName: z.string().optional(),
  maxMembers: z.number().min(2).max(100).default(3),
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
    const parsed = createTeamSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { teamName, clubName, maxMembers } = parsed.data;

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

    const existingTeam = await prisma.team.findFirst({
      where: { creatorId: userId },
    });

    if (existingTeam) {
      return NextResponse.json(
        { success: false, error: "You have already created a team" },
        { status: 400 }
      );
    }

    let teamCode = generateTeamCode();
    let codeExists = await prisma.team.findFirst({ where: { teamCode } });

    while (codeExists) {
      teamCode = generateTeamCode();
      codeExists = await prisma.team.findFirst({ where: { teamCode } });
    }

    // Use native MongoDB client to bypass Prisma's Replica Set requirement for relations
    const client = await clientPromise;
    const db = client.db();

    const newTeamId = new ObjectId();
    const teamDoc = {
      _id: newTeamId,
      name: teamName,
      teamCode,
      collegeId: new ObjectId(existingUser.collegeId),
      ClubName: clubName || null,
      maxMembers: maxMembers,
      isActive: true, // default
      isVerified: false, // default
      points: 0, // default
      creatorId: new ObjectId(userId),
      created_at: new Date(),
      updated_at: new Date()
    };

    await db.collection("Team").insertOne(teamDoc);

    await db.collection("User").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          teamId: newTeamId,
          isTeamLeader: true,
          updated_at: new Date()
        }
      }
    );

    // Return the constructed team object (mapped back to string IDs for frontend)
    const result = {
      ...teamDoc,
      id: teamDoc._id.toString(),
      collegeId: teamDoc.collegeId.toString(),
      creatorId: teamDoc.creatorId.toString(),
    };

    return NextResponse.json({
      success: true,
      team: {
        id: result.id,
        name: result.name,
        teamCode: result.teamCode,
        maxMembers: result.maxMembers,
        clubName: result.ClubName,
      },
      message:
        "Team created successfully! Share your team code with teammates.",
    });
  } catch (error) {
    console.error("Error in team creation:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
