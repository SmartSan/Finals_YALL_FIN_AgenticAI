
"use client";

import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import { RefreshCw, Trash2 } from "lucide-react";
import { useHistory } from "@/hooks/use-history";
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
  const { history, clearHistory, isLoading, isClearingHistory, isAuthLoading } = useHistory();

  const renderContent = () => {
    if (isLoading || isAuthLoading) {
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
          disabled={isAuthLoading || isLoading || history.length === 0 || isClearingHistory}
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
