"use client";

import { useState } from "react";
import { addComment } from "@/app/actions/comments";

type Comment = {
    id: string;
    content: string;
    createdAt: Date;
    author: {
        name: string;
        email: string;
        role: string;
    }
};

export default function CommentSection({ taskId, initialComments, currentUserEmail }: { taskId: string, initialComments: Comment[], currentUserEmail: string }) {
    // We can use optimistic UI or just simple revalidation.
    // For simplicity, let's rely on server action revalidation for now, maybe local state for immediate feedback if needed.
    // But since `addComment` revalidates path, props `initialComments` won't update automatically unless parent re-renders.
    // In Next.js client component inside server component, router.refresh() handles this.

    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Sync with props if they change (e.g. after revalidation)
    // Actually, if parent re-renders, this component re-renders with new props.
    if (initialComments !== comments && !submitting) {
        setComments(initialComments);
    }

    // Better pattern: just use props directly and manual optimistics if strict. 
    // Let's stick to props for display and local state for input.

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        const result = await addComment(taskId, newComment);
        setSubmitting(false);

        if (result.success) {
            setNewComment("");
            // Router refresh should happen automatically if parent is server component and action revalidated path.
        } else {
            alert("Failed to post comment");
        }
    }

    function formatDate(date: Date) {
        return new Date(date).toLocaleString();
    }

    return (
        <div className="mt-8 border-t border-white/20 pt-6">
            <h3 className="text-xl font-mono font-bold text-white mb-6 uppercase">
                // Transmission Log ({initialComments.length})
            </h3>

            <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {initialComments.length === 0 ? (
                    <p className="text-gray-500 font-mono text-sm italic">No transmissions recorded.</p>
                ) : (
                    initialComments.map((comment) => {
                        const isMe = comment.author.email === currentUserEmail;
                        const isAdmin = comment.author.role === "ADMIN";

                        return (
                            <div key={comment.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                <div className={`max-w-[80%] border ${isMe ? "border-white/40 bg-white/5" : "border-white/10 bg-black"} p-4 `}>
                                    <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
                                        <span className={`font-mono text-xs font-bold ${isAdmin ? "text-red-500" : "text-blue-400"}`}>
                                            {comment.author.name} {isAdmin && "[CMD]"}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-mono">
                                            {formatDate(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Enter encrypted message..."
                    rows={3}
                    disabled={submitting}
                    className="w-full bg-black border border-white/30 p-4 font-mono text-sm text-white focus:border-white outline-none transition-colors"
                />
                <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="absolute bottom-4 right-4 px-4 py-1 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? "Sending..." : "Transmit"}
                </button>
            </form>
        </div>
    );
}
