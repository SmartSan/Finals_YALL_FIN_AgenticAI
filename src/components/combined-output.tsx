
"use client";

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Download, Send } from 'lucide-react';
import Image from 'next/image';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Input } from './ui/input';

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

  const handleSendEmail = () => {
    if (!extractedText || !recipientEmail) return;

    const subject = "Your Scanned Receipt";
    const body = `Here is the text from your scanned receipt:\n\n${extractedText}`;
    
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Export</CardTitle>
        <CardDescription>Download or email your receipt and QR code.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center p-4">
          {combinedImage ? (
            <Image src={combinedImage} alt="Combined receipt and QR code" width={500} height={300} style={{objectFit: "contain"}} />
          ) : (
            <p className="text-muted-foreground text-center">Combined image will appear here.</p>
          )}
        </div>
        <Button onClick={handleDownload} disabled={!combinedImage} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download Combined Image
        </Button>

        <Separator className="my-4" />
        
        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground">Email Receipt Text</p>
          <div className="space-y-2">
            <Label htmlFor="email-recipient">Recipient Email</Label>
            <Input 
              id="email-recipient" 
              type="email" 
              placeholder="recipient@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              disabled={!extractedText}
            />
          </div>
          <Button 
            onClick={handleSendEmail} 
            disabled={!extractedText || !recipientEmail} 
            className="w-full"
            variant="secondary"
          >
            <Send className="mr-2 h-4 w-4" />
            Send Email
          </Button>
        </div>

      </CardContent>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Card>
  );
}
