
"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Send } from 'lucide-react';

interface EmailSenderProps {
  extractedText: string | null;
}

export function EmailSender({ extractedText }: EmailSenderProps) {
  const [recipientEmail, setRecipientEmail] = useState('');

  const handleSendEmail = () => {
    if (!extractedText || !recipientEmail) return;

    const subject = "Your Scanned Receipt";
    const body = `Here is the text from your scanned receipt:\n\n${extractedText}`;
    
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
  };

  const isDisabled = !extractedText;

  return (
    <Card>
      <CardHeader>
        <CardTitle>4. Email Receipt</CardTitle>
        <CardDescription>Send the extracted receipt text to an email address.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-recipient">Recipient Email</Label>
          <Input 
            id="email-recipient" 
            type="email" 
            placeholder="recipient@example.com"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            disabled={isDisabled}
          />
        </div>
        <Button 
          onClick={handleSendEmail} 
          disabled={isDisabled || !recipientEmail} 
          className="w-full"
        >
          <Send className="mr-2 h-4 w-4" />
          Send Email
        </Button>
      </CardContent>
    </Card>
  );
}
