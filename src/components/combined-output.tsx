
"use client";

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Download, Send } from 'lucide-react';
import Image from 'next/image';
import { Input } from './ui/input';
import { useState } from 'react';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

interface CombinedOutputProps {
  combinedImage: string | null;
  extractedText: string | null;
}

export function CombinedOutput({ combinedImage, extractedText }: CombinedOutputProps) {
  const [recipient, setRecipient] = useState('');
  
  const handleDownload = () => {
    if (!combinedImage) return;
    const link = document.createElement('a');
    link.href = combinedImage;
    link.download = 'receipt-with-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const mailtoHref = extractedText
    ? `mailto:${recipient}?subject=Your Scanned Receipt&body=${encodeURIComponent(
        `Here is the text from your scanned receipt:\n\n${extractedText}`
      )}`
    : '';

  const isEmailDisabled = !combinedImage || !extractedText || !recipient;

  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Export</CardTitle>
        <CardDescription>Download your combined image, or open your email client to send it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center p-4">
          {combinedImage ? (
            <Image src={combinedImage} alt="Combined receipt and QR code" width={500} height={300} style={{objectFit: "contain"}} />
          ) : (
            <p className="text-muted-foreground text-center">Your combined receipt and QR code will appear here.</p>
          )}
        </div>
        
        <div className="space-y-4">
            <Button onClick={handleDownload} disabled={!combinedImage} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Combined Image
            </Button>
            
            <Separator />

            <div className="space-y-2">
                <Label htmlFor="email-recipient">Recipient Email</Label>
                <Input
                    id="email-recipient"
                    type="email"
                    placeholder="recipient@example.com"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    disabled={!combinedImage || !extractedText}
                />
            </div>
             <Button asChild disabled={isEmailDisabled} className="w-full">
                <a href={isEmailDisabled ? undefined : mailtoHref}>
                  <Send className="mr-2 h-4 w-4" />
                  Send via Email Client
                </a>
            </Button>
            <p className="text-xs text-muted-foreground text-center">
                This will open your default email app. Remember to attach the downloaded image.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
