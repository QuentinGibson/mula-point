"use client"
import { convexQuery } from "@convex-dev/react-query"
import { useSuspenseQuery } from "@tanstack/react-query"
import Image from "next/image"
import { api } from "../../../convex/_generated/api"
import { PlusCircle, Settings } from "lucide-react"
import { useChatroomStore } from "@/stores/chatroom.store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function ChannelPanel() {

  const { data: userName } = useSuspenseQuery(convexQuery(api.users.getUsername, {}))
  const { data: channels } = useSuspenseQuery(convexQuery(api.channelUsers.listChannels, {}))
  const { data: directMessages } = useSuspenseQuery(convexQuery(api.directMessages.list, {}))
  const currentRoom = useChatroomStore((state) => state.currentRoom)

  const changeRoom = useChatroomStore((store) => store.changeRoom)
  return (
    <div className="w-full h-full grid grid-rows-[1fr_4fr_auto] border-r border-r-border">
      <div className="px-5 grid grid-rows-[auto_1fr]  w-full h-full py-5">
        <p className="flex justify-between items-center text-secondary-foreground/50 uppercase text-sm tracking-tight mb-2.5">
          <span>All Channels</span>
          <PlusCircle className="size-3" />
        </p>
        <ul className="p-0 grid grid-flow-row h-fit items-start">
          {channels && channels.length > 0 ? (
            channels.map((channel) => (
              <li className="h-fit" key={channel._id} onClick={() => changeRoom(channel._id, "channel")}>
                <Button
                  variant={"link"}
                  className={cn("font-medium text-sm p-0 text-primary", { "text-blue-600": currentRoom === channel._id })} >
                  {channel.slug}
                </Button>
              </li>
            ))
          ) : (
            <li>Add channels</li>
          )}
        </ul>
      </div>
      <div className="border-t border-t-border py-5 px-2.5 grid grid-rows-[auto_1fr]">
        <p className="text-foreground/60 uppercase text-sm px-2.5 mb-2.5">Direct Message</p>
        <ul className="p-0">
          {directMessages && directMessages.length > 0 ? (
            directMessages.map((dm) => (
              <li key={dm._id} className="px-2.5">
                <Button
                  variant="link"
                  className={cn("font-medium text-sm p-0 text-primary", { "text-blue-600": currentRoom === dm._id })}
                  onClick={() => changeRoom(dm._id, "directMessage")}
                >
                  {dm.otherUser.name}
                </Button>
              </li>
            ))
          ) : (
            <li className="px-2.5 text-sm text-muted-foreground">No direct messages</li>
          )}
        </ul>
      </div>
      <div className="w-full h-full grid grid-flow-col items-center justify-between border-t border-t-border px-3">
        <div className="grid grid-flow-col items-center gap-2 h-[60px]">
          <Image src="/globe.svg" alt="User Profile" width={32} height={32} />
          <p className="font-semibold text-sm">{userName}</p>
        </div>
        <div className="flex gap-2">
          <Settings className="size-5" />
        </div>
      </div>
    </div>
  )
}

export default ChannelPanel
