import { create } from "zustand";
import { Id } from "../../convex/_generated/dataModel";

type RoomId = Id<"channels"> | Id<"directMessages">;
type RoomType = "channel" | "directMessage";

interface ChatroomState {
  currentRoom: RoomId | null;
  roomType: RoomType | null;
  changeRoom: (id: RoomId, type: RoomType) => void;
}

export const useChatroomStore = create<ChatroomState>()(set => ({
  currentRoom: null,
  roomType: null,
  changeRoom: (id, type) => set(() => ({ currentRoom: id, roomType: type }))
}))
