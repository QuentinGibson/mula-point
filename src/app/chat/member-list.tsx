"use client"
import { convexQuery } from "@convex-dev/react-query"
import { useQuery } from "@tanstack/react-query"
import { api } from "../../../convex/_generated/api"
import { useChatroomStore } from "@/stores/chatroom.store"
import { Button } from "@/components/ui/button"

function MemberList() {
  const currentChannel = useChatroomStore((state) => state.currentRoom)
  const { data: members } = useQuery({
    ...convexQuery(api.channelUsers.listUsers, { id: currentChannel! }),
    enabled: !!currentChannel
  })

  if (!currentChannel) <NoChannel />
  return (
    <div className="grid grid-rows-[auto_1fr] px-2.5 py-5 uppercase border-l border-l-border overflow-x-scroll">
      <p className="text-sm text-foreground/70 px-4">Members List</p>
      <div className="grid grid-flow-row justify-start mt-2.5">
        {members?.map((member, index) => (
          <Button key={index} variant={"link"} className="justify-start hover:no-underline hover:bg-gray-300 py-6 rounded-none">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
              <p className="font-medium text-sm">{member?.name.slice(0, 1).toUpperCase() || "U"}</p>
            </div>
            <span className="font-semibold text-gray-900 text-sm">
              {member?.name}
            </span>
          </Button>
        ))
        }
      </div>
    </div>
  )
}

export default MemberList

function NoChannel() {
  return (
    <div>
      Select a channel
    </div>
  )
}
