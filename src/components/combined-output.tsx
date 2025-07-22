"use client";

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Download } from 'lucide-react';
import Image from 'next/image';

interface CombinedOutputProps {
  receiptImage: string | null;
  extractedText: string | null;
}

export function CombinedOutput({ receiptImage, extractedText }: CombinedOutputProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [combinedImage, setCombinedImage] = useState<string | null>(null);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">3. Export Combined Image</CardTitle>
        <CardDescription>Download the receipt and QR code as a single image.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center p-4">
          {combinedImage ? (
            <Image src={combinedImage} alt="Combined receipt and QR code" layout="fill" objectFit="contain" />
          ) : (
            <p className="text-muted-foreground text-center">Combined image will appear here.</p>
          )}
        </div>
        <Button onClick={handleDownload} disabled={!combinedImage} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download Combined Image
        </Button>
      </CardContent>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Card>
  );
}
