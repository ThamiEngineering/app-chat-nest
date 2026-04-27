"use client"

import * as React from "react"

import { API_URL, authHeaders } from "@/lib/api"
import type { Room, User } from "@/lib/types"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"

type Props = {
  room: Room
}

export function InviteMemberDialog({ room }: Props) {
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
