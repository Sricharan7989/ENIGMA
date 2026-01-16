
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use timestamp to avoid collisions
    const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;

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
