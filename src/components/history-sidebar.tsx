"use client";

import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from "lucide-react";
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

export function HistorySidebar() {
  const { history, clearHistory, isLoaded } = useHistory();

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
          {isLoaded && history.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Your generated receipts will appear here.
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {history.map((item) => (
                <div key={item.id} className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </p>
                  <Image
                    src={item.receiptImageUri}
                    alt="Scanned receipt"
                    width={200}
                    height={300}
                    className="rounded-md border object-cover"
                  />
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {item.extractedText}
                  </p>
                  <Separator/>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <Button
          variant="destructive"
          className="w-full"
          onClick={clearHistory}
          disabled={history.length === 0}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear History
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
