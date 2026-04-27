"use client"

import * as React from "react"

import type { Message } from "@/lib/types"

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"]

type Props = {
  message: Message
  currentUserId: string
  onAddReaction: (messageId: string, emoji: string) => void
  onRemoveReaction: (messageId: string, emoji: string) => void
}

export function MessageItem({ message, currentUserId, onAddReaction, onRemoveReaction }: Props) {
  const [showPicker, setShowPicker] = React.useState(false)

  const color = message.author.color_custom ?? "#6366f1"
  const name = message.author.username ?? message.author.id.slice(0, 8)

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
