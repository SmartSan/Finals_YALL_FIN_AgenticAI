"use client";

import QRCode from 'qrcode';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Download, QrCode } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface QrCodeDisplayProps {
  extractedText: string | null;
  isLoading: boolean;
}

export function QrCodeDisplay({ extractedText, isLoading }: QrCodeDisplayProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (extractedText) {
      QRCode.toDataURL(extractedText, {
        width: 512,
        margin: 2,
        color: {
            dark: '#194569', // Deep Blue
            light: '#00000000' // Transparent background
        }
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error(err));
    } else {
      setQrCodeDataUrl(null);
    }
  }, [extractedText]);

  const handleDownload = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = 'qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Generated QR Code</CardTitle>
        <CardDescription>Your QR code is ready. Download or export it.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        <div className="w-full max-w-xs aspect-square bg-gray-100 rounded-lg flex items-center justify-center p-4">
          {isLoading ? (
             <Skeleton className="h-full w-full" />
          ) : qrCodeDataUrl ? (
            <Image src={qrCodeDataUrl} alt="Generated QR Code" width={400} height={400} />
          ) : (
            <div className="flex flex-col items-center text-muted-foreground text-center">
              <QrCode className="h-16 w-16 mb-4" />
              <p>QR code will appear here after uploading a receipt.</p>
            </div>
          )}
        </div>
        <Button onClick={handleDownload} disabled={!qrCodeDataUrl || isLoading} className="w-full max-w-xs">
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
}