import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function VoteTally() {
  const { roomId, playerId } = useParams();
  const navigate = useNavigate();

  const [eliminatedName, setEliminatedName] = useState("");

  useEffect(() => {
    async function tally() {
      const { data: alive } = await supabase
        .from("players")
        .select("*")
        .eq("room_id", roomId)
        .eq("is_eliminated", false);

      if (!alive) return;

      // Count votes
      const votes: Record<string, number> = {};
      alive.forEach((p) => {
        if (p.vote_for) votes[p.vote_for] = (votes[p.vote_for] || 0) + 1;
      });

      const maxVotes = Math.max(...Object.values(votes));
      const finalists = Object.keys(votes).filter(
        (id) => votes[id] === maxVotes
      );

      // Random among ties
      const eliminatedId =
        finalists[Math.floor(Math.random() * finalists.length)];

      const eliminatedPlayer = alive.find((p) => p.id === eliminatedId);
      if (!eliminatedPlayer) return;

      setEliminatedName(eliminatedPlayer.name);

      // Mark eliminated
      await supabase
        .from("players")
        .update({ is_eliminated: true })
        .eq("id", eliminatedId);

      // Reset all votes
      for (const p of alive) {
        await supabase.from("players").update({ vote_for: null }).eq("id", p.id);
      }

      // Check for win condition
      const { data: updated } = await supabase
        .from("players")
        .select("*")
        .eq("room_id", roomId);

      const remaining = updated.filter((p) => !p.is_eliminated);
      const undercover = updated.find((p) => p.role === "undercover");

      if (!undercover) return;

      // Undercover caught → civilians win
      if (undercover.is_eliminated) {
        navigate(`/results/${roomId}`);
        return;
      }

      // Only undercover + 1 civilian remain → undercover wins
      if (remaining.length === 2) {
        navigate(`/results/${roomId}`);
        return;
      }
    }

    tally();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Eliminated Player</h1>

      <div className="mt-6 mb-10 text-5xl font-extrabold text-red-400 drop-shadow-lg">
        {eliminatedName || "…"}
      </div>

      <button
        onClick={() => navigate(`/discussion/${roomId}/${playerId}`)}
        className="px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl shadow-lg"
      >
        Next Round →
      </button>
    </div>
  );
}
