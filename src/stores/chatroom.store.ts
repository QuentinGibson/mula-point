import { create } from "zustand";
import { Id } from "../../convex/_generated/dataModel";

interface ChatroomState {
  currentRoom: Id<"channels"> | null,
  changeRoom: (id: Id<"channels">) => void
}

export const useChatroomStore = create<ChatroomState>()(set => ({
  currentRoom: null,
  changeRoom: (id) => set(() => ({ currentRoom: id }))
}))
