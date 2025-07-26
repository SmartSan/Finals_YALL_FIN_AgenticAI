
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
