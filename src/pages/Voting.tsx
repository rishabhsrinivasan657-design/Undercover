import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Voting() {
  const { roomId, playerId } = useParams();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("room_id", roomId)
        .eq("is_eliminated", false)
        .order("joined_at", { ascending: true });

      if (!mounted) return;
      setPlayers(data ?? []);
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [roomId]);

  async function eliminatePlayer(id: string) {
    if (disabled) return;
    setDisabled(true);

    // 1) Mark player eliminated
    const { error } = await supabase
      .from("players")
      .update({ is_eliminated: true })
      .eq("id", id);

    if (error) {
      console.error("Failed to eliminate:", error);
      setDisabled(false);
      return;
    }

    // 2) Go to Eliminated screen and let that screen decide next steps
    navigate(`/eliminated/${roomId}/${id}/${playerId}`);
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading…
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-6">Voting Time</h1>
      <p className="opacity-70 mb-6">Choose who the group wants to eliminate.</p>

      <div className="w-full max-w-md space-y-3">
        {players.map((p) => (
          <button
            key={p.id}
            onClick={() => eliminatePlayer(p.id)}
            disabled={disabled}
            className="w-full px-6 py-4 rounded-lg font-semibold border 
                       bg-white/10 border-white/20 hover:bg-red-500 hover:border-red-300
                       transition text-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
