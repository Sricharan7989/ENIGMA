
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

import { auth } from "@/lib/auth";

export async function POST(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. Size Limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large (Max 5MB)" }, { status: 400 });
    }

    // 2. Type Verification
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf", "application/zip"];
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: "Invalid file type. Only Images, PDFs and ZIPs allowed." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use timestamp to avoid collisions
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // ignore if exists
    }

    const resultPath = path.join(uploadDir, filename);

    try {
        await writeFile(resultPath, buffer);
        return NextResponse.json({ url: `/uploads/${filename}`, filename: file.name });
    } catch (error) {
        console.error("Upload failed:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
