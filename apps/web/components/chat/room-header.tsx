import { InviteMemberDialog } from "@/components/chat/invite-member-dialog"
import type { Room } from "@/lib/types"

type Props = {
  room: Room | undefined
}

export function RoomHeader({ room }: Props) {
  const memberCount = room?.members.length ?? 0

  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div>
        <h2 className="font-semibold"># {room?.name ?? "..."}</h2>
        <p className="text-xs text-muted-foreground">
          {memberCount} membre{memberCount > 1 ? "s" : ""}
        </p>
      </div>
      {room && !room.isGeneral && <InviteMemberDialog room={room} />}
    </div>
  )
}
