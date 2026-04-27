type Props = {
  typingUsers: Map<string, string>
}

export function TypingIndicator({ typingUsers }: Props) {
  if (typingUsers.size === 0) return null

  const names = Array.from(typingUsers.values())
  let text: string
  if (names.length === 1) text = `${names[0]} est en train d'écrire...`
  else if (names.length === 2) text = `${names[0]} et ${names[1]} sont en train d'écrire...`
  else text = `${names.length} personnes sont en train d'écrire...`

  return <p className="px-4 py-1 text-xs text-muted-foreground italic">{text}</p>
}
