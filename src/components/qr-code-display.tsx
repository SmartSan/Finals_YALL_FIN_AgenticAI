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

const GoogleWalletIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M19.88 5.14C19.03 4 17.61 3 16 3H5C3.34 3 2 4.34 2 6V18C2 19.66 3.34 21 5 21H16C17.61 21 19.03 20 19.88 18.86L22 12L19.88 5.14Z" fill="#4285F4"/>
        <path d="M16 3H5C3.34 3 2 4.34 2 6V18C2 19.66 3.34 21 5 21H16C17.61 21 19.03 20 19.88 18.86L16.81 13.82C16.42 13.12 15.74 12.67 15 12.67H9.24L16 3Z" fill="#EA4335"/>
        <path d="M11.66 8.35L7.22 16.28C6.83 17 7.04 18 7.75 18H15C15.74 18 16.42 17.55 16.81 16.85L18.91 12.98L11.66 8.35Z" fill="#FBBC05"/>
        <path d="M11.66 8.35L7.22 16.28C6.91 16.84 7.15 17.53 7.75 17.8L9.24 12.67H15C15.26 12.67 15.5 12.58 15.7 12.43L11.66 8.35Z" fill="#34A853"/>
    </svg>
);


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
        <div className="w-full max-w-xs space-y-2">
            <Button onClick={handleDownload} disabled={!qrCodeDataUrl || isLoading} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
            <Button variant="outline" className="w-full">
                <GoogleWalletIcon />
                Add to Google Wallet
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
