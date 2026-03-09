"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { useChatContext } from "@/contexts/chat-context"

export default function ChatPage() {
  const { rooms } = useChatContext()
  const router = useRouter()

  useEffect(() => {
    if (rooms.length === 0) return
    const general = rooms.find((r) => r.isGeneral) ?? rooms[0]
    if (general) router.replace(`/chat/${general.id}`)
  }, [rooms, router])

  return null
}
