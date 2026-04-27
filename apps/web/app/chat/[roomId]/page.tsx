"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import { DateSeparator } from "@/components/chat/date-separator"
import { MessageItem } from "@/components/chat/message-item"
import { RoomHeader } from "@/components/chat/room-header"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { useChatContext } from "@/contexts/chat-context"
import { useRoomMessages } from "@/hooks/use-room-messages"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { ScrollArea } from "@workspace/ui/components/scroll-area"

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const { socket, rooms, currentUser } = useChatContext()
  const room = rooms.find((r) => r.id === roomId)

  const { messages, typingUsers, addReaction, removeReaction } = useRoomMessages(
    roomId,
    socket,
    currentUser?.sub,
  )

  const [input, setInput] = React.useState("")
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !socket) return
    socket.emit("sendMessage", { roomId, content: input.trim() })
    setInput("")
  }

  function handleTyping(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value)
    if (!socket) return
    const member = room?.members.find((m) => m.userId === currentUser?.sub)
    socket.emit("typing", {
      roomId,
      username: member?.user.username ?? currentUser?.email ?? "",
    })
  }

  return (
    <div className="flex h-full flex-col">
      <RoomHeader room={room} />
      <ScrollArea className="flex-1 px-2 py-3">
        <div className="flex flex-col gap-0.5">
          {messages.map((msg, i) => (
            <React.Fragment key={msg.id}>
              {i > 0 &&
                new Date(msg.createdAt).toDateString() !==
                  new Date(messages[i - 1]!.createdAt).toDateString() && (
                  <DateSeparator date={msg.createdAt} />
                )}
              <MessageItem
                message={msg}
                currentUserId={currentUser?.sub ?? ""}
                onAddReaction={addReaction}
                onRemoveReaction={removeReaction}
              />
            </React.Fragment>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <div className="border-t">
        <TypingIndicator typingUsers={typingUsers} />
        <form onSubmit={handleSend} className="flex gap-2 px-4 py-3">
          <Input
            value={input}
            onChange={handleTyping}
            placeholder={`Message #${room?.name ?? "..."}`}
            autoComplete="off"
          />
          <Button type="submit" disabled={!input.trim()}>
            Envoyer
          </Button>
        </form>
      </div>
    </div>
  )
}
