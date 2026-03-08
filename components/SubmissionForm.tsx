"use client";
import { useState } from "react";
import { submitWork, acceptTask, declineTask, markMemberComplete } from "@/app/actions/submissions";

type Comment = { id: string; content: string; authorId: string; author?: { name: string; role: string } };

export default function SubmissionForm({ taskId, isLeader, status, userId, comments }: {
    taskId: string; isLeader: boolean; status: string; userId: string; comments: Comment[];
}) {
    const [content, setContent] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState("");
    const [msgType, setMsgType] = useState<"error"|"success">("success");

    const submissions = comments.filter(c => c.content.startsWith("[SUBMISSION:"));
    const memberDoneIds = comments
        .filter(c => c.content.startsWith("[MEMBER_DONE:"))
        .map(c => c.content.match(/\[MEMBER_DONE:([^\]]+)\]/)?.[1])
        .filter(Boolean);
    const iAlreadySubmitted = submissions.some(c => c.authorId === userId);
    const iAlreadyDone = memberDoneIds.includes(userId);

    const showMsg = (text: string, type: "error"|"success") => { setMsg(text); setMsgType(type); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) { showMsg("Please enter a work description.", "error"); return; }
        setSubmitting(true); setMsg("");
        // Upload file first if provided
        if (file) {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("taskId", taskId);
            const upRes = await fetch("/api/upload", { method: "POST", body: fd });
            const upData = await upRes.json();
            if (!upRes.ok) { showMsg(upData.error || "File upload failed", "error"); setSubmitting(false); return; }
        }
        const res = await submitWork(taskId, { content });
        if (res?.error) showMsg(res.error, "error");
        else { showMsg("Work submitted successfully!", "success"); setContent(""); setFile(null); }
        setSubmitting(false);
    };

    const handleAccept = async () => {
        const res = await acceptTask(taskId);
        if (res?.error) showMsg(res.error, "error");
        else showMsg("Mission accepted!", "success");
    };

    const handleDecline = async () => {
        if (!confirm("Decline this mission?")) return;
        const res = await declineTask(taskId);
        if (res?.error) showMsg(res.error, "error");
    };

    const handleDone = async () => {
        if (!confirm("Mark yourself as done with this mission?")) return;
        const res = await markMemberComplete(taskId);
        if (res?.error) showMsg(res.error, "error");
        else showMsg("Marked as done!", "success");
    };

    return (
        <div className="space-y-4 mb-6">
            {msg && (
                <div className={`font-mono text-xs px-4 py-2 border ${msgType === "error" ? "text-red-400 border-red-900 bg-red-900/10" : "text-green-400 border-green-900 bg-green-900/10"}`}>
                    {msg}
                </div>
            )}
            {status === "ASSIGNED" && isLeader && (
                <div className="bg-zinc-900/50 p-4 border border-white/10">
                    <p className="font-mono text-xs text-gray-400 mb-3 uppercase tracking-widest">Mission Awaiting Acceptance</p>
                    <div className="flex gap-3">
                        <button onClick={handleAccept} className="flex-1 bg-white text-black font-mono font-bold text-xs py-2 uppercase tracking-widest hover:bg-gray-200">ACCEPT MISSION</button>
                        <button onClick={handleDecline} className="flex-1 border border-red-700 text-red-500 font-mono font-bold text-xs py-2 uppercase tracking-widest hover:bg-red-900/20">DECLINE</button>
                    </div>
                </div>
            )}
            {status === "ASSIGNED" && !isLeader && (
                <div className="bg-zinc-900/50 p-4 border border-yellow-900/50">
                    <p className="font-mono text-xs text-yellow-500 uppercase tracking-widest">Awaiting team leader acceptance</p>
                </div>
            )}
            {["ACCEPTED","IN_PROGRESS"].includes(status) && !iAlreadySubmitted && (
                <div className="bg-zinc-900/50 p-6 border border-white/10">
                    <h3 className="font-mono text-sm tracking-widest uppercase mb-4">Submit Work</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block font-mono text-xs tracking-widest text-gray-400 mb-2">WORK DESCRIPTION *</label>
                            <textarea value={content} onChange={e => setContent(e.target.value)}
                                placeholder="Describe what you completed..." required
                                className="w-full bg-black border border-gray-700 p-3 min-h-[120px] focus:border-white outline-none font-mono text-sm resize-none" />
                        </div>
                        <div>
                            <label className="block font-mono text-xs tracking-widest text-gray-400 mb-2">ATTACH FILE (OPTIONAL, MAX 5MB)</label>
                            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)}
                                className="block w-full font-mono text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:border file:border-white/20 file:bg-black file:text-white file:font-mono file:text-xs hover:file:bg-zinc-900 file:cursor-pointer" />
                            {file && <p className="font-mono text-xs text-green-400 mt-1">Selected: {file.name} ({(file.size/1024).toFixed(1)}KB)</p>}
                        </div>
                        <button disabled={submitting} type="submit"
                            className="bg-white text-black px-6 py-2 font-bold font-mono text-xs uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50">
                            {submitting ? "TRANSMITTING..." : "TRANSMIT WORK"}
                        </button>
                    </form>
                </div>
            )}
            {iAlreadySubmitted && !iAlreadyDone && ["ACCEPTED","IN_PROGRESS","COMPLETED"].includes(status) && (
                <div className="bg-zinc-900/50 p-4 border border-green-900/50">
                    <p className="font-mono text-xs text-green-400 mb-3 uppercase tracking-widest">Work submitted. Mark yourself done?</p>
                    <button onClick={handleDone} className="border border-green-700 text-green-500 font-mono font-bold text-xs py-2 px-4 uppercase tracking-widest hover:bg-green-900/20">
                        MARK MISSION COMPLETE (MY PART)
                    </button>
                </div>
            )}
            {iAlreadyDone && (
                <div className="bg-green-900/10 p-4 border border-green-900/50">
                    <p className="font-mono text-xs text-green-400 uppercase tracking-widest">YOU HAVE COMPLETED YOUR PART</p>
                </div>
            )}
        </div>
    );
}
