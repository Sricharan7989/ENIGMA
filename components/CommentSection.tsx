// PLACE AT: components/CommentSection.tsx  (REPLACE existing)
"use client";

import { useState, useEffect, useRef } from "react";
import { addComment } from "@/app/actions/comments";
import { useTaskSocket } from "@/lib/hooks/useSocket";

type Comment = {
    id: string;
    content: string;
    createdAt: Date;
    author: { name: string | null; email: string; role: string };
};

export default function CommentSection({
    taskId,
    initialComments,
    currentUserEmail,
}: {
    taskId: string;
    initialComments: Comment[];
    currentUserEmail: string;
}) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const socket = useTaskSocket(taskId);

    // Real-time: listen for new comments
    useEffect(() => {
        if (!socket) return;

        socket.on("comment:new", (comment: Comment) => {
            // Avoid duplicate if it's our own optimistic add
            setComments(prev => {
                const exists = prev.some(c => c.id === comment.id);
                if (exists) return prev;
                return [...prev, comment];
            });
        });

        return () => { socket.off("comment:new"); };
    }, [socket]);

    // Auto-scroll to bottom on new comment
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        const text = newComment.trim();
        setNewComment("");

        const result = await addComment(taskId, text);
        setSubmitting(false);

        if (!result.success) {
            setNewComment(text); // restore on error
            alert("Failed to post comment");
        }
    }

    function formatDate(date: Date) {
        return new Date(date).toLocaleString("en-GB");
    }

    const nonSubmissionComments = comments.filter(c => !c.content.startsWith("[SUBMISSION]"));
    const submissionComments = comments.filter(c => c.content.startsWith("[SUBMISSION]"));

    return (
        <div className="mt-8">
            {/* Submissions section for admins */}
            {submissionComments.length > 0 && (
                <div className="mb-8 border border-green-500/20 bg-green-900/5 p-4">
                    <h3 className="text-xs font-mono font-bold text-green-400 uppercase tracking-widest mb-4">
                        Work Submissions ({submissionComments.length})
                    </h3>
                    <div className="space-y-3">
                        {submissionComments.map(c => (
                            <div key={c.id} className="border border-green-900/50 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-mono text-xs font-bold text-green-400">
                                        {c.author.name || c.author.email}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-mono">{formatDate(c.createdAt)}</span>
                                </div>
                                <p className="font-mono text-xs text-gray-300">
                                    {c.content.replace("[SUBMISSION] ", "")}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Comments */}
            <div className="border-t border-white/20 pt-6">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    // Transmission Log ({nonSubmissionComments.length})
                    {socket?.connected && (
                        <span className="text-[9px] text-green-500 border border-green-900 px-1.5 py-0.5 rounded">
                            LIVE
                        </span>
                    )}
                </h3>

                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-1">
                    {nonSubmissionComments.length === 0 ? (
                        <p className="text-gray-600 font-mono text-xs italic">No transmissions recorded.</p>
                    ) : (
                        nonSubmissionComments.map((comment) => {
                            const isMe = comment.author.email === currentUserEmail;
                            const isAdmin = comment.author.role === "ADMIN";
                            return (
                                <div key={comment.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                    <div className={`max-w-[85%] border p-3 ${isMe ? "border-white/30 bg-white/5" : "border-white/10 bg-black"}`}>
                                        <div className="flex items-center gap-2 mb-1.5 border-b border-white/10 pb-1.5">
                                            <span className={`font-mono text-xs font-bold ${isAdmin ? "text-red-400" : "text-blue-400"}`}>
                                                {comment.author.name || comment.author.email.split("@")[0]}
                                                {isAdmin && " [CMD]"}
                                            </span>
                                            <span className="text-[10px] text-gray-600 font-mono">
                                                {formatDate(comment.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>

                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleSubmit(e as unknown as React.FormEvent); }}
                        placeholder="Enter encrypted message... (Ctrl+Enter to send)"
                        rows={3}
                        disabled={submitting}
                        className="w-full bg-black border border-white/20 p-3 font-mono text-sm text-white focus:border-white/60 outline-none transition-colors placeholder-gray-700 resize-none"
                    />
                    <button
                        type="submit"
                        disabled={submitting || !newComment.trim()}
                        className="absolute bottom-3 right-3 px-3 py-1 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        {submitting ? "..." : "Transmit"}
                    </button>
                </form>
            </div>
        </div>
    );
}


