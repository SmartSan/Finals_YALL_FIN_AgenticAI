"use client";

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Download, Send, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Input } from './ui/input';
import { useState } from 'react';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { useToast } from '@/hooks/use-toast';

interface CombinedOutputProps {
  combinedImage: string | null;
  extractedText: string | null;
}

const GoogleWalletIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M19.88 5.14C19.03 4 17.61 3 16 3H5C3.34 3 2 4.34 2 6V18C2 19.66 3.34 21 5 21H16C17.61 21 19.03 20 19.88 18.86L22 12L19.88 5.14Z" fill="#4285F4"/>
        <path d="M16 3H5C3.34 3 2 4.34 2 6V18C2 19.66 3.34 21 5 21H16C17.61 21 19.03 20 19.88 18.86L16.81 13.82C16.42 13.12 15.74 12.67 15 12.67H9.24L16 3Z" fill="#EA4335"/>
        <path d="M11.66 8.35L7.22 16.28C6.83 17 7.04 18 7.75 18H15C15.74 18 16.42 17.55 16.81 16.85L18.91 12.98L11.66 8.35Z" fill="#FBBC05"/>
        <path d="M11.66 8.35L7.22 16.28C6.91 16.84 7.15 17.53 7.75 17.8L9.24 12.67H15C15.26 12.67 15.5 12.58 15.7 12.43L11.66 8.35Z" fill="#34A853"/>
    </svg>
);

export function CombinedOutput({ combinedImage, extractedText }: CombinedOutputProps) {
  const [recipient, setRecipient] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  
  const handleDownload = () => {
    if (!combinedImage) return;
    const link = document.createElement('a');
    link.href = combinedImage;
    link.download = 'receipt-with-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendEmail = async () => {
    if (!combinedImage || !extractedText || !recipient) return;
    
    setIsSending(true);
    try {
      await sendEmail({
        to: recipient,
        subject: 'Your Scanned Receipt',
        text: `Here is the text from your scanned receipt:\n\n${extractedText}`,
        attachmentDataUri: combinedImage,
      });

      toast({
        title: 'Email Sent',
        description: `Receipt successfully sent to ${recipient}`,
      });
      setRecipient('');

    } catch(error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
          variant: "destructive",
          title: "Error Sending Email",
          description: errorMessage,
        });
    } finally {
        setIsSending(false);
    }
  }

  const isEmailDisabled = !combinedImage || !extractedText || !recipient || isSending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Export</CardTitle>
        <CardDescription>Download your combined image or email it directly.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center p-4">
          {combinedImage ? (
            <Image src={combinedImage} alt="Combined receipt and QR code" width={500} height={300} style={{objectFit: "contain"}} />
          ) : (
            <p className="text-muted-foreground text-center">Your combined receipt and QR code will appear here.</p>
          )}
        </div>
        
        <div className="space-y-2">
            <Button onClick={handleDownload} disabled={!combinedImage} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Combined Image
            </Button>
            <Button variant="outline" className="w-full">
                <GoogleWalletIcon />
                Add to Google Wallet
            </Button>
            
            <Separator className="my-2"/>

            <div className="space-y-2">
                <Label htmlFor="email-recipient">Recipient Email</Label>
                <Input
                    id="email-recipient"
                    type="email"
                    placeholder="recipient@example.com"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    disabled={!combinedImage || !extractedText || isSending}
                />
            </div>
             <Button onClick={handleSendEmail} disabled={isEmailDisabled} className="w-full">
                {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {isSending ? 'Sending...' : 'Send Email with Attachment'}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
