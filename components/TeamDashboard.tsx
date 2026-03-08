"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TeamDashboard({ team, isLeader }: { team: any; isLeader: boolean }) {
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const router = useRouter();

  const handleLeaveTeam = async () => {
    if (!confirm(isLeader ? "Disband this unit?" : "Leave this unit?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/teams", { method: "DELETE" });
      const data = await res.json();
      if (data.success) router.push("/dashboard");
      else alert(data.error || "Failed");
    } finally { setLoading(false); }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(team.teamCode);
    alert("Copied: " + team.teamCode);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white uppercase tracking-widest mb-6 transition-colors">
        ← Back to Terminal
      </Link>
      <div className="border border-white/20 bg-black p-6 md:p-8">
        <div className="flex justify-between items-start mb-8 border-b border-white/20 pb-6">
          <div>
            <h2 className="text-3xl font-mono font-bold text-white tracking-tighter uppercase">{team.name}</h2>
            <div className="flex items-center mt-2 gap-3 flex-wrap">
              {team.clubName && <span className="text-xs font-mono text-gray-400 border border-gray-600 px-2 py-0.5">{team.clubName}</span>}
              {isLeader && <span className="px-2 py-0.5 bg-white text-black text-xs font-bold font-mono">LEADER</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold text-white">{team.points}</div>
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Points</div>
          </div>
        </div>

        <div className="mb-8 p-5 border border-white/20 bg-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase mb-1">Invite Operatives</h3>
              <p className="text-xs font-mono text-gray-500">Share the access code to recruit members.</p>
            </div>
            {isLeader && (
              <div className="flex items-center gap-3">
                {!showCode ? (
                  <button
                    type="button"
                    onClick={() => { console.log("clicked"); setShowCode(true); }}
                    className="px-4 py-2 bg-white text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    + ADD MEMBER
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-3 border border-white bg-black">
                    <span className="font-mono text-2xl tracking-[0.3em] text-white font-bold">{team.teamCode}</span>
                    <button type="button" onClick={copyCode} className="px-3 py-1 border border-white text-xs font-mono text-white hover:bg-white hover:text-black">COPY</button>
                    <button type="button" onClick={() => setShowCode(false)} className="text-xs font-mono text-gray-500 hover:text-white">Hide</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[{l:"Members",v:team.memberCount},{l:"Capacity",v:team.maxMembers},{l:"Slots Open",v:team.maxMembers-team.memberCount}].map(s=>(
            <div key={s.l} className="text-center p-4 border border-white/10">
              <div className="text-2xl font-mono font-bold text-white">{s.v}</div>
              <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mt-1">{s.l}</div>
            </div>
          ))}
          <div className="text-center p-4 border border-white/10">
            <div className={`text-xl font-mono font-bold uppercase ${team.isActive ? "text-green-500" : "text-red-500"}`}>{team.isActive ? "Active" : "Offline"}</div>
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mt-1">Status</div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Unit Roster</h3>
          <div className="space-y-2">
            {team.members.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-3 border border-white/10 hover:border-white/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 flex items-center justify-center font-mono font-bold text-sm border ${member.isTeamLeader ? "bg-white text-black border-white" : "bg-black text-white border-white/40"}`}>
                    {member.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="font-mono text-sm text-white">{member.name || "Unknown"}{member.isTeamLeader && <span className="ml-2 text-[10px] text-gray-500">[LDR]</span>}</div>
                    <div className="text-xs font-mono text-gray-500">{member.email}</div>
                  </div>
                </div>
                <a href={`mailto:${member.email}`} className="px-3 py-1 border border-white/20 text-xs font-mono text-gray-400 hover:border-white hover:text-white transition-colors uppercase">Contact</a>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/20">
          <Link href="/dashboard" className="px-4 py-2 border border-white/30 text-white font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors">← Dashboard</Link>
          <button onClick={handleLeaveTeam} disabled={loading} className={`px-4 py-2 font-mono text-xs uppercase tracking-widest border transition-colors disabled:opacity-50 ${isLeader ? "border-red-500/50 text-red-400 hover:bg-red-900/20" : "border-yellow-500/50 text-yellow-400 hover:bg-yellow-900/20"}`}>
            {loading ? "Processing..." : isLeader ? "Disband Unit" : "Leave Unit"}
          </button>
        </div>
      </div>
    </div>
  );
}
