import { supabase } from "./supabase";
import { generateRoomId } from "./room";

// -----------------------------
// CREATE ROOM
// -----------------------------
export async function createRoom() {
  let id = generateRoomId();

  // Ensure unique room ID
  while (true) {
    const { data } = await supabase
      .from("rooms")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!data) break;
    id = generateRoomId();
  }

  const user = await supabase.auth.getUser();

  console.log("Creating room with ID:", id);
  console.log("Host UID:", user.data.user?.id);

  const { error } = await supabase.from("rooms").insert({
    id,
    host_id: user.data.user?.id,
    phase: "lobby",
    round: 0,
    timer: null,
  });

  if (error) {
    console.error("createRoom error:", error);
    return null;
  }

  return id;
}

// -----------------------------
// JOIN ROOM (with debugging)
// -----------------------------
export async function joinRoom(roomId: string, name: string) {
  console.log("JOIN ROOM START → roomId:", roomId);

  // 1. Check session
  const session = await supabase.auth.getSession();
  console.log("SESSION USER ID:", session.data.session?.user?.id);

  // 2. SELECT room to verify RLS
  const { data: room, error: roomErr } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .maybeSingle();

  console.log("ROOM SELECT RESULT:", room, "ERROR:", roomErr);

  if (!room) {
    console.warn("Room not found OR SELECT blocked by RLS");
    return null;
  }

  // 3. Insert player
  const playerId = crypto.randomUUID();
  console.log("Generated Player ID:", playerId);

  const { data: insertData, error: insertErr } = await supabase
    .from("players")
    .insert({
      id: playerId,
      room_id: roomId,
      name,
      is_eliminated: false,
      vote_for: null,
    })
    .select("*");

  console.log("INSERT PLAYER RESULT:", insertData, "ERROR:", insertErr);

  if (insertErr) {
    console.error("Player insert error:", insertErr);
    return null;
  }

  console.log("JOIN ROOM SUCCESS!");
  return room;
}

// -----------------------------
// GET PLAYERS
// -----------------------------
export async function getPlayers(roomId: string) {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", roomId)
    .order("joined_at", { ascending: true });

  if (error) {
    console.error("getPlayers error:", error);
    return [];
  }

  return data || [];
}

// -----------------------------
// GET ROOM
// -----------------------------
export async function getRoom(roomId: string) {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (error) {
    console.error("getRoom error:", error);
    return null;
  }

  return data;
}
