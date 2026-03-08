"use client";
import { useState } from "react";
import { createTask } from "@/app/actions/tasks";

interface Props {
  users: { id: string; name: string; email: string }[];
  teams: { id: string; name: string }[];
  onClose: () => void;
}

export default function CreateTaskModal({ users, teams, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assignType, setAssignType] = useState<"USER" | "TEAM">("USER");
  const [form, setForm] = useState({
    title: "", description: "", priority: "MEDIUM",
    dueDate: "", assignedToId: "", teamIdString: "",
  });

  async function handleSubmit() {
    if (!form.title || !form.description) { setError("Title and description required"); return; }
    setLoading(true); setError("");
    try {
      const res = await createTask({
        title: form.title, description: form.description,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        assignedToId: assignType === "USER" ? form.assignedToId || undefined : undefined,
        teamIdString: assignType === "TEAM" ? form.teamIdString || undefined : undefined,
      });
      if (res.error) { setError(res.error); setLoading(false); }
      else { onClose(); }
    } catch { setError("Something went wrong"); setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white/30 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-white/20">
          <h2 className="font-mono font-bold text-white uppercase tracking-widest text-sm">[ NEW MISSION ]</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white font-mono text-lg">✕</button>
        </div>
        <div className="p-5 space-y-4">
          {error && <p className="text-red-400 font-mono text-xs border border-red-900 bg-red-900/10 p-2">[ERROR] {error}</p>}

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Mission Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}
              className="w-full bg-black border border-white/30 p-2.5 font-mono text-sm text-white focus:border-white outline-none" placeholder="Enter title..." />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Description *</label>
            <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
              rows={3} className="w-full bg-black border border-white/30 p-2.5 font-mono text-sm text-white focus:border-white outline-none resize-none" placeholder="Describe the mission..." />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Priority *</label>
            <select value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value}))}
              className="w-full bg-black border border-white/30 p-2.5 font-mono text-sm text-white focus:border-white outline-none">
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Assign To *</label>
            <div className="flex mb-3">
              {(["USER","TEAM"] as const).map(t => (
                <button key={t} type="button" onClick={() => setAssignType(t)}
                  className={`flex-1 py-2 font-mono text-xs uppercase border transition-colors ${assignType===t?"bg-white text-black border-white":"border-white/20 text-gray-400 hover:text-white"}`}>
                  {t}
                </button>
              ))}
            </div>
            {assignType === "USER" ? (
              <select value={form.assignedToId} onChange={e => setForm(p => ({...p, assignedToId: e.target.value}))}
                className="w-full bg-black border border-white/30 p-2.5 font-mono text-sm text-white focus:border-white outline-none">
                <option value="">-- Select User --</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
            ) : (
              <select value={form.teamIdString} onChange={e => setForm(p => ({...p, teamIdString: e.target.value}))}
                className="w-full bg-black border border-white/30 p-2.5 font-mono text-sm text-white focus:border-white outline-none">
                <option value="">-- Select Team --</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Due Date (Optional)</label>
            <input type="date" value={form.dueDate} onChange={e => setForm(p => ({...p, dueDate: e.target.value}))}
              className="w-full bg-black border border-white/30 p-2.5 font-mono text-sm text-white focus:border-white outline-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="flex-1 py-2.5 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 transition-colors">
              {loading ? "DEPLOYING..." : "DEPLOY MISSION"}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 border border-white/30 text-white font-mono text-xs uppercase hover:bg-white/10 transition-colors">
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
