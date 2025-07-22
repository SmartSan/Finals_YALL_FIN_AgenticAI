
"use client"

import { History } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AuthButton } from "@/components/auth-button"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
      <div className="flex-1">
        <h1 className="text-xl font-bold font-headline text-primary">
          QRReceipt
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <AuthButton />
        <SidebarTrigger asChild>
          <button aria-label="Toggle History Sidebar" className="p-2 rounded-md hover:bg-accent">
            <History className="h-5 w-5" />
          </button>
        </SidebarTrigger>
      </div>
    </header>
  )
}
