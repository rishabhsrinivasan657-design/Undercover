import { useEffect, useState } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Game() {
  // NOTE: param name must match App.tsx: /game/:roomId
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [playerId, setPlayerId] = useState<string | null>(null);

  // Load current player (using supabase auth user ID)
  useEffect(() => {
    async function loadPlayer() {
      const session = (await supabase.auth.getSession()).data.session;
      const userId = session?.user?.id;

      if (!userId || !roomId) return;

      try {
        const { data: player } = await supabase
          .from("players")
          .select("id")
          .eq("room_id", roomId)
          .eq("id", userId)
          .single();

        if (player) {
          setPlayerId(player.id);
        } else {
          // Player row might not exist (e.g. host who didn't add self), but we keep Game mounted.
          console.warn("Player entry not found for user in this room yet.");
        }
      } catch (err) {
        console.error("Failed to load player:", err);
      }
    }

    loadPlayer();
  }, [roomId]);

  // Listen for room phase changes in realtime
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          const phase = payload.new.phase;
          console.log("Phase changed →", phase);
          routeToPhase(phase);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, playerId]);

  // Initial fetch to get current phase (in case we mounted late)
  useEffect(() => {
    async function fetchPhase() {
      if (!roomId) return;

      const { data: room } = await supabase
        .from("rooms")
        .select("phase")
        .eq("id", roomId)
        .single();

      if (!room) return;

      routeToPhase(room.phase);
    }

    fetchPhase();
  }, [roomId, playerId]);

  // Routing logic for each phase
  const routeToPhase = (phase: string) => {
    // If we don't know the user playerId yet, avoid navigating to per-player routes.
    // For role_reveal/discussion/voting/tally we require playerId because route has playerId param.
    if (!roomId) return;

    switch (phase) {
      case "role_reveal":
        if (playerId) {
          navigate(`/game/${roomId}/role-reveal/${playerId}`);
        } else {
          console.warn("No playerId yet for role_reveal routing — will wait.");
        }
        break;

      case "discussion":
        if (playerId) {
          navigate(`/game/${roomId}/discussion/${playerId}`);
        } else {
          console.warn("No playerId yet for discussion routing — will wait.");
        }
        break;

      case "voting":
        if (playerId) {
          navigate(`/game/${roomId}/voting/${playerId}`);
        } else {
          console.warn("No playerId yet for voting routing — will wait.");
        }
        break;

      case "tally":
        if (playerId) {
          navigate(`/game/${roomId}/tally/${playerId}`);
        } else {
          console.warn("No playerId yet for tally routing — will wait.");
        }
        break;

      case "results":
        navigate(`/results/${roomId}`);
        break;

      default:
        console.warn("Unknown phase:", phase);
        break;
    }
  };

  // Render the wrapper + nested route (Outlet)
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* you can place header / common UI here */}
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold">Game</h2>
        <p className="text-gray-400 mt-2">Room: {roomId}</p>
      </div>

      {/* nested route will render inside Outlet */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
