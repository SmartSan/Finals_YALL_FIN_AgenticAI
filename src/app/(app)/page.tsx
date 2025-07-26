
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { CombinedOutput } from '@/components/combined-output';
import { HistorySidebar } from '@/components/history-sidebar';
import { QrCodeDisplay } from '@/components/qr-code-display';
import { ReceiptUploader } from '@/components/receipt-uploader';
import { useToast } from '@/hooks/use-toast';
import { extractReceiptData } from '@/ai/flows/extract-receipt-data';
import { useHistory, HistoryProvider } from '@/hooks/use-history';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmailSender } from '@/components/email-sender';
import QRCode from 'qrcode';


function HomePageContent() {
  const { toast } = useToast();
  const { addHistoryItem } = useHistory();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [receiptImage, setReceiptImage] = React.useState<string | null>(null);
  const [extractedText, setExtractedText] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [combinedImage, setCombinedImage] = React.useState<string | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);


  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  React.useEffect(() => {
    if (receiptImage && extractedText) {
      const generateCombinedImage = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const receipt = new window.Image();
        receipt.src = receiptImage;
        receipt.onload = async () => {
          // A little smaller to not overwhelm receipt
          const qrCodeDataUrl = await QRCode.toDataURL(extractedText, { width: receipt.height * 0.5, margin: 1 });
          const qrCode = new window.Image();
          qrCode.src = qrCodeDataUrl;

          qrCode.onload = () => {
            const padding = 30; // 30px padding
            const spacing = 20; // 20px space between receipt and QR code
            
            // Set canvas dimensions
            canvas.width = receipt.width + spacing + qrCode.width + padding * 2;
            canvas.height = Math.max(receipt.height, qrCode.height) + padding * 2;
            
            // Fill background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw receipt image
            ctx.drawImage(receipt, padding, padding);

            // Draw QR code
            const qrX = padding + receipt.width + spacing;
            const qrY = padding + (receipt.height - qrCode.height) / 2;
            ctx.drawImage(qrCode, qrX, qrY);

            setCombinedImage(canvas.toDataURL('image/png'));
          };
           qrCode.onerror = () => {
             console.error("Failed to load QR code image for canvas.");
          }
        };
        receipt.onerror = () => {
           console.error("Failed to load receipt image for canvas.");
        }
      };

      generateCombinedImage();
    } else {
      setCombinedImage(null);
    }
  }, [receiptImage, extractedText]);

  if (loading || !user) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <AppHeader />
        <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4 p-4 text-center">
                 <Skeleton className="h-10 w-48" />
                 <Skeleton className="h-6 w-64" />
                 <div className="mt-4">
                  <Skeleton className="h-64 w-full max-w-lg" />
                 </div>
            </div>
        </div>
      </div>
    );
  }

  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setReceiptImage(null);
    setExtractedText(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const imageDataUri = reader.result as string;
        setReceiptImage(imageDataUri);

        const result = await extractReceiptData({ receiptDataUri: imageDataUri });
        const text = result.extractedData;

        if (!text) {
          throw new Error("Could not extract text from the receipt.");
        }

        setExtractedText(text);

        await addHistoryItem({
          receiptImageUri: imageDataUri,
          extractedText: text,
        });

        toast({
          title: "Success",
          description: "Receipt processed and saved to your history.",
        });
      } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to process receipt: ${errorMessage}`,
        });
        setReceiptImage(null);
        setExtractedText(null);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to read the image file.",
      });
      setIsLoading(false);
    };
  };

  const handleReset = () => {
    setReceiptImage(null);
    setExtractedText(null);
    setCombinedImage(null);
  }

  return (
    <SidebarProvider>
       <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="flex flex-col h-screen bg-background">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden">
          <HistorySidebar />
          <div className="flex-1 flex flex-col">
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                  <div className="space-y-8">
                    <ReceiptUploader
                      onUpload={handleImageUpload}
                      isLoading={isLoading}
                      receiptImage={receiptImage}
                      onReset={handleReset}
                    />
                    <QrCodeDisplay extractedText={extractedText} isLoading={isLoading} />
                  </div>
                  <div className="space-y-8">
                    <CombinedOutput combinedImage={combinedImage} />
                    <EmailSender extractedText={extractedText} combinedImage={combinedImage} />
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}


export default function HomePage() {
  return (
    <AuthProvider>
        <HistoryProvider>
          <HomePageContent />
        </HistoryProvider>
    </AuthProvider>
  );
}
