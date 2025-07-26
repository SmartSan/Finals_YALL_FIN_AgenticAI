
"use client";

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Download } from 'lucide-react';
import Image from 'next/image';

interface CombinedOutputProps {
  combinedImage: string | null;
}

export function CombinedOutput({ combinedImage }: CombinedOutputProps) {
  
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
        <CardTitle>3. Download</CardTitle>
        <CardDescription>Download your combined receipt and QR code.</CardDescription>
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
            <Button onClick={handleDownload} disabled={!combinedImage} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Combined Image
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
