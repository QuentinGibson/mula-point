import ChannelPanel from "./channel-panel"
import ChatBoard from "./ChatBoard"
import MemberList from "./member-list"

const Chat = () => {
  return (
    <div className="grid grid-cols-[250px_1fr_250px] h-dvh w-dvw">
      <ChannelPanel />
      <ChatBoard />
      <MemberList />
    </div>
  )
}

export default Chat
