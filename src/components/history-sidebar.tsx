
"use client";

import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import { RefreshCw, Trash2, LogIn } from "lucide-react";
import { useHistory } from "@/hooks/use-history";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function HistorySidebar() {
  const { user, loading: isAuthLoading, signInWithGoogle } = useAuth();
  const { history, clearHistory, isLoading: isHistoryLoading, isClearingHistory } = useHistory();

  const renderContent = () => {
    if (isAuthLoading) {
       return (
        <div className="p-4 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }
    
    if (!user) {
      return (
        <div className="p-4 text-center text-sm text-muted-foreground flex flex-col items-center justify-center h-full space-y-4">
           <LogIn className="h-10 w-10 text-gray-400" />
           <p>Sign in to view your scan history.</p>
           <Button onClick={signInWithGoogle} size="sm">
              Sign In with Google
           </Button>
        </div>
      );
    }
    
    if (isHistoryLoading) {
      return (
        <div className="p-4 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }
    
    if (history.length === 0) {
       return (
         <div className="p-4 text-center text-sm text-muted-foreground">
           Your generated receipts will appear here.
         </div>
       );
    }

    return (
      <div className="p-4 space-y-4">
        {history.map((item) => (
          <div key={item.id} className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
            </p>
            <div className="relative aspect-[2/3] w-full rounded-md border overflow-hidden">
              <Image
                src={item.receiptImageUri}
                alt="Scanned receipt"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {item.extractedText}
            </p>
            <Separator/>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel>Scan History</SidebarGroupLabel>
        </SidebarGroup>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <ScrollArea className="h-full">
         {renderContent()}
        </ScrollArea>
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <Button
          variant="destructive"
          className="w-full"
          onClick={clearHistory}
          disabled={!user || isHistoryLoading || history.length === 0 || isClearingHistory}
        >
          {isClearingHistory ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          {isClearingHistory ? 'Clearing...' : 'Clear History'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
