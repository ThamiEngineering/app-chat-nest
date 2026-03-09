export type User = {
  id: string
  username: string | null
  color_custom: string | null
  email: string
}

export type RoomMember = {
  id: string
  userId: string
  hasHistoryAccess: boolean
  joinedAt: string
  user: User
}

export type Room = {
  id: string
  name: string
  isGeneral: boolean
  members: RoomMember[]
}

export type Reaction = {
  id: string
  emoji: string
  userId: string
  user: { id: string; username: string | null }
}

export type Message = {
  id: string
  content: string
  roomId: string
  authorId: string
  createdAt: string
  author: { id: string; username: string | null; color_custom: string | null }
  reactions: Reaction[]
}
