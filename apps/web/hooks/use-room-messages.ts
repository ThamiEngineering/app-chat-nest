"use client"

import * as React from "react"
import type { Socket } from "socket.io-client"

import { API_URL, authHeaders } from "@/lib/api"
import type { Message } from "@/lib/types"

export function useRoomMessages(
  roomId: string,
  socket: Socket | null,
  currentUserId: string | undefined,
) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [typingUsers, setTypingUsers] = React.useState<Map<string, string>>(new Map())
  const typingTimers = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  React.useEffect(() => {
    if (!roomId) return
    fetch(`${API_URL}/rooms/${roomId}/messages`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data: Message[]) => setMessages(data))
      .catch(console.error)
  }, [roomId])

  React.useEffect(() => {
    if (!socket || !roomId) return

    socket.emit("joinRoom", roomId)

    function onNewMessage(msg: Message) {
      setMessages((prev) => [...prev, msg])
    }

    function onUserTyping({ userId, username }: { userId: string; username: string }) {
      if (userId === currentUserId) return
      setTypingUsers((prev) => new Map(prev).set(userId, username))
      const existing = typingTimers.current.get(userId)
      if (existing) clearTimeout(existing)
      const timer = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Map(prev)
          next.delete(userId)
          return next
        })
      }, 3000)
      typingTimers.current.set(userId, timer)
    }

    function onReactionUpdated({
      messageId,
      reactions,
    }: {
      messageId: string
      reactions: Message["reactions"]
    }) {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions } : m)),
      )
    }

    socket.on("newMessage", onNewMessage)
    socket.on("userTyping", onUserTyping)
    socket.on("reactionUpdated", onReactionUpdated)

    return () => {
      socket.emit("leaveRoom", roomId)
      socket.off("newMessage", onNewMessage)
      socket.off("userTyping", onUserTyping)
      socket.off("reactionUpdated", onReactionUpdated)
    }
  }, [socket, roomId, currentUserId])

  function addReaction(messageId: string, emoji: string) {
    socket?.emit("addReaction", { messageId, emoji, roomId })
  }

  function removeReaction(messageId: string, emoji: string) {
    socket?.emit("removeReaction", { messageId, emoji, roomId })
  }

  return { messages, typingUsers, addReaction, removeReaction }
}
