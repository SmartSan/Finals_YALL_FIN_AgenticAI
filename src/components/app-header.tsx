
"use client"

import { History, LogOut } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

export function AppHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
      <div className="flex-1">
        <h1 className="text-xl font-bold font-headline text-primary">
          QRReceipt
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <SidebarTrigger asChild>
              <button aria-label="Toggle History Sidebar" className="p-2 rounded-md hover:bg-accent">
                <History className="h-5 w-5" />
              </button>
            </SidebarTrigger>
            <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign Out">
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
