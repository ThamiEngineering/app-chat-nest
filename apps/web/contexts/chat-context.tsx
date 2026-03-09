"use client"

import * as React from "react"
import { type Socket } from "socket.io-client"

import { API_URL, authHeaders, getToken, getTokenPayload } from "@/lib/api"
import { disconnectSocket, getSocket } from "@/lib/socket"
import type { Room } from "@/lib/types"

type ChatContextValue = {
  socket: Socket | null
  rooms: Room[]
  refreshRooms: () => void
  currentUser: { sub: string; email: string } | null
}

const ChatContext = React.createContext<ChatContextValue | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = React.useState<Socket | null>(null)
  const [rooms, setRooms] = React.useState<Room[]>([])
  const currentUser = React.useMemo(() => getTokenPayload(), [])

  const refreshRooms = React.useCallback(() => {
    fetch(`${API_URL}/rooms`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data: Room[]) => setRooms(data))
      .catch(console.error)
  }, [])

  React.useEffect(() => {
    const token = getToken()
    if (!token) return
    const s = getSocket(token)
    setSocket(s)
    refreshRooms()
    return () => {
      disconnectSocket()
    }
  }, [refreshRooms])

  return (
    <ChatContext.Provider value={{ socket, rooms, refreshRooms, currentUser }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const ctx = React.useContext(ChatContext)
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider")
  return ctx
}
