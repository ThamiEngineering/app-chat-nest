"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

type User = {
  id: string
  email: string
  username: string | null
  color_custom: string | null
}

function getTokenPayload(): { sub: string } | null {
  const token = localStorage.getItem("access_token")
  if (!token) return null
  try {
    const part = token.split(".")[1]
    if (!part) return null
    return JSON.parse(atob(part)) as { sub: string }
  } catch {
    return null
  }
}

export default function ProfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState("")
  const [color, setColor] = useState("#6366f1")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
      return
    }

    fetch("http://localhost:3001/user/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: User) => {
        setUser(data)
        setUsername(data.username ?? "")
        setColor(data.color_custom ?? "#6366f1")
      })
      .catch(() => router.push("/login"))
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError("")

    const payload = getTokenPayload()
    if (!payload) {
      router.push("/login")
      return
    }

    try {
      const res = await fetch(`http://localhost:3001/user/${payload.sub}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ username, color_custom: color }),
      })

      if (!res.ok) {
        const body = await res.json() as { message?: string | string[] }
        const msg = Array.isArray(body.message) ? body.message[0] : body.message
        setError(msg ?? "Erreur lors de la mise à jour")
        return
      }

      const updated = await res.json() as User
      setUser(updated)
      setSuccess(true)
    } catch {
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex items-center justify-center min-h-svh">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Mon profil</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">Nom d&apos;utilisateur</Label>
              <Input
                id="username"
                type="text"
                placeholder="john_doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="color">Couleur personnalisée</Label>
              <div className="flex items-center gap-2">
                <input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5"
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>
            {success && <p className="text-sm text-green-600">Profil mis à jour !</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Link href="/chat" className="text-sm text-muted-foreground underline text-center">
              Retour au chat
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
