import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { domainToTag } from "@/lib/collegeMapping";

const isValidIIITDomain = (domain: string): boolean => {
  const lowerDomain = domain.toLowerCase();
  const allowDomains = Object.keys(domainToTag);
  return allowDomains.includes(lowerDomain);
};

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .email("Invalid email format")
    .refine(
      (email) => {
        const domain = email.split("@")[1];
        return domain && isValidIIITDomain(domain);
      },
      {
        message: "Email must be from an IIIT institution domain",
      }
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    const domain = email.split("@")[1].toLowerCase();
    const tag = domainToTag[domain];
    if (!tag) {
      return NextResponse.json(
        { error: "Invalid IIIT domain" },
        { status: 400 }
      );
    }

    const college = await prisma.college.findUnique({
      where: { tag },
    });
    if (!college) {
      return NextResponse.json(
        { error: "College not found for the domain" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);


    // Bypass Prisma transaction requirement for standalone MongoDB
    // const user = await prisma.user.create({ ... })

    // Generate ObjectId for new user if needed, or let Mongo generate it.
    // However, we want to return the user object.

    const now = new Date();

    // Construct the document for insertion
    // Note: Relations (collegeId) must be stored as ObjectId

    const insertDoc = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "USER",
      collegeId: { "$oid": college.id },
      isVerified: false,
      created_at: { "$date": now.toISOString() },
      updated_at: { "$date": now.toISOString() }
    };

    // We can use runCommandRaw to insert
    const rawRes = await prisma.$runCommandRaw({
      insert: "User",
      documents: [insertDoc]
    }) as any;

    if (rawRes.writeErrors && rawRes.writeErrors.length > 0) {
      throw new Error("Failed to insert user via raw command");
    }

    // Fetch the created user to return it (and verify it exists)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        collegeId: true
      }
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in registration:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
