"use client"

import { useParams } from "next/navigation"
import * as React from "react"

import { useChatContext } from "@/contexts/chat-context"
import { API_URL, authHeaders } from "@/lib/api"
import type { Message, Room, User } from "@/lib/types"
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
import { Separator } from "@workspace/ui/components/separator"
import { Switch } from "@workspace/ui/components/switch"

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"]

// ─── Typing indicator ───────────────────────────────────────────────────────

function TypingIndicator({ typingUsers }: { typingUsers: Map<string, string> }) {
  if (typingUsers.size === 0) return null
  const names = Array.from(typingUsers.values())
  let text: string
  if (names.length === 1) text = `${names[0]} est en train d'écrire...`
  else if (names.length === 2) text = `${names[0]} et ${names[1]} sont en train d'écrire...`
  else text = `${names.length} personnes sont en train d'écrire...`
  return <p className="px-4 py-1 text-xs text-muted-foreground italic">{text}</p>
}

// ─── Message item ────────────────────────────────────────────────────────────

function MessageItem({
  message,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
}: {
  message: Message
  currentUserId: string
  onAddReaction: (messageId: string, emoji: string) => void
  onRemoveReaction: (messageId: string, emoji: string) => void
}) {
  const [showPicker, setShowPicker] = React.useState(false)
  const color = message.author.color_custom ?? "#6366f1"
  const name = message.author.username ?? message.author.id.slice(0, 8)

  // Group reactions by emoji
  const grouped = React.useMemo(() => {
    const map = new Map<string, string[]>()
    for (const r of message.reactions) {
      const users = map.get(r.emoji) ?? []
      users.push(r.user.username ?? r.userId)
      map.set(r.emoji, users)
    }
    return map
  }, [message.reactions])

  const hasReacted = (emoji: string) =>
    message.reactions.some((r) => r.emoji === emoji && r.userId === currentUserId)

  return (
    <div className="group flex flex-col gap-1 px-4 py-1.5 hover:bg-muted/30 rounded-md">
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-sm" style={{ color }}>
          {name}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <p className="text-sm leading-relaxed">{message.content}</p>

      {/* Reactions */}
      <div className="flex flex-wrap items-center gap-1">
        {Array.from(grouped.entries()).map(([emoji, users]) => (
          <button
            key={emoji}
            onClick={() =>
              hasReacted(emoji)
                ? onRemoveReaction(message.id, emoji)
                : onAddReaction(message.id, emoji)
            }
            title={users.join(", ")}
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors hover:bg-accent ${
              hasReacted(emoji) ? "border-primary bg-primary/10" : "border-border"
            }`}
          >
            {emoji} {users.length}
          </button>
        ))}

        {/* Emoji picker */}
        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowPicker((v) => !v)}
            className="flex items-center rounded-full border border-border px-2 py-0.5 text-xs hover:bg-accent"
          >
            +
          </button>
          {showPicker && (
            <div className="absolute bottom-full left-0 mb-1 flex gap-1 rounded-lg border bg-popover p-1.5 shadow-md z-10">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    hasReacted(emoji)
                      ? onRemoveReaction(message.id, emoji)
                      : onAddReaction(message.id, emoji)
                    setShowPicker(false)
                  }}
                  className="rounded p-1 text-base hover:bg-accent"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Invite member dialog ────────────────────────────────────────────────────

function InviteMemberDialog({ room }: { room: Room }) {
  const [open, setOpen] = React.useState(false)
  const [users, setUsers] = React.useState<User[]>([])
  const [selectedId, setSelectedId] = React.useState("")
  const [hasHistoryAccess, setHasHistoryAccess] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const memberIds = new Set(room.members.map((m) => m.userId))

  React.useEffect(() => {
    if (!open) return
    fetch(`${API_URL}/user`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data: User[]) => setUsers(data.filter((u) => !memberIds.has(u.id))))
      .catch(console.error)
  }, [open])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId) return
    setLoading(true)
    await fetch(`${API_URL}/rooms/${room.id}/members`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ userId: selectedId, hasHistoryAccess }),
    })
    setLoading(false)
    setOpen(false)
    setSelectedId("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Inviter</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter dans #{room.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Utilisateur</Label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              required
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="">Choisir...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username ?? u.email}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="history-access">Accès à l&apos;historique</Label>
            <Switch
              id="history-access"
              checked={hasHistoryAccess}
              onCheckedChange={setHasHistoryAccess}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !selectedId}>
              {loading ? "Invitation..." : "Inviter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const { socket, rooms, currentUser } = useChatContext()

  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [typingUsers, setTypingUsers] = React.useState<Map<string, string>>(new Map())
  const typingTimers = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const room = rooms.find((r) => r.id === roomId)

  // Fetch history
  React.useEffect(() => {
    if (!roomId) return
    fetch(`${API_URL}/rooms/${roomId}/messages`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data: Message[]) => setMessages(data))
      .catch(console.error)
  }, [roomId])

  // Socket events
  React.useEffect(() => {
    if (!socket || !roomId) return

    socket.emit("joinRoom", roomId)

    function onNewMessage(msg: Message) {
      setMessages((prev) => [...prev, msg])
    }

    function onUserTyping({ userId, username }: { userId: string; username: string }) {
      if (userId === currentUser?.sub) return
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

    function onReactionUpdated({ messageId, reactions }: { messageId: string; reactions: Message["reactions"] }) {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
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
  }, [socket, roomId, currentUser])

  // Scroll to bottom on new messages
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
    // Look up username from current user's room membership
    const member = room?.members.find((m) => m.userId === currentUser?.sub)
    socket.emit("typing", {
      roomId,
      username: member?.user.username ?? currentUser?.email ?? "",
    })
  }

  function handleAddReaction(messageId: string, emoji: string) {
    socket?.emit("addReaction", { messageId, emoji, roomId })
  }

  function handleRemoveReaction(messageId: string, emoji: string) {
    socket?.emit("removeReaction", { messageId, emoji, roomId })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="font-semibold"># {room?.name ?? "..."}</h2>
          <p className="text-xs text-muted-foreground">
            {room?.members.length ?? 0} membre{(room?.members.length ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
        {room && !room.isGeneral && <InviteMemberDialog room={room} />}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-2 py-3">
        <div className="flex flex-col gap-0.5">
          {messages.map((msg, i) => (
            <React.Fragment key={msg.id}>
              {i > 0 &&
                new Date(msg.createdAt).toDateString() !==
                  new Date(messages[i - 1]!.createdAt).toDateString() && (
                  <div className="my-2 flex items-center gap-2 px-4">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                    <Separator className="flex-1" />
                  </div>
                )}
              <MessageItem
                message={msg}
                currentUserId={currentUser?.sub ?? ""}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
              />
            </React.Fragment>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Typing + Input */}
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
