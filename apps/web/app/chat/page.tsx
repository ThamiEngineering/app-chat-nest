"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export default function ChatPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  function handleLogout() {
    localStorage.removeItem("access_token")
    router.push("/login")
  }

  return (
    <div className="flex items-center justify-center min-h-svh">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chat</CardTitle>
          <div className="flex gap-2">
            <Link href="/profil">
              <Button variant="outline" size="sm">Profil</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Bienvenue sur le chat 👋</p>
        </CardContent>
      </Card>
    </div>
  )
}
