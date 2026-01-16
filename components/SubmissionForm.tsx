"use client";

import { useState } from "react";
import { submitWork, markTaskComplete } from "@/app/actions/submissions";

export default function SubmissionForm({ taskId }: { taskId: string }) {
    const [content, setContent] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        setMsg("");

        const attachmentUrls: string[] = [];
        const attachmentNames: string[] = [];

        // 1. Upload files
        for (const file of files) {
            const fd = new FormData();
            fd.append("file", file);
            try {
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                if (!res.ok) throw new Error("Upload failed");
                const data = await res.json();
                attachmentUrls.push(data.url);
                attachmentNames.push(data.filename);
            } catch (err) {
                console.error(err);
                setMsg("Error uploading files.");
                setUploading(false);
                return;
            }
        }

        // 2. Submit work
        const fd = new FormData();
        fd.append("content", content);
        attachmentUrls.forEach(url => fd.append("attachmentUrls", url));
        attachmentNames.forEach(name => fd.append("attachmentNames", name));

        const res = await submitWork(taskId, null, fd);

        if (res?.error) {
            setMsg(res.error);
        } else {
            setMsg("Work submitted successfully!");
            setContent("");
            setFiles([]);
            // Optionally auto-complete? Or let user click Complete.
        }
        setUploading(false);
    };

    const handleComplete = async () => {
        if (!confirm("Are you sure you want to mark this task as completed?")) return;
        const res = await markTaskComplete(taskId);
        if (res?.error) setMsg(res.error);
    };

    return (
        <div className="bg-zinc-900/50 p-6 border border-white/10 mt-8">
            <h3 className="text-xl font-bold mb-4">Submit Work</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Describe your work..."
                    className="w-full bg-black border border-gray-700 p-2 min-h-[100px] focus:border-white outline-none"
                    required
                />

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Attachments</label>
                    <input type="file" multiple onChange={handleFileChange} className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:border-0 file:text-sm file:font-semibold
              file:bg-white file:text-black
              hover:file:bg-gray-200
            " />
                </div>

                {msg && <p className={msg.includes("Error") ? "text-red-500" : "text-green-500"}>{msg}</p>}

                <div className="flex gap-4">
                    <button disabled={uploading} type="submit" className="bg-white text-black px-6 py-2 font-bold hover:bg-gray-200 disabled:opacity-50">
                        {uploading ? "Uploading..." : "Submit Work"}
                    </button>
                </div>
            </form>

            <div className="mt-8 pt-8 border-t border-white/10">
                <button onClick={handleComplete} className="text-sm text-green-500 hover:text-green-400 uppercase tracking-widest font-bold border border-green-900 bg-green-900/20 px-4 py-2">
                    Mark Task as Completed
                </button>
            </div>
        </div>
    );
}
