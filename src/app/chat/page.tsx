import ChatBoard from "./ChatBoard"

const Chat = () => {
  return (
    <div className="grid grid-cols-[1fr_4fr_1fr]">
      <div>Chat Channels</div>
      <ChatBoard />
      <div>Chat users</div>
    </div>
  )
}

export default Chat
