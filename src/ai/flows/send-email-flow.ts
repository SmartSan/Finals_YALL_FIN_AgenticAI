
'use server';
/**
 * @fileOverview An AI agent for sending an email with an attachment using Resend.
 *
 * - sendEmail - A function that handles sending the email.
 * - SendEmailInput - The input type for the sendEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Resend } from 'resend';

const SendEmailInputSchema = z.object({
  to: z.string().email().describe('The recipient email address.'),
  subject: z.string().describe('The subject of the email.'),
  text: z.string().describe('The text body of the email.'),
  attachmentDataUri: z
    .string()
    .describe('The image to attach, as a data URI.'),
});
export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(input: SendEmailInput): Promise<void> {
  return sendEmailFlow(input);
}

const sendEmailFlow = ai.defineFlow(
  {
    name: 'sendEmailFlow',
    inputSchema: SendEmailInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    if (!process.env.RESEND_API_KEY) {
      throw new Error(
        'RESEND_API_KEY is not set. Please add it to your .env file.'
      );
    }
    
    // Use the verified domain from env, or default to the Resend test address.
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const { to, subject, text, attachmentDataUri } = input;

    // Resend expects the base64 data without the data URI prefix
    const base64Data = attachmentDataUri.split(',')[1];
    const attachmentBuffer = Buffer.from(base64Data, 'base64');

    try {
      await resend.emails.send({
        from: fromAddress,
        to: to,
        subject: subject,
        text: text,
        attachments: [
          {
            filename: 'receipt.png',
            content: attachmentBuffer,
          },
        ],
      });
    } catch (error) {
      console.error('Error sending email with Resend:', error);
      // Re-throw the error to be caught by the frontend
      throw new Error('Failed to send email.');
    }
  }
);
