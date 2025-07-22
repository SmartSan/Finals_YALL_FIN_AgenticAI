"use client"

import { History } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
      <div className="flex-1">
        <h1 className="text-xl font-bold font-headline text-primary">
          QRReceipt
        </h1>
      </div>
      <SidebarTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0">
          <History className="h-5 w-5" />
          <span className="sr-only">Toggle History Sidebar</span>
        </Button>
      </SidebarTrigger>
    </header>
  )
}
