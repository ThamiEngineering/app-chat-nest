"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { CreateRoomDialog } from "@/components/chat/create-room-dialog"
import { useChatContext } from "@/contexts/chat-context"
import { disconnectSocket } from "@/lib/socket"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"

export function Sidebar() {
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
