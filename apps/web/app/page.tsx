"use client"

import Link from "next/link"
import { useSyncExternalStore } from "react"

import { Button } from "@workspace/ui/components/button"

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

function getSnapshot() {
  return localStorage.getItem("access_token")
}

function getServerSnapshot() {
  return null
}

export default function Page() {
  const token = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const isAuthenticated = Boolean(token)

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-6">
        <h1 className="text-2xl font-bold">Bienvenue</h1>
        {isAuthenticated ? (
          <Button asChild>
            <Link href="/chat">Accéder au chat</Link>
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/register">S&apos;inscrire</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Se connecter</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
