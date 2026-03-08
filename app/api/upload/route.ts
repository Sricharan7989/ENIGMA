import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const taskId = formData.get("taskId") as string;
        if (!file || !taskId) return NextResponse.json({ error: "Missing file or taskId" }, { status: 400 });
        if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        const dataUrl = `data:${file.type};base64,${base64}`;
        const attachment = await prisma.attachment.create({
            data: { url: dataUrl, filename: file.name, uploadedBy: session.user.id, taskId }
        });
        return NextResponse.json({ success: true, id: attachment.id, filename: file.name });
    } catch (e) { console.error(e); return NextResponse.json({ error: "Upload failed" }, { status: 500 }); }
}
