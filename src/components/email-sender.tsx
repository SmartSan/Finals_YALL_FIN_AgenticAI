
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { Separator } from './ui/separator';

interface EmailSenderProps {
    extractedText: string | null;
    combinedImage: string | null;
}

const emailSchema = z.object({
  recipientEmail: z.string().email({ message: "Please enter a valid email address." }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export function EmailSender({ extractedText, combinedImage }: EmailSenderProps) {
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
    });

    const handleSendEmail = async (data: EmailFormValues) => {
        if (!extractedText || !combinedImage) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Cannot send email without receipt data and image.",
            });
            return;
        }

        setIsSending(true);
        try {
            await sendEmail({
                to: data.recipientEmail,
                subject: "Your Scanned Receipt",
                text: `Here is the text from your scanned receipt:\n\n${extractedText}`,
                attachmentDataUri: combinedImage,
            });
            toast({
                title: "Email Sent",
                description: "The receipt has been sent successfully.",
            });
        } catch (error) {
            console.error("Failed to send email", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                variant: "destructive",
                title: "Error Sending Email",
                description: `Failed to send email: ${errorMessage}`,
            });
        } finally {
            setIsSending(false);
        }
    };

    const isDisabled = !extractedText || !combinedImage || isSending;

    return (
        <Card>
            <CardHeader>
                <CardTitle>4. Email Receipt</CardTitle>
                <CardDescription>Send the extracted text and combined image via email.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(handleSendEmail)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email-recipient">Recipient Email</Label>
                        <Input
                            id="email-recipient"
                            type="email"
                            placeholder="recipient@example.com"
                            {...register('recipientEmail')}
                            disabled={isDisabled}
                        />
                        {errors.recipientEmail && <p className="text-sm text-destructive">{errors.recipientEmail.message}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isDisabled}>
                        {isSending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 h-4 w-4" />
                        )}
                        {isSending ? 'Sending...' : 'Send Email'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
