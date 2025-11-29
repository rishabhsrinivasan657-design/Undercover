import { supabase } from "./supabase";

export async function startGame(roomId: string, hostId: string) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assign-roles`;

  // Get auth session for RLS
  const sessionRes = await supabase.auth.getSession();
  const accessToken = sessionRes.data.session?.access_token;

  if (!accessToken) {
    throw new Error("Not logged in");
  }

  // Call Edge Function to assign roles + words
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      roomId,
      hostId,
    }),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    console.error("Failed to parse JSON from assign-roles", e);
    throw new Error("Unexpected response from server");
  }

  if (!res.ok) {
    console.error("Assign error:", data);
    throw new Error(data.error || "Failed to start game");
  }

  // IMPORTANT:
  // After roles are assigned → set phase = "role_reveal"
  const { error: updateErr } = await supabase
    .from("rooms")
    .update({
      phase: "role_reveal",
      round: 1,
    })
    .eq("id", roomId);

  if (updateErr) {
    console.error("Failed to update room phase:", updateErr);
    throw new Error("Could not set role_reveal phase");
  }

  // Edge function returns undercover/civilian words info
  return data;
}
