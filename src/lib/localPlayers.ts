import { create } from "zustand";

export interface LocalPlayer {
  id: string;
  name: string;
}

interface PlayerStore {
  players: LocalPlayer[];
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  clear: () => void;
}

export const useLocalPlayers = create<PlayerStore>((set) => ({
  players: [],

  addPlayer: (name: string) =>
    set((state) => ({
      players: [
        ...state.players,
        {
          id: crypto.randomUUID(),  // 🔥 always a valid UUID
          name: name.trim(),
        }
      ]
    })),

  removePlayer: (id: string) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== id)
    })),

  clear: () => set({ players: [] })
}));
