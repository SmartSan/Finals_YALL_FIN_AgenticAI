
"use client";

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Button, buttonVariants } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Download, Send } from 'lucide-react';
import Image from 'next/image';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

interface CombinedOutputProps {
  receiptImage: string | null;
  extractedText: string | null;
}

export function CombinedOutput({ receiptImage, extractedText }: CombinedOutputProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [combinedImage, setCombinedImage] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');

  useEffect(() => {
    if (receiptImage && extractedText) {
      const generateCombinedImage = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const receipt = new window.Image();
        receipt.src = receiptImage;
        receipt.onload = async () => {
          const qrCodeDataUrl = await QRCode.toDataURL(extractedText, { width: receipt.height * 0.4, margin: 1 });
          const qrCode = new window.Image();
          qrCode.src = qrCodeDataUrl;

          qrCode.onload = () => {
            const padding = 30;
            canvas.width = receipt.width + qrCode.width + padding * 3;
            canvas.height = Math.max(receipt.height, qrCode.height) + padding * 2;
            
            ctx.fillStyle = '#F5F5F0'; // Off-white background
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(receipt, padding, padding, receipt.width, receipt.height);

            const qrX = receipt.width + padding * 2;
            const qrY = (canvas.height - qrCode.height) / 2;
            ctx.drawImage(qrCode, qrX, qrY, qrCode.width, qrCode.height);

            setCombinedImage(canvas.toDataURL('image/png'));
          };
        };
      };

      generateCombinedImage();
    } else {
      setCombinedImage(null);
    }
  }, [receiptImage, extractedText]);

  const handleDownload = () => {
    if (!combinedImage) return;
    const link = document.createElement('a');
    link.href = combinedImage;
    link.download = 'receipt-with-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isEmailDisabled = !extractedText || !recipientEmail;
  const mailtoBody = `Here is the text from your scanned receipt. You can attach the downloaded image to this email.\n\n${extractedText}`;
  const mailtoHref = isEmailDisabled 
    ? '#' 
    : `mailto:${recipientEmail}?subject=${encodeURIComponent("Your Scanned Receipt")}&body=${encodeURIComponent(mailtoBody)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Export</CardTitle>
        <CardDescription>Download your combined receipt and QR code, or email the receipt text.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center p-4">
          {combinedImage ? (
            <Image src={combinedImage} alt="Combined receipt and QR code" width={500} height={300} style={{objectFit: "contain"}} />
          ) : (
            <p className="text-muted-foreground text-center">Combined image will appear here.</p>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Step 1: Download Image (Optional)</Label>
            <Button onClick={handleDownload} disabled={!combinedImage} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Combined Image
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Label htmlFor="email-recipient">Step 2: Email Receipt Text</Label>
            <Input 
              id="email-recipient" 
              type="email" 
              placeholder="recipient@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              disabled={!extractedText}
            />
          </div>
          <a
            href={mailtoHref}
            className={cn(
              buttonVariants({ variant: 'secondary' }),
              'w-full',
              isEmailDisabled && 'pointer-events-none opacity-50'
            )}
            aria-disabled={isEmailDisabled}
            tabIndex={isEmailDisabled ? -1 : undefined}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Email
          </a>
          <p className="text-xs text-muted-foreground text-center">
            Note: This will open your default mail client. File attachments are not supported.
          </p>
        </div>

      </CardContent>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Card>
  );
}
