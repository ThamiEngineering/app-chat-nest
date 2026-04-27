import { Separator } from "@workspace/ui/components/separator"

type Props = {
  date: string
}

export function DateSeparator({ date }: Props) {
  return (
    <div className="my-2 flex items-center gap-2 px-4">
      <Separator className="flex-1" />
      <span className="text-xs text-muted-foreground">
        {new Date(date).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </span>
      <Separator className="flex-1" />
    </div>
  )
}
