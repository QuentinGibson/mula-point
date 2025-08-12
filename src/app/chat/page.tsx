import ChannelPanel from "./channel-panel"
import ChatBoard from "./ChatBoard"

const Chat = () => {
  return (
    <div className="grid grid-cols-[250px_1fr_250px] h-dvh w-dvw">
      <ChannelPanel />
      <ChatBoard />
      <div>Chat users</div>
    </div>
  )
}

export default Chat
