import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // ---------------------------------------------
  // 1. Handle CORS Preflight
  // ---------------------------------------------
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { roomId, hostId } = await req.json();

    if (!roomId || !hostId) {
      return new Response(
        JSON.stringify({ error: "roomId and hostId required" }),
        { status: 400, headers: corsHeaders },
      );
    }

    // 🔒 Use ANON KEY + Forward Client JWT → RLS stays ON
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: req.headers.get("Authorization")!, // forward user JWT
          },
        },
      }
    );

    // 2. Validate host
    const { data: room, error: errRoom } = await supabase
      .from("rooms")
      .select("host_id")
      .eq("id", roomId)
      .single();

    if (errRoom || !room) {
      return new Response(
        JSON.stringify({ error: "Room not found" }),
        { status: 404, headers: corsHeaders },
      );
    }

    if (room.host_id !== hostId) {
      return new Response(
        JSON.stringify({ error: "Only host can start the game" }),
        { status: 403, headers: corsHeaders },
      );
    }

    // 3. Get active players
    const { data: players, error: errPlayers } = await supabase
      .from("players")
      .select("id")
      .eq("room_id", roomId)
      .eq("is_eliminated", false);

    if (errPlayers) throw errPlayers;

    if (!players || players.length < 3) {
      return new Response(
        JSON.stringify({ error: "Not enough players" }),
        { status: 400, headers: corsHeaders },
      );
    }

    // 4. Pick undercover
    const playerIds = players.map((p) => p.id);
    const undercoverId =
      playerIds[Math.floor(Math.random() * playerIds.length)];

    // 5. Pick random word pair
    const { data: pairs, error: errPairs } = await supabase
      .from("word_pairs")
      .select("*");

    if (errPairs) throw errPairs;

    if (!pairs || pairs.length === 0) {
      return new Response(
        JSON.stringify({ error: "No word pairs available" }),
        { status: 500, headers: corsHeaders },
      );
    }

    const pair = pairs[Math.floor(Math.random() * pairs.length)];

    // 6. Assign roles via RPC
    const { error: errRpc } = await supabase.rpc(
      "assign_roles_and_words",
      {
        p_room: roomId,
        p_undercover: undercoverId,
        p_citizen_word: pair.citizen_word,
        p_undercover_word: pair.undercover_word
      }
    );

    if (errRpc) {
      return new Response(
        JSON.stringify({ error: errRpc.message }),
        { status: 500, headers: corsHeaders },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        undercoverId,
        pairId: pair.id,
      }),
      { status: 200, headers: corsHeaders },
    );

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: corsHeaders },
    );
  }
});
