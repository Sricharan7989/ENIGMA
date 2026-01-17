"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  isTeamLeader: boolean;
  batch: string | null;
  phone_number: string | null;
}

interface TeamData {
  id: string;
  name: string;
  teamCode: string;
  clubName: string | null;
  points: number;
  maxMembers: number;
  isActive: boolean;
  memberCount: number;
  members: TeamMember[];
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
}

interface TeamDashboardProps {
  team: TeamData;
  isLeader: boolean;
}

export default function TeamDashboard({ team, isLeader }: TeamDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const router = useRouter();

  const handleLeaveTeam = async () => {
    if (
      !confirm(
        isLeader
          ? "Are you sure you want to delete this team? This action cannot be undone and will remove all members."
          : "Are you sure you want to leave this team?"
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/teams", {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        router.push("/");
      } else {
        alert(data.error || "Failed to process request");
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const copyTeamCode = () => {
    navigator.clipboard.writeText(team.teamCode);
    alert("Team code copied to clipboard!");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto enigma-box rounded-none shadow-[0_0_15px_rgba(255,255,255,0.1)]">
      <div className="flex justify-between items-start mb-8 border-b border-white/20 pb-6">
        <div>
          <h2 className="text-4xl font-mono font-bold text-white tracking-tighter uppercase">{team.name}</h2>
          <div className="flex items-center mt-2 space-x-4">
            {team.clubName && (
              <span className="text-sm font-mono text-gray-400 border border-gray-600 px-2 py-0.5">
                {team.clubName}
              </span>
            )}
            <span className="text-xs font-mono text-gray-500">
              EST. {formatDate(team.createdAt)}
            </span>
            {isLeader && (
              <span className="px-2 py-0.5 bg-white text-black text-xs font-bold font-mono rounded-none">
                LEADER
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-4xl font-mono font-bold text-white tracking-widest">{team.points}</div>
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Points</div>
        </div>
      </div>

      {/* Action Bar / Team Code */}
      <div className="mb-8 p-6 border border-white/30 bg-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-10 font-mono text-6xl font-bold select-none pointer-events-none">CODE</div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
          <div>
            <h3 className="text-lg font-mono font-bold text-white uppercase mb-1">Invite Operatives</h3>
            <p className="text-xs font-mono text-gray-400 max-w-sm">
              Share the access code below to recruit members to your unit.
            </p>
          </div>

          {isLeader ? (
            <div className="flex items-center space-x-3">
              {/* Add Member Button - Triggers Code Reveal */}
              {!showCode && (
                <button
                  onClick={() => setShowCode(true)}
                  className="enigma-button bg-white text-black hover:bg-gray-200"
                >
                  + Add Member
                </button>
              )}

              {showCode && (
                <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right duration-300">
                  <div className="font-mono text-xl tracking-[0.2em] text-white border-b-2 border-white px-4 py-1">
                    {team.teamCode}
                  </div>
                  <button
                    onClick={copyTeamCode}
                    className="p-2 border border-white hover:bg-white hover:text-black transition-colors"
                    title="Copy Code"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </button>
                  <button
                    onClick={() => setShowCode(false)}
                    className="text-xs text-gray-500 hover:text-white underline font-mono"
                  >
                    Hide
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm font-mono text-gray-500">
              Only the Leader can invite new operatives.
            </div>
          )}
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="text-center p-4 border border-white/10 bg-black">
          <div className="text-2xl font-mono font-bold text-white">
            {team.memberCount}
          </div>
          <div className="text-xs font-mono text-gray-500 uppercase">Members</div>
        </div>
        <div className="text-center p-4 border border-white/10 bg-black">
          <div className="text-2xl font-mono font-bold text-white">
            {team.maxMembers}
          </div>
          <div className="text-xs font-mono text-gray-500 uppercase">Capacity</div>
        </div>
        <div className="text-center p-4 border border-white/10 bg-black">
          <div className="text-2xl font-mono font-bold text-white">
            {team.maxMembers - team.memberCount}
          </div>
          <div className="text-xs font-mono text-gray-500 uppercase">Slots Open</div>
        </div>
        <div className="text-center p-4 border border-white/10 bg-black">
          <div
            className={`text-xl font-mono font-bold uppercase ${team.isActive ? "text-green-500 text-glow" : "text-red-500"
              }`}
          >
            {team.isActive ? "Active" : "Offline"}
          </div>
          <div className="text-xs font-mono text-gray-500 uppercase">Status</div>
        </div>
      </div>

      {/* Team Members */}
      <div className="mb-8">
        <h3 className="text-md font-mono font-bold text-white uppercase mb-4 border-b border-white/10 pb-2">
          Unit Roster
        </h3>
        <div className="space-y-2">
          {team.members && team.members.length > 0 ? (
            team.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border border-white/10 hover:border-white/40 transition-colors bg-black"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 flex items-center justify-center font-mono font-bold border ${member.isTeamLeader
                        ? "bg-white text-black border-white"
                        : "bg-black text-white border-white/50"
                      }`}
                  >
                    {member.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="font-mono text-sm text-white">
                      {member.name || "Unknown Agent"}
                      {member.isTeamLeader && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-gray-500">
                          [LDR]
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-gray-500">{member.email}</div>
                  </div>
                </div>
                {member.phone_number && (
                  <div className="hidden md:block text-xs font-mono text-gray-500">
                    {member.phone_number}
                  </div>
                )}
              </div>
            ))
          ) : null}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-4 border-t border-white/20">
        <button
          onClick={handleLeaveTeam}
          disabled={loading}
          className={`px-4 py-2 font-mono text-xs uppercase tracking-widest border transition-colors ${loading ? "opacity-50 cursor-wait" : ""
            } ${isLeader
              ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              : "border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white"
            }`}
        >
          {loading ? "Processing..." : isLeader ? "Disband Unit" : "Leave Unit"}
        </button>
      </div>
    </div>
  );
}
