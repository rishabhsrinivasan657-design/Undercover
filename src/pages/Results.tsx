import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import confetti from "canvas-confetti";

export default function Results() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<any[]>([]);
  const [undercover, setUndercover] = useState<any | null>(null);
  const [winner, setWinner] = useState<"civilians" | "undercover" | null>(null);

  useEffect(() => {
    async function load() {
      const { data: playersData } = await supabase
        .from("players")
        .select("*")
        .eq("room_id", roomId);

      if (!playersData) return;

      setPlayers(playersData);

      const u = playersData.find((p: any) => p.role === "undercover");
      setUndercover(u);

      const alive = playersData.filter((p: any) => !p.is_eliminated);

      if (u && u.is_eliminated) {
        setWinner("civilians");
      } else if (alive.length <= 2) {
        setWinner("undercover");
      }
    }

    load();
  }, [roomId]);

  // 🎉 Confetti for civilians win
  useEffect(() => {
    if (winner === "civilians") {
      confetti({
        particleCount: 180,
        spread: 80,
        origin: { y: 0.7 },
      });
    }
  }, [winner]);

  // 💜 Undercover neon glow
  const neon =
    winner === "undercover"
      ? "text-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]"
      : "";

  // 💜 Civilians purple glow (subtle)
  const civiliansGlow =
    winner === "civilians"
      ? "text-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]"
      : "";

  if (!undercover)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading results...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-8 text-center animate-fadeIn">

      {/* Title */}
      <h1
        className={`text-5xl font-extrabold mb-2 drop-shadow 
                    ${winner === "undercover" ? neon : civiliansGlow}`}
      >
        {winner === "undercover" ? "Undercover Wins!" : "Civilians Win!"}
      </h1>

      <p className="opacity-80 text-lg mb-10">
        Game Over — here are the final results
      </p>

      {/* Undercover Player Reveal */}
      <div className="bg-white/10 border border-white/20 rounded-xl p-6 mb-10 w-full max-w-xl">
        <h2 className="text-xl opacity-70">Undercover Player</h2>
        <p className="text-3xl font-bold mt-2 text-purple-300">{undercover.name}</p>
        <p className="text-md opacity-60 mt-1">Word: {undercover.word}</p>
      </div>

      {/* Player List */}
      <div className="w-full max-w-xl space-y-3 mb-12">
        {players.map((p: any) => (
          <div
            key={p.id}
            className={`p-4 rounded-lg border flex justify-between text-lg ${
              p.id === undercover.id
                ? "border-purple-400 bg-purple-600/20"
                : p.is_eliminated
                ? "border-red-400 bg-red-600/20 line-through"
                : "border-white/20 bg-white/5"
            }`}
          >
            <span>{p.name}</span>
            <span className="opacity-70 text-sm">
              {p.is_eliminated ? "❌ Eliminated" : "✔ Alive"}
            </span>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button
          onClick={() => navigate(`/discussion/${roomId}/${players[0].id}`)}
          className="px-6 py-4 bg-indigo-600 rounded-xl text-white font-bold text-lg hover:bg-indigo-700"
        >
          🔄 Play Again (Same Room)
        </button>

        <button
          onClick={() => navigate("/")}
          className="px-6 py-4 bg-gray-700 rounded-xl text-white font-bold text-lg hover:bg-gray-800"
        >
          🏠 Create New Game
        </button>
      </div>
    </div>
  );
}
