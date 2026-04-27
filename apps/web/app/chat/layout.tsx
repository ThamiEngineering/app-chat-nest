"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Sidebar } from "@/components/chat/sidebar"
import { ChatProvider } from "@/contexts/chat-context"

function ChatLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  React.useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) router.push("/login")
  }, [router])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  )
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <ChatLayoutInner>{children}</ChatLayoutInner>
    </ChatProvider>
  )
}
