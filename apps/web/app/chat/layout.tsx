"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"

import { ChatProvider, useChatContext } from "@/contexts/chat-context"
import { API_URL, authHeaders } from "@/lib/api"
import { disconnectSocket } from "@/lib/socket"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { ScrollArea } from "@workspace/ui/components/scroll-area"

function CreateRoomDialog() {
  const { refreshRooms } = useChatContext()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`${API_URL}/rooms`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      const room = await res.json() as { id: string }
      refreshRooms()
      setOpen(false)
      setName("")
      router.push(`/chat/${room.id}`)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
          + Nouveau salon
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un salon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="room-name">Nom du salon</Label>
            <Input
              id="room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mon salon"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Sidebar() {
  const { rooms } = useChatContext()
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    disconnectSocket()
    localStorage.removeItem("access_token")
    router.push("/login")
  }

  return (
    <aside className="flex w-56 flex-col border-r bg-muted/30">
      <div className="flex items-center justify-between border-b px-3 py-3">
        <span className="font-semibold text-sm">Salons</span>
        <div className="flex gap-1">
          <Link href="/profil">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Profil</Button>
          </Link>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleLogout}>
            ⏏
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="flex flex-col gap-0.5">
          {rooms.map((room) => {
            const isActive = pathname === `/chat/${room.id}`
            return (
              <Link key={room.id} href={`/chat/${room.id}`}>
                <div
                  className={`rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent ${
                    isActive ? "bg-accent font-medium" : ""
                  }`}
                >
                  # {room.name}
                </div>
              </Link>
            )
          })}
        </div>
      </ScrollArea>
      <div className="border-t px-2 py-2">
        <CreateRoomDialog />
      </div>
    </aside>
  )
}

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
